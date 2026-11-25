import { serve } from "@hono/node-server";
import { Hono } from "hono";
import nodemailer from "nodemailer";
import { randomBytes } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { loginPage } from "./login-page.ts";

const PASSWORD = process.env.ADMIN_PASSWORD || "";
const TO_EMAIL = process.env.WHITELIST_EMAIL || "";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const PORT = Number(process.env.PORT || 3002);
const DB_PATH = process.env.AUTH_DB_PATH || "/srv/apps/auth-service/auth.db";
const RP_ID = "bh2xol.com";
const RP_NAME = "BH2XOL";

function sha256HexToApkOrigin(hex: string): string {
  return "android:apk-key-hash:" + Buffer.from(hex.replace(/:/g, ""), "hex").toString("base64url");
}

const EXPECTED_ORIGINS = [
  "https://auth.bh2xol.com",
  "https://log.bh2xol.com",
  "https://status.bh2xol.com",
  // Release Android APK key hash
  sha256HexToApkOrigin("10:55:1C:DF:C9:EE:84:BF:68:6F:71:67:7E:3E:C8:56:5C:29:5A:10:41:95:A5:3A:75:17:BC:F4:66:56:B8:81"),
];

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS passkeys (
    id TEXT PRIMARY KEY,
    public_key BLOB NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    transports TEXT NOT NULL DEFAULT '[]',
    name TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
`);

const transporter = nodemailer.createTransport({
  host: "smtp.qiye.aliyun.com",
  port: 465,
  secure: true,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

const pendingOtp = new Map<string, { code: string; exp: number; tries: number }>();
const regChallenges = new Map<string, { challenge: string; exp: number }>();
const authChallenges = new Map<string, { challenge: string; exp: number }>();
const loginFailures = new Map<string, { count: number; lockUntil: number }>();

function createSessionToken(): string {
  const token = randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
  db.prepare("INSERT INTO sessions (token, expires_at) VALUES (?, ?)").run(token, expiresAt);
  return token;
}

function isTokenValid(token: string): boolean {
  if (!token) return false;
  const row = db.prepare("SELECT expires_at FROM sessions WHERE token = ?").get(token) as { expires_at: number } | undefined;
  if (!row) return false;
  if (row.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return false;
  }
  return true;
}

function extractToken(c: any): string {
  const auth = c.req.header("Authorization") || "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i);
  if (bearer) return bearer[1].trim();
  const cookie = c.req.header("Cookie") || "";
  const m = cookie.match(/admin_token=([^;]+)/);
  return m ? m[1].trim() : "";
}

function setSessionCookie(c: any, token: string) {
  c.header("Set-Cookie", `admin_token=${token}; Domain=.bh2xol.com; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=604800`);
}

interface PasskeyRow {
  id: string;
  public_key: Uint8Array;
  counter: number;
  transports: string;
  name: string;
  created_at: string;
}

const app = new Hono();

// ---- 邮箱密码 + 验证码登录 ----
app.post("/login", async (c) => {
  const ip = (c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "local").split(",")[0].trim();
  const now = Date.now();
  const fail = loginFailures.get(ip);
  if (fail && fail.lockUntil > now) {
    const mins = Math.ceil((fail.lockUntil - now) / 60000);
    return c.json({ error: `尝试次数过多，请 ${mins} 分钟后再试` }, 429);
  }

  const body = await c.req.json().catch(() => ({}));
  if (String(body.email || "").toLowerCase() !== TO_EMAIL.toLowerCase() || body.password !== PASSWORD) {
    const nextCount = (fail && fail.lockUntil <= now ? 0 : fail?.count || 0) + 1;
    loginFailures.set(ip, {
      count: nextCount,
      lockUntil: nextCount >= 5 ? now + 10 * 60 * 1000 : 0,
    });
    return c.json({ error: "邮箱或密码错误" }, 401);
  }
  loginFailures.delete(ip);
  const existing = pendingOtp.get("admin");
  if (existing && existing.exp > Date.now()) {
    return c.json({ ok: true, reuse: true });
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  pendingOtp.set("admin", { code, exp: Date.now() + 5 * 60 * 1000, tries: 0 });
  try {
    await transporter.sendMail({
      from: `"BH2XOL" <${SMTP_USER}>`,
      to: TO_EMAIL,
      subject: "管理后台登录验证码",
      text: `你的登录验证码是：${code}\n5 分钟内有效，请勿泄露。`,
    });
    return c.json({ ok: true });
  } catch (e: any) {
    console.error("mail error:", e.message);
    return c.json({ error: "邮件发送失败" }, 500);
  }
});

app.post("/verify", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const p = pendingOtp.get("admin");
  if (!p || p.exp < Date.now()) return c.json({ error: "验证码错误或已过期" }, 401);
  if (String(body.code) !== p.code) {
    p.tries += 1;
    if (p.tries >= 5) pendingOtp.delete("admin");
    return c.json({ error: "验证码错误" }, 401);
  }
  pendingOtp.delete("admin");
  const token = createSessionToken();
  setSessionCookie(c, token);
  return c.json({ ok: true, token });
});

// ---- WebAuthn / Passkey ----
app.get("/webauthn/status", (c) => {
  const row = db.prepare("SELECT COUNT(*) AS cnt FROM passkeys").get() as { cnt: number };
  return c.json({ hasPasskey: row.cnt > 0, count: row.cnt });
});

app.post("/webauthn/register/options", async (c) => {
  const token = extractToken(c);
  if (!isTokenValid(token)) return c.json({ error: "请先登录后再绑定 Passkey" }, 401);

  const rows = db.prepare("SELECT id, transports FROM passkeys").all() as PasskeyRow[];
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: "admin",
    userDisplayName: "BH2XOL Admin",
    attestationType: "none",
    excludeCredentials: rows.map((r) => ({
      id: r.id,
      transports: JSON.parse(r.transports || "[]") as AuthenticatorTransportFuture[],
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  const challengeId = randomBytes(16).toString("hex");
  regChallenges.set(challengeId, { challenge: options.challenge, exp: Date.now() + 5 * 60 * 1000 });
  return c.json({ ...options, challengeId });
});

app.post("/webauthn/register/verify", async (c) => {
  const token = extractToken(c);
  if (!isTokenValid(token)) return c.json({ error: "unauthorized" }, 401);

  const body = await c.req.json().catch(() => ({}));
  const challengeId = String(body.challengeId || "");
  const pending = regChallenges.get(challengeId);
  regChallenges.delete(challengeId);
  if (!pending || pending.exp < Date.now()) {
    return c.json({ error: "注册挑战已过期，请重试" }, 400);
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: pending.challenge,
      expectedOrigin: EXPECTED_ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return c.json({ error: "Passkey 验证未通过" }, 400);
    }

    const { credential } = verification.registrationInfo;
    db.prepare(`
      INSERT OR REPLACE INTO passkeys (id, public_key, counter, transports, name, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      credential.id,
      Buffer.from(credential.publicKey),
      credential.counter,
      JSON.stringify(credential.transports || []),
      String(body.name || "Passkey").slice(0, 64),
      new Date().toISOString()
    );
    return c.json({ ok: true, id: credential.id });
  } catch (e: any) {
    console.error("webauthn register error:", e?.message);
    return c.json({ error: e?.message || "Passkey 绑定失败" }, 400);
  }
});

app.post("/webauthn/login/options", async (c) => {
  const rows = db.prepare("SELECT id, transports FROM passkeys").all() as PasskeyRow[];
  if (rows.length === 0) {
    return c.json({ error: "尚未绑定 Passkey，请先用邮箱验证码登录后绑定" }, 400);
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: rows.map((r) => ({
      id: r.id,
      transports: JSON.parse(r.transports || "[]") as AuthenticatorTransportFuture[],
    })),
    userVerification: "preferred",
  });

  const challengeId = randomBytes(16).toString("hex");
  authChallenges.set(challengeId, { challenge: options.challenge, exp: Date.now() + 5 * 60 * 1000 });
  return c.json({ ...options, challengeId });
});

app.post("/webauthn/login/verify", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const challengeId = String(body.challengeId || "");
  const pending = authChallenges.get(challengeId);
  authChallenges.delete(challengeId);
  if (!pending || pending.exp < Date.now()) {
    return c.json({ error: "登录挑战已过期，请重试" }, 400);
  }

  const credId = String(body.response?.id || "");
  const row = db.prepare("SELECT * FROM passkeys WHERE id = ?").get(credId) as PasskeyRow | undefined;
  if (!row) {
    return c.json({ error: "未识别的 Passkey 凭证" }, 401);
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: pending.challenge,
      expectedOrigin: EXPECTED_ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: false,
      credential: {
        id: row.id,
        publicKey: new Uint8Array(row.public_key),
        counter: row.counter,
        transports: JSON.parse(row.transports || "[]") as AuthenticatorTransportFuture[],
      },
    });
    if (!verification.verified) {
      return c.json({ error: "Passkey 验证失败" }, 401);
    }

    db.prepare("UPDATE passkeys SET counter = ? WHERE id = ?").run(
      verification.authenticationInfo.newCounter,
      row.id
    );
    const token = createSessionToken();
    setSessionCookie(c, token);
    return c.json({ ok: true, token });
  } catch (e: any) {
    console.error("webauthn login error:", e?.message);
    return c.json({ error: e?.message || "Passkey 验证失败" }, 401);
  }
});

// ---- Token 校验与注销 ----
app.get("/verify-token", async (c) => {
  const token = c.req.query("token") || "";
  if (!isTokenValid(token)) return c.json({ ok: false }, 401);
  return c.json({ ok: true });
});

app.post("/logout", async (c) => {
  const token = c.req.query("token") || extractToken(c);
  if (token) db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
  return c.json({ ok: true });
});

app.get("/login", (c) => {
  const loggedIn = isTokenValid(extractToken(c));
  const row = db.prepare("SELECT COUNT(*) AS cnt FROM passkeys").get() as { cnt: number };
  return c.html(loginPage(loggedIn, row.cnt > 0));
});

app.get("/health", (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: PORT, hostname: "127.0.0.1" });
console.log(`auth-service on 127.0.0.1:${PORT}`);

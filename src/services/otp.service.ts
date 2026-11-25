import nodemailer from "nodemailer";
import { config } from "../config/env.ts";

interface PendingOtp {
  code: string;
  exp: number;
  tries: number;
}

const pendingOtp = new Map<string, PendingOtp>();

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: { user: config.smtpUser, pass: config.smtpPass },
});

export type OtpIssueResult =
  | { ok: true; reuse?: true }
  | { ok: false; error: string };

/** Issue a 6-digit OTP (reusing an active one if still valid) and send it via SMTP. */
export async function issueAndSendOtp(now: number = Date.now()): Promise<OtpIssueResult> {
  const existing = pendingOtp.get("admin");
  if (existing && existing.exp > now) {
    return { ok: true, reuse: true };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  pendingOtp.set("admin", { code, exp: now + config.otpTtlMs, tries: 0 });

  try {
    await transporter.sendMail({
      from: `"${config.rpName}" <${config.smtpUser}>`,
      to: config.toEmail,
      subject: "管理后台登录验证码",
      text: `你的登录验证码是：${code}\n5 分钟内有效，请勿泄露。`,
    });
    return { ok: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("mail error:", message);
    return { ok: false, error: "邮件发送失败" };
  }
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: string };

/** Verify the submitted OTP code, enforcing expiry and max attempt limits. */
export function verifyOtp(submittedCode: unknown, now: number = Date.now()): OtpVerifyResult {
  const pending = pendingOtp.get("admin");
  if (!pending || pending.exp < now) {
    return { ok: false, error: "验证码错误或已过期" };
  }
  if (String(submittedCode) !== pending.code) {
    pending.tries += 1;
    if (pending.tries >= config.maxOtpTries) {
      pendingOtp.delete("admin");
    }
    return { ok: false, error: "验证码错误" };
  }
  pendingOtp.delete("admin");
  return { ok: true };
}

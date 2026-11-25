import { randomBytes } from "node:crypto";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { config } from "../config/env.ts";
import { createPasskeyRepo } from "../db/passkey.repo.ts";

interface ChallengeRecord {
  challenge: string;
  exp: number;
}

const regChallenges = new Map<string, ChallengeRecord>();
const authChallenges = new Map<string, ChallengeRecord>();

function parseTransports(raw: string | undefined): AuthenticatorTransportFuture[] {
  return JSON.parse(raw || "[]") as AuthenticatorTransportFuture[];
}

export function getPasskeyStatus(repo = createPasskeyRepo()) {
  const count = repo.count();
  return { hasPasskey: count > 0, count };
}

export async function createRegistrationOptions(repo = createPasskeyRepo()) {
  const rows = repo.listSummaries();
  const options = await generateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpId,
    userName: "admin",
    userDisplayName: "BH2XOL Admin",
    attestationType: "none",
    excludeCredentials: rows.map((r) => ({
      id: r.id,
      transports: parseTransports(r.transports),
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  const challengeId = randomBytes(16).toString("hex");
  regChallenges.set(challengeId, {
    challenge: options.challenge,
    exp: Date.now() + config.challengeTtlMs,
  });
  return { ...options, challengeId };
}

export async function verifyAndSaveRegistration(
  challengeId: string,
  response: any,
  name: unknown,
  repo = createPasskeyRepo()
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const pending = regChallenges.get(challengeId);
  regChallenges.delete(challengeId);
  if (!pending || pending.exp < Date.now()) {
    return { ok: false, error: "注册挑战已过期，请重试" };
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: [...config.expectedOrigins],
      expectedRPID: config.rpId,
      requireUserVerification: false,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return { ok: false, error: "Passkey 验证未通过" };
    }

    const { credential } = verification.registrationInfo;
    repo.upsert({
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter,
      transports: JSON.stringify(credential.transports || []),
      name: String(name || "Passkey").slice(0, 64),
      createdAt: new Date().toISOString(),
    });
    return { ok: true, id: credential.id };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("webauthn register error:", message);
    return { ok: false, error: message || "Passkey 绑定失败" };
  }
}

export async function createLoginOptions(repo = createPasskeyRepo()) {
  const rows = repo.listSummaries();
  if (rows.length === 0) {
    return { ok: false as const, error: "尚未绑定 Passkey，请先用邮箱验证码登录后绑定" };
  }

  const options = await generateAuthenticationOptions({
    rpID: config.rpId,
    allowCredentials: rows.map((r) => ({
      id: r.id,
      transports: parseTransports(r.transports),
    })),
    userVerification: "preferred",
  });

  const challengeId = randomBytes(16).toString("hex");
  authChallenges.set(challengeId, {
    challenge: options.challenge,
    exp: Date.now() + config.challengeTtlMs,
  });
  return { ok: true as const, data: { ...options, challengeId } };
}

export async function verifyLoginAssertion(
  challengeId: string,
  response: any,
  repo = createPasskeyRepo()
): Promise<{ ok: true } | { ok: false; status: 400 | 401; error: string }> {
  const pending = authChallenges.get(challengeId);
  authChallenges.delete(challengeId);
  if (!pending || pending.exp < Date.now()) {
    return { ok: false, status: 400, error: "登录挑战已过期，请重试" };
  }

  const credId = String(response?.id || "");
  const row = repo.findById(credId);
  if (!row) {
    return { ok: false, status: 401, error: "未识别的 Passkey 凭证" };
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: pending.challenge,
      expectedOrigin: [...config.expectedOrigins],
      expectedRPID: config.rpId,
      requireUserVerification: false,
      credential: {
        id: row.id,
        publicKey: new Uint8Array(row.public_key),
        counter: row.counter,
        transports: parseTransports(row.transports),
      },
    });
    if (!verification.verified) {
      return { ok: false, status: 401, error: "Passkey 验证失败" };
    }

    repo.updateCounter(row.id, verification.authenticationInfo.newCounter);
    return { ok: true };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("webauthn login error:", message);
    return { ok: false, status: 401, error: message || "Passkey 验证失败" };
  }
}

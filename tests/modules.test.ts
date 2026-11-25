import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { config, sha256HexToApkOrigin } from "../src/config/env.ts";
import { createDatabase } from "../src/db/client.ts";
import { createPasskeyRepo } from "../src/db/passkey.repo.ts";
import { createSessionRepo } from "../src/db/session.repo.ts";
import {
  clearLoginFailures,
  getLockRemainingMinutes,
  recordLoginFailure,
} from "../src/services/rate-limit.service.ts";
import { createSessionToken, isTokenValid, revokeToken } from "../src/services/session.service.ts";
import { loginPage } from "../src/ui/login-page.ts";

describe("config/env", () => {
  it("builds Android APK key hash origin", () => {
    const origin = sha256HexToApkOrigin("10:55:1C:DF");
    assert.ok(origin.startsWith("android:apk-key-hash:"));
    assert.ok(config.expectedOrigins.includes("https://auth.bh2xol.com"));
  });
});

describe("db & session service", () => {
  it("creates, validates, expires, and revokes session tokens", () => {
    const db = createDatabase(":memory:");
    const repo = createSessionRepo(db);

    const token = createSessionToken(repo);
    assert.equal(token.length, 48);
    assert.equal(isTokenValid(token, repo), true);

    revokeToken(token, repo);
    assert.equal(isTokenValid(token, repo), false);

    repo.create("expired", Date.now() - 1000);
    assert.equal(isTokenValid("expired", repo), false);
    assert.equal(repo.findExpiry("expired"), null);
  });

  it("upserts and updates passkey counter", () => {
    const db = createDatabase(":memory:");
    const repo = createPasskeyRepo(db);
    assert.equal(repo.count(), 0);

    repo.upsert({
      id: "cred-1",
      publicKey: new Uint8Array([1, 2, 3]),
      counter: 0,
      transports: '["internal"]',
      name: "TestKey",
      createdAt: "2026-11-25T00:00:00.000Z",
    });
    assert.equal(repo.count(), 1);
    repo.updateCounter("cred-1", 5);
    assert.equal(repo.findById("cred-1")?.counter, 5);
  });
});

describe("rate-limit service", () => {
  it("locks IP after 5 failures and clears on reset", () => {
    const ip = "203.0.113.10";
    const t0 = 1_700_000_000_000;
    for (let i = 0; i < 4; i++) {
      recordLoginFailure(ip, t0);
      assert.equal(getLockRemainingMinutes(ip, t0), 0);
    }
    recordLoginFailure(ip, t0);
    assert.equal(getLockRemainingMinutes(ip, t0), 10);

    clearLoginFailures(ip);
    assert.equal(getLockRemainingMinutes(ip, t0), 0);
  });
});

describe("ui/login-page", () => {
  it("renders passkey binding view when logged in", () => {
    const html = loginPage(true, true);
    assert.ok(html.includes("loggedPanel"));
    assert.ok(html.includes("bindPasskey()"));
  });

  it("renders login tabs when logged out", () => {
    const html = loginPage(false, false);
    assert.ok(html.includes("panelPasskey"));
    assert.ok(html.includes("panelOtp"));
  });
});

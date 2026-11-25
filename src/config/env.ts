/** Convert a colon-separated SHA-256 fingerprint to a WebAuthn Android APK origin. */
export function sha256HexToApkOrigin(hex: string): string {
  return "android:apk-key-hash:" + Buffer.from(hex.replace(/:/g, ""), "hex").toString("base64url");
}

export const config = {
  password: process.env.ADMIN_PASSWORD || "",
  toEmail: process.env.WHITELIST_EMAIL || "",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  port: Number(process.env.PORT || 3002),
  host: "127.0.0.1",
  dbPath: process.env.AUTH_DB_PATH || "/srv/apps/auth-service/auth.db",
  rpId: "bh2xol.com",
  rpName: "BH2XOL",
  expectedOrigins: [
    "https://auth.bh2xol.com",
    "https://log.bh2xol.com",
    "https://status.bh2xol.com",
    // Release Android APK key hash
    sha256HexToApkOrigin("10:55:1C:DF:C9:EE:84:BF:68:6F:71:67:7E:3E:C8:56:5C:29:5A:10:41:95:A5:3A:75:17:BC:F4:66:56:B8:81"),
  ],
  smtp: {
    host: "smtp.qiye.aliyun.com",
    port: 465,
    secure: true,
  },
  cookie: {
    name: "admin_token",
    domain: ".bh2xol.com",
    maxAgeSec: 604800,
  },
  sessionTtlMs: 7 * 24 * 3600 * 1000,
  otpTtlMs: 5 * 60 * 1000,
  challengeTtlMs: 5 * 60 * 1000,
  lockDurationMs: 10 * 60 * 1000,
  maxLoginFailures: 5,
  maxOtpTries: 5,
} as const;

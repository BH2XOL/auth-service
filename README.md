# auth-service

轻量级统一管理后台认证服务，基于 **Hono** + **Node.js SQLite (`node:sqlite`)** 构建，支持 **邮箱密码 + 6 位一次性验证码（OTP）** 与 **WebAuthn / Passkey** 免密登录，并通过跨子域 `HttpOnly` Cookie 与 Bearer Token 提供统一会话校验。

## 核心特性

- **双模式登录**：
  - **邮箱密码 + 邮箱验证码**：校验白名单邮箱与管理员密码后，通过阿里云企业邮箱 SMTP 发送 6 位数字验证码（5 分钟内有效，支持复用与最多 5 次试错）。
  - **WebAuthn / Passkey**：支持生物识别 / 通行密钥注册与登录，适配 `auth.bh2xol.com`、`log.bh2xol.com`、`status.bh2xol.com` 及 Android APK Origin。
- **防爆破限流**：按客户端 IP（`x-forwarded-for` / `x-real-ip`）统计密码错误次数，连续失败 5 次锁定 10 分钟。
- **持久化存储**：使用 Node.js 内置 `DatabaseSync`（WAL 模式）存储会话（7 天有效期）与 Passkey 公钥凭证。
- **SSR 登录页**：内置自适应明暗主题的单页登录与 Passkey 绑定界面。

## 项目结构

```text
src/
├── config/
│   └── env.ts                  # 环境变量、RP 配置、Expected Origins 与常量
├── db/
│   ├── client.ts               # SQLite 连接初始化（WAL）与建表
│   ├── session.repo.ts         # sessions 表数据访问
│   └── passkey.repo.ts         # passkeys 表数据访问
├── services/
│   ├── rate-limit.service.ts   # IP 登录失败计数与锁定
│   ├── otp.service.ts          # 6 位 OTP 生成、校验与 nodemailer 发送
│   ├── session.service.ts      # 会话 Token 签发/校验/注销与 Cookie 处理
│   └── webauthn.service.ts     # WebAuthn 挑战管理与注册/登录验证
├── routes/
│   ├── auth.routes.ts          # 账号认证与 Token 接口
│   ├── webauthn.routes.ts      # Passkey 注册与登录接口
│   └── page.routes.ts          # 登录页与健康检查接口
├── ui/
│   └── login-page.ts           # 登录页 HTML/CSS/JS 模板
├── app.ts                      # Hono 应用装配与路由挂载
└── index.ts                    # 服务启动入口（默认监听 127.0.0.1:3002）
tests/
└── modules.test.ts             # 核心模块单元测试（node:test）
```

## 环境变量

| 变量名 | 说明 | 默认值 |
| --- | --- | --- |
| `ADMIN_PASSWORD` | 管理员登录密码 | `""` |
| `WHITELIST_EMAIL` | 允许登录并接收验证码的邮箱 | `""` |
| `SMTP_USER` | SMTP 发件邮箱账号（`smtp.qiye.aliyun.com:465`） | `""` |
| `SMTP_PASS` | SMTP 发件邮箱密码 / 授权码 | `""` |
| `PORT` | HTTP 服务监听端口 | `3002` |
| `AUTH_DB_PATH` | SQLite 数据库文件路径 | `/srv/apps/auth-service/auth.db` |

## 数据库表结构

- **`sessions`**：`token TEXT PRIMARY KEY`, `expires_at INTEGER NOT NULL`
- **`passkeys`**：`id TEXT PRIMARY KEY`, `public_key BLOB NOT NULL`, `counter INTEGER NOT NULL DEFAULT 0`, `transports TEXT NOT NULL DEFAULT '[]'`, `name TEXT NOT NULL DEFAULT ''`, `created_at TEXT NOT NULL`

## API 接口

| 方法与路径 | 鉴权 | 说明 |
| --- | --- | --- |
| `GET /health` | 无 | 健康检查，返回 `{ ok: true }` |
| `GET /login` | 无 | 返回 SSR 登录页面（已登录时展示 Passkey 绑定面板） |
| `POST /login` | 无 | 校验 `{ email, password }`，触发 IP 限流并发送 6 位 OTP |
| `POST /verify` | 无 | 校验 `{ code }`，签发会话 Token 并设置 `admin_token` Cookie |
| `GET /verify-token?token=...` | 无 | 校验指定 Token 是否有效 |
| `POST /logout` | Token / Cookie | 注销当前或 `?token=` 指定的会话 |
| `GET /webauthn/status` | 无 | 查询是否已绑定 Passkey 及数量 |
| `POST /webauthn/register/options` | 已登录 | 生成 Passkey 注册挑战参数 |
| `POST /webauthn/register/verify` | 已登录 | 验证并保存 Passkey 凭证 |
| `POST /webauthn/login/options` | 无 | 生成 Passkey 登录挑战参数 |
| `POST /webauthn/login/verify` | 无 | 验证 Passkey 签名并签发会话 Token 与 Cookie |

## 本地运行与测试

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 运行单元测试（Node.js 原生测试运行器）
node --test tests/modules.test.ts
```

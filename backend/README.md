# Backend

Node.js + Express 5 API with JWT authentication, email verification, password reset and account
management. Data is stored in MongoDB via the official `mongodb` driver (no ODM).

Detailed conventions, the data model and all endpoints are documented in
[`AGENTS.md`](./AGENTS.md). This README only covers setup and the most important facts.

## Requirements

- Node.js 20+
- Running MongoDB
- A `.env` based on `.env.example`

## Setup

```bash
npm install
cp .env.example .env
npm run dev        # tsx watch main.ts
# or
npm run build      # compile to dist/
npm start          # run dist/main.js
```

The API listens on `PORT` (default `3000`).

## Commands

```bash
npm run dev        # tsx watch main.ts
npm run type-check # tsc --noEmit
npm run build      # compile to dist/
npm start          # run dist/main.js
npm test           # node:test against a temporary MongoDB database
```

`npm test` starts the server as a child process on a free port, uses a temporary database
(`fullstack_template_test_<pid>_<timestamp>`) and drops it afterwards. A local MongoDB at
`mongodb://127.0.0.1:27017` is required; override with `TEST_MONGO_URI`.

## Endpoints

All paths are relative to the server root (no `/api` prefix).

| Method | Path | Description |
|---|---|---|
| POST | `/auth/sign-up` | Create an account (`201`) |
| POST | `/auth/sign-in` | Sign in, returns an access token and sets the refresh cookie |
| POST | `/auth/sign-out` | Clear the refresh cookie |
| POST | `/auth/refresh` | Exchange the refresh cookie for a new access token |
| GET | `/auth/verify-email?token=…` | Verify an email address |
| POST | `/auth/verify-email/resend` | Resend the verification mail |
| POST | `/auth/forgot-password` | Request a password reset mail (always generic) |
| POST | `/auth/reset-password` | Set a new password with a reset token |
| GET | `/users/me` | Current user (Bearer token) |
| DELETE | `/users/me` | Delete the current account |
| PATCH | `/account` | Change name, email and/or password |
| GET | `/account/confirm-email?token=…` | Confirm an email change |

Errors are returned as `{ "message": "…" }` with a matching status. Unknown routes return
`404 { "message": "Not found" }` as JSON.

## Input rules

- `name`: 3–50 characters, `^[a-zA-Z0-9._-]+$`, unique
- `email`: trimmed and lowercased, unique
- `password`: 8–128 characters with uppercase, lowercase and a number; never trimmed

## Email

Without `SMTP_HOST` and outside production, no mail is sent: the verification/reset link is
written to the log instead, so the template works without a mail server. In production SMTP is
required; a failing signup mail rolls the new user back and returns `502`.

## Structure

```
main.ts                 bootstrap, middleware, routes, 404 and error handler
src/
  config/               environment + security configuration
  db/mongo.ts           MongoDB connection and unique indexes
  middlewares/          authUser, central error handler
  utils/                logger, mailer, normalize, password, cookies, catchAsync
  features/auth         sign-up/in/out, refresh, verify email, password reset
  features/user         /users endpoints
  features/account      account updates and email change
test/                   node:test API tests
dist/                   compiled output (npm run build)
```

New features follow the `src/features/user/` structure and are implemented with the
[`create-feature-backend` skill](../.opencode/skills/create-feature-backend/SKILL.md). Its
[architecture reference](../.opencode/skills/create-feature-backend/references/architecture.md)
describes the router → controller → service → model dependencies and the API-test conventions.

## Security notes

### Nodemailer advisory (Stand 2026-11-01)

`nodemailer@8.0.11` is currently flagged by `npm audit` (affected range `<=10.1.3`).
A complete fix requires a major upgrade to `nodemailer@10.3.1`; this is pending.

The mailer uses only `createTransport()` and `sendMail()` with `from`, a validated
`to` address, a fixed `subject` and generated `html`. It does not use `raw`,
`resolveContent()`, attachments, DKIM, custom DNS, or the
`disableFileAccess`/`disableUrlAccess` sandbox options.

- Helmet, strict CORS, secure cookies and rate limits are enabled only in production.
- Access tokens are stateless JWTs; the refresh token only lives in an HttpOnly cookie.
- Passwords are hashed with bcrypt.
- Sensitive tokens are stored as SHA-256 hashes and removed after use.
- Existing sessions are **not** revoked on password change or reset (see open points in
  `AGENTS.md`).

### Access tokens after account deletion

Access tokens (default `1h`) are checked only for signature and expiry, not for the
existence of the user. Protected routes called with the token of a deleted user
therefore return `404` or `200` with `errorMessages`, without changing any data. The
refresh path checks the user's existence and returns `401 Session expired`, so a
deleted user cannot obtain new access tokens.

A user-existence check in `authUser` is deferred until more state-changing routes or
real token revocation are added.

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
npm run dev        # nodemon
# or
node main.js       # without watch
```

The API listens on `PORT` (default `3000`).

## Commands

```bash
npm run dev        # nodemon main.js
node main.js       # without watch
npm test           # node:test against a temporary MongoDB database
node --check <file>  # syntax check
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
| GET | `/users/:id` | Public user data |
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
main.js                 bootstrap, middleware, routes, 404 and error handler
src/
  config/               environment + security configuration
  db/mongo.js           MongoDB connection and unique indexes
  middlewares/          authUser, central error handler
  utils/                logger, mailer, normalize, password, cookies, catchAsync
  modules/auth          sign-up/in/out, refresh, verify email, password reset
  modules/user          /users endpoints
  modules/account       account updates and email change
test/                   node:test API tests
```

## Security notes

- Helmet, strict CORS, secure cookies and rate limits are enabled only in production.
- Access tokens are stateless JWTs; the refresh token only lives in an HttpOnly cookie.
- Passwords are hashed with bcrypt.
- Sensitive tokens are stored as SHA-256 hashes and removed after use.
- Existing sessions are **not** revoked on password change or reset (see open points in
  `AGENTS.md`).

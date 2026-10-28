# Fullstack Template

A minimal fullstack starter: Vue 3 frontend, Express 5 API, MongoDB, JWT authentication,
and a plain-CSS design system with light/dark/system themes.

- **Frontend:** Vue 3, Vite, Pinia, vue-router, vue-i18n, Vitest — no UI framework, no TypeScript
- **Backend:** Node.js, Express 5, official `mongodb` driver (no ODM), JWT, Pino
- **Styling:** plain CSS with custom properties (no SCSS), tokens in `frontend/src/shared/styles`
- **Auth:** access token in memory, refresh token in an HttpOnly cookie, email verification,
  password reset and account management

## Requirements

- **Node.js** `^22.18.0` or `>=24.12.0` (required by the frontend; the backend itself runs on 20+)
- **MongoDB** reachable at `mongodb://127.0.0.1:27017` (or set `MONGO_URI` / `TEST_MONGO_URI`)
- No Docker setup is included

## Quick start

From the repository root, install both apps and create the env files:

```bash
cd backend
npm install
cp .env.example .env

cd ../frontend
npm install
cp .env.example .env
```

Run each app in its own terminal:

```bash
# terminal 1 — API on http://localhost:3000
cd backend
npm run dev

# terminal 2 — app on http://localhost:5173
cd frontend
npm run dev
```

Open <http://localhost:5173>. Register an account; in development the verification link is
written to the backend log instead of being emailed (see [Email in development](#email-in-development)).

## Configuration

Everything you have to adjust lives in two env files plus one CORS config.

### Backend — `backend/.env`

Copy `backend/.env.example` and fill in the values.

| Variable                   | Default                           | Notes                                                                              |
| -------------------------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| `PORT`                     | `3000`                            | Must match `VITE_API_URL` in the frontend.                                         |
| `NODE_ENV`                 | `development`                     | `production` enables Helmet, the CORS whitelist, rate limits and `secure` cookies. |
| `MONGO_URI`                | `mongodb://localhost:27017`       | Connection string.                                                                 |
| `DB_NAME`                  | `appdb`                           | Change this per project.                                                           |
| `JWT_ACCESS_SECRET`        | `change_this`                     | **Must be replaced** — use a long random string.                                   |
| `JWT_REFRESH_SECRET`       | `change_this_too`                 | **Must be replaced.**                                                              |
| `ACCESS_TOKEN_EXPIRES_IN`  | `1h`                              | Access token lifetime.                                                             |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d`                              | Refresh token and cookie lifetime.                                                 |
| `BCRYPT_SALT_ROUNDS`       | `12`                              | bcrypt cost factor.                                                                |
| `SMTP_HOST`                | –                                 | Optional in development, required in production.                                   |
| `SMTP_PORT`                | `587`                             |                                                                                    |
| `SMTP_SECURE`              | `false`                           | `true` for implicit TLS (usually port 465).                                        |
| `SMTP_USER` / `SMTP_PASS`  | –                                 | SMTP credentials.                                                                  |
| `MAIL_FROM`                | `No Reply <no-reply@example.com>` | Sender shown in emails.                                                            |
| `CLIENT_BASE_URL`          | `http://localhost:5173`           | Base URL used for links in emails. Must point to the frontend.                     |

### Frontend — `frontend/.env`

| Variable       | Default                 | Notes                                                             |
| -------------- | ----------------------- | ----------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL, **no trailing slash** and **no `/api` prefix**. |

All requests go through `frontend/src/shared/api/apiFetch.js`. The access token is kept in
memory only; the refresh cookie is sent because `credentials: 'include'` is set.

### Ports and CORS

The frontend dev server uses port **5173**, the backend **3000**. Three places must agree:

1. `PORT` in `backend/.env`
2. `VITE_API_URL` in `frontend/.env`
3. `CLIENT_BASE_URL` in `backend/.env` (for links in emails)

CORS is configured in `backend/src/config/corsConfig.js`:

- **Development:** only `http://localhost:5173` is allowed. If you change the frontend port,
  update `develop.origin` — otherwise the browser blocks every API call.
- **Production:** the origins are placeholders (`https://example.com`, `https://app.example.com`).
  Replace them with your real domains before deploying.

### Email in development

If `SMTP_HOST` is empty and `NODE_ENV` is not `production`, no email is sent: the recipient,
subject and full link are written to the backend log. Sign-up and resend still succeed, so the
template works without a mail server.

In production SMTP is required. A failing sign-up email rolls the new user back and returns `502`.

## Customize for a new project

Work through this checklist after cloning the template:

1. **Env files** — create `backend/.env` and `frontend/.env` and set at least `MONGO_URI`,
   `DB_NAME` and both JWT secrets.
2. **App name** — change `app.name` in `frontend/src/locales/de.json` and
   `frontend/src/locales/en.json`.
3. **Page title** — change `<title>` in `frontend/index.html`.
4. **Package names** — rename `backend/package.json` (`backendboilerplate`) and
   `frontend/package.json` (`frontend`).
5. **Brand** — adjust the palette and typography in
   `frontend/src/shared/styles/tokens.css`; see
   [`frontend/src/shared/styles/README.md`](frontend/src/shared/styles/README.md).
6. **CORS** — set the production origins in `backend/src/config/corsConfig.js`.
7. **Email** — configure `SMTP_*`, `MAIL_FROM` and `CLIENT_BASE_URL` for production.
8. **Features** — remove features you do not need under `frontend/src/features/` and their
   entries in `frontend/src/app/router/index.js`; backend modules are mounted in `backend/main.js`.
9. **Docs** — replace the placeholders in `AGENTS.md` when you rename the project.

## Commands

### Backend (in `backend/`)

```bash
npm install
npm run dev          # nodemon
node main.js         # without watch
npm test             # node:test against a temporary MongoDB database
node --check <file>  # syntax check
```

`npm test` starts the server as a child process on a free port, uses a temporary database
(`fullstack_template_test_<pid>_<timestamp>`) and drops it afterwards. A local MongoDB is
required; override the connection with `TEST_MONGO_URI`.

### Frontend (in `frontend/`)

```bash
npm install
npm run dev        # dev server on port 5173
npm test           # tests once
npm run test:unit  # tests in watch mode
npm run build      # production build
npm run format     # Prettier
```

## Documentation

- [`AGENTS.md`](AGENTS.md) — overall conventions, API contract, definition of done
- [`backend/README.md`](backend/README.md) — backend setup and endpoint overview
- [`backend/AGENTS.md`](backend/AGENTS.md) — backend architecture, data model, endpoints
- [`frontend/AGENTS.md`](frontend/AGENTS.md) — frontend architecture, layout, styling, i18n
- [`frontend/src/features/AGENTS.md`](frontend/src/features/AGENTS.md) — feature structure
  (api → services → store → ui)
- [`frontend/src/shared/styles/README.md`](frontend/src/shared/styles/README.md) — design
  system, tokens, themes and how to adapt them

New features are scaffolded with the `create-feature` skill in `.opencode/skills/create-feature`.

## Troubleshooting

| Symptom                                   | Cause / fix                                                                                                                  |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Browser blocks requests with a CORS error | Frontend port and `corsConfig.develop.origin` differ, or you changed `VITE_API_URL` without restarting Vite.                 |
| `401` after a page reload                 | The refresh cookie is missing. Check that the backend is reachable and `credentials: 'include'` is used (it is by default).  |
| No verification or reset email            | `SMTP_HOST` is empty: open the backend log and copy the link. In production, configure SMTP.                                 |
| `ECONNREFUSED` on startup                 | MongoDB is not running or `MONGO_URI` points to the wrong host.                                                              |
| API calls hit `/api/...` and 404          | There is no `/api` prefix. Use plain paths such as `/users/me`.                                                              |
| Wrong theme flashes on load               | `localStorage.theme` holds an unexpected value; the inline script in `index.html` only accepts `light`, `dark` and `system`. |

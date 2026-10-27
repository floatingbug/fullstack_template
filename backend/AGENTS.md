# Backend

Node.js-Server auf Basis von **Express 5** mit **MongoDB** (offizieller `mongodb`-Treiber, keine ODM), JWT-Authentifizierung, E-Mail-Verifikation und Passwort-Reset.

## Befehle

```bash
npm install          # Abhängigkeiten (node_modules fehlt im Repo)
npm run dev          # nodemon main.js
node main.js         # ohne Watch
npm test             # node:test gegen temporäre MongoDB-Datenbank
```

Voraussetzungen: laufende MongoDB und eine `.env` (Vorlage: `.env.example`).

> **Tests:** `npm test` startet `main.js` als Child-Process auf einem freien Port und legt eine
> temporäre Datenbank `fullstack_template_test_<pid>_<timestamp>` an, die am Ende wieder gelöscht
> wird. Die Tests brauchen eine lokal erreichbare MongoDB (`mongodb://127.0.0.1:27017`,
> überschreibbar mit `TEST_MONGO_URI`). Es gibt weiterhin **kein ESLint/Typecheck**; zusätzlich
> nach Änderungen `node --check <datei>` ausführen.

> **Skill-Hinweis:** `.agents/skills/nodejs-express-server` ist generisch und beschreibt Sequelize/PostgreSQL. Dieser Server nutzt den MongoDB-Treiber ohne ODM — die Empfehlungen dort nicht befolgen.

## Umgebungsvariablen

Gelesen wird ausschließlich in `src/config/index.js` (einzige Ausnahme: `src/utils/logger.js` liest `NODE_ENV`/`LOG_LEVEL` direkt).

| Variable | Default | Zweck |
|---|---|---|
| `PORT` | `3000` | HTTP-Port |
| `NODE_ENV` | `development` | steuert Security/Logging/Cookies/Rate-Limits |
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB-Verbindung |
| `DB_NAME` | `appdb` | Datenbankname |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | `change_this` / `change_this_too` | JWT-Signatur (in Production zwingend ersetzen) |
| `ACCESS_TOKEN_EXPIRES_IN` | `1h` | Access-Token-Laufzeit |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh-Token- und Cookie-Laufzeit |
| `BCRYPT_SALT_ROUNDS` | `12` | bcrypt-Kosten |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | – | Mailversand |
| `CLIENT_BASE_URL` | `http://localhost:5173` | Basis-URL für Links in E-Mails |

**Ohne SMTP:** Fehlt `SMTP_HOST` und ist `NODE_ENV` nicht `production`, wird keine Mail
versendet. `src/utils/mailer.js` schreibt stattdessen Empfänger, Betreff und den vollständigen
Link ins Log. Signup und Resend antworten erfolgreich. In Production ist SMTP Pflicht; ein
Versandfehler führt beim Signup zum Löschen des gerade angelegten Users und zu `502`.

## Aufbau

```
main.js                     Bootstrap: DB verbinden, Middleware, Router, 404- und Error-Handler, listen
src/
  config/                   zentrale Konfiguration aus .env + Security-Teilkonfigurationen
    index.js                lädt dotenv und exportiert alle Werte
    authConfig.js           Gültigkeit des Passwort-Reset-Tokens (15 min)
    coolDownConfig.js       Cooldown für E-Mail-Wechsel (5 min)
    corsConfig.js           erlaubte Origins/Methoden/Header
    helmetConfig.js         CSP und Security-Header
    rateLimitConfig.js      Limits: global, auth, emailResend, accountChange, confirmEmail, forgotPassword
  db/mongo.js               Singleton-Verbindung: connect(), getDb(), ObjectId; legt Unique-Indizes an
  middlewares/
    authUser.js             prüft Bearer-Access-Token, setzt req.user = { id, iat, exp }
    error.js                zentraler Error-Handler (loggt, maskiert 500er)
  utils/
    catchAsync.js           Promise-Wrapper → next(err)
    logger.js               Pino (dev: pretty console, prod: Dateien)
    mailer.js               gemeinsamer Nodemailer-Transporter + Dev-Log-Fallback
    normalize.js            normalizeEmail, normalizeName, validateName
    password.js             gemeinsame Passwort-Policy, hashPassword, comparePassword
    refreshCookie.js        gemeinsame Refresh-Cookie-Optionen
  modules/<feature>/        ein Ordner pro Feature
    index.js                Express-Router des Features (wird in main.js gemountet)
    controller/             HTTP-Schicht, ein File pro Endpunkt
    services/               Business-Logik, ein File pro Use Case
    models/                 MongoDB-Zugriffe, ein File pro Query
    middlewares/            Validierung/Schutz, ein File pro Prüfung
```

Features: `auth`, `user`, `account`.

## Request-Flow

```
main.js (Mount /auth, /users, /account)
  → modules/<feature>/index.js     Rate-Limit, Auth, Validierung, Route
    → controller/<action>.js       req lesen, Service aufrufen, Status/JSON/Cookie setzen
      → services/<action>.js       Business-Logik, wirft { status, message }
        → models/<query>.js        getDb().collection('users')...
          → MongoDB
```

Regeln der Schichten:

- **Controller** enthalten keine Business-Logik und kein DB-Wissen. Sie sind mit `catchAsync` gewrappt, damit Fehler im Error-Handler landen.
- **Services** werfen bei Fehlern einfache Objekte `{ status, message }`. Alles ohne `status` wird vom Error-Handler als 500 maskiert.
- **Models** machen genau eine DB-Operation pro Datei und werden in `models/index.js` gesammelt exportiert.
- **Validierungs-Middlewares** antworten selbst mit `400` und normalisieren Eingaben (trimmen, E-Mail lowercase) direkt in `req.body`.
- **Router** werden in `modules/<feature>/index.js` gebaut und in `main.js` gemountet. `express.Router()` statt `app`.
- Neue Features: Ordner nach obigem Muster anlegen, `controller/index.js`, `services/index.js`, `models/index.js` pflegen, Router in `main.js` mounten.

### Neues Modul in 6 Schritten

1. `src/modules/<feature>/` mit `controller/`, `services/`, `models/` anlegen
   (+ `middlewares/`, wenn Eingaben validiert werden).
2. Pro Use Case ein File in `controller/`, `services/` und pro DB-Operation ein File in `models/`.
3. In jedem Unterordner `index.js` mit den Exporten pflegen.
4. `src/modules/<feature>/index.js`: `express.Router()`, Rate-Limit/Auth/Validierung als
   Middleware vor der Route.
5. In `main.js` mounten: `app.use('/<plural>', <feature>Routes);`
   Der Pfad ist gleichzeitig der Pfad, den das Frontend über `apiFetch('/<plural>')` aufruft.
6. `node --check` auf jede geänderte Datei, `npm test` und die Endpunkte manuell prüfen.

### Antwort-Konventionen

- JSON in camelCase, `_id` als `id` (string), kein Envelope (`{ data: … }` gibt es nicht).
- Erfolg: passender Status (200/201/204) und die Ressource bzw. `{ message }`.
- Fehler: `{ message: "…" }` mit Status aus dem Service-Objekt; alles ohne `status` wird zu 500.
- Unbekannte Routen liefern `404 { message: "Not found" }` als JSON.
- `PATCH /account` ist die Ausnahme: `200 { messages, errorMessages, updated }`, Teilerfolg ist
  Teil des Vertrags (siehe Offene Punkte).
- Fehlermeldungen englisch, UI-Texte kommen aus dem Frontend (vue-i18n).

## Eingabe-Regeln

Gemeinsam genutzt aus `src/utils/normalize.js` und `src/utils/password.js`:

| Feld | Regel |
|---|---|
| `name` | 3–50 Zeichen, `^[a-zA-Z0-9._-]+$`, wird getrimmt, **case-sensitiv** (Login per Name ebenfalls) |
| `email` | `validator.isEmail` nach `trim().toLowerCase()`, überall normalisiert gespeichert/verglichen |
| `password` | 8–128 Zeichen, mindestens ein Großbuchstabe, ein Kleinbuchstabe und eine Zahl; wird **nie** getrimmt |

`main.js` setzt `req.body` nach dem Body-Parser auf `{}`, wenn kein Body gesendet wurde. Dadurch
antworten alle Validatoren mit `400` statt mit einem 500er.

## Datenmodell `users`

Es gibt kein Schema/Migration – die Collection wird implizit beim ersten Insert angelegt.
Beim Verbinden legt `db/mongo.js` **Unique-Indizes** auf `email` und `name` an
(`uniq_users_email`, `uniq_users_name`). Schlägt das Anlegen fehl (z. B. wegen bestehender
Duplikate), wird der Fehler geloggt, der Server startet trotzdem.

| Feld | Typ | Geschrieben von | Bedeutung |
|---|---|---|---|
| `_id` | ObjectId | MongoDB | User-ID (JWT-`id`) |
| `name` | string | Signup, Account-Update | Anzeigename, Login-Alternative (unique) |
| `email` | string | Signup, E-Mail-Wechsel | normalisiert (lowercase), Login (unique) |
| `emailVerified` | boolean | Signup, Verify, E-Mail-Wechsel | Login nur wenn `true` |
| `password` | string | Signup, Reset, Account-Update | bcrypt-Hash |
| `emailTokenHash` | string (sha256) | Signup, Resend | Hash des Verifikations-Tokens |
| `emailTokenExpiresAt` | Date | Signup, Resend | 30 Minuten gültig |
| `pendingEmail` | string | E-Mail-Wechsel | noch unbestätigte neue Adresse |
| `pendingEmailToken` | string (sha256) | E-Mail-Wechsel | Hash des Bestätigungstokens |
| `pendingEmailExpiresAt` | Date | E-Mail-Wechsel | 24 Stunden gültig |
| `emailChangeLastRequestedAt` | Date | E-Mail-Wechsel | Basis für den 5-Minuten-Cooldown |
| `passwordResetTokenHash` | string (sha256) | Forgot-Password | Hash des Reset-Tokens |
| `passwordResetExpiresAt` | Date | Forgot-Password | 15 Minuten gültig |
| `createdAt` | Date | Signup | Erstellungszeitpunkt |

**Token-Prinzip:** Tokens werden mit `crypto.randomBytes(32).toString('hex')` erzeugt, per E-Mail im Link verschickt und nur als **SHA-256-Hash** in der DB gespeichert. Beim Einlösen wird der eingehende Token gehasht und mit dem gespeicherten Hash verglichen. Verifikations- und Reset-Tokens werden nach erfolgreicher Einlösung entfernt; abgelaufene Tokens werden geprüft, aber nicht automatisch aufgeräumt.

## Endpunkte

Alle Pfade sind relativ zur Server-Basis (`http://localhost:3000` im Development).
Das Frontend ruft sie über `apiFetch` mit `VITE_API_URL` auf — es gibt **kein** zusätzliches
`/api`-Präfix. Für geschützte Endpunkte wird `Authorization: Bearer <accessToken>` gesendet,
das Refresh-Cookie geht durch `credentials: 'include'` mit.

### Auth (`/auth`)

| Methode | Pfad | Auth | Body/Query | Antwort |
|---|---|---|---|---|
| POST | `/sign-up` | – (Rate-Limit `auth`) | `{ name, email, password }` | `201 { message }`; `400` Validierung, `409` Name/E-Mail vergeben, `502` Mailversand fehlgeschlagen (User wird zurückgerollt) |
| POST | `/sign-in` | – (Rate-Limit `auth`) | `{ nameOrEmail, password }` | `200 { user: { id, name, email }, accessToken }` + Refresh-Cookie; `401` falsche Daten, `403` E-Mail unbestätigt |
| POST | `/sign-out` | Bearer | – | `204`, löscht Refresh-Cookie; `401` ohne/mit ungültigem Token |
| POST | `/refresh` | Refresh-Cookie | – | `200 { accessToken }`; `401` Cookie fehlt/ungültig/User weg |
| GET | `/verify-email` | – | `?token=` | `200 { message }`; `400` fehlend/ungültig/abgelaufen (bereits verifiziert: `200`) |
| POST | `/verify-email/resend` | – (Rate-Limit `emailResend`) | `{ email }` | `200 { message }` (immer generisch); `502` bei konfiguriertem, aber fehlgeschlagenem Versand |
| POST | `/forgot-password` | – (Rate-Limit `forgotPassword`) | `{ email }` | `200 { message }` (immer generisch, auch bei unbekannter Adresse) |
| POST | `/reset-password` | – | `{ token, password }` | `200 { message }`; `400` fehlend/ungültig/abgelaufen oder Passwort-Policy |

### User (`/users`)

| Methode | Pfad | Auth | Antwort |
|---|---|---|---|
| GET | `/me` | Bearer | `200 { id, name, email }`; `404` |
| DELETE | `/me` | Bearer | `200 { message }`, löscht Refresh-Cookie; `404` |
| GET | `/:id` | – | `200 { id, name, email }`; `400` ungültige ObjectId, `404` |

### Account (`/account`)

| Methode | Pfad | Auth | Body/Query | Antwort |
|---|---|---|---|---|
| PATCH | `/` | Bearer (Rate-Limit `accountChange`) | beliebige Kombination aus `{ name, email, password }` | `200 { messages, errorMessages, updated }` – Teilerfolg möglich, Status bleibt immer 200 |
| GET | `/confirm-email` | – (Token im Query) | `?token=` | `200 { success, newEmail, message }`; `400` ungültig/abgelaufen, `409` Adresse inzwischen vergeben |

**Rate-Limits** werden in den Routern nur bei `NODE_ENV=production` aktiviert; in Development sind es No-op-Middlewares. Zusätzlich läuft in Production ein globales Limit (200 Requests/Minute/IP).

## Auth und Session

- **Access-Token:** JWT `{ id }`, Laufzeit `ACCESS_TOKEN_EXPIRES_IN` (Default 1 h), wird als `Authorization: Bearer <token>` gesendet. `middlewares/authUser.js` prüft nur Signatur und Ablauf und setzt `req.user`; es gibt **keinen DB-Lookup** pro Request.
- **Refresh-Token:** JWT `{ id }`, Laufzeit `REFRESH_TOKEN_EXPIRES_IN` (Default 7 d), liegt **nur** als HttpOnly-Cookie mit `path=/auth/refresh` vor und wird nicht im JSON-Body zurückgegeben. Dadurch wird es nur an diesen Endpunkt gesendet.
- **Cookie-Optionen:** zentral in `src/utils/refreshCookie.js`: `httpOnly: true` immer, in Production `secure: true` + `sameSite: 'none'`, in Development `secure: false` + `sameSite: 'lax'` (sonst verwirft der Browser das Cookie über http). `maxAge` folgt `REFRESH_TOKEN_EXPIRES_IN`.
- **Refresh prüft den User:** Der Service lädt den User erneut; gelöschte oder nicht verifizierte User erhalten `401`.
- **Kein Token-Store:** Refresh-Tokens sind zustandslos, es gibt keine Rotation/Revocation. Passwortänderung oder -Reset beendet bestehende Sessions daher **nicht**.
- **Sign-out** verlangt ein gültiges Access-Token; ist es abgelaufen, kann das Cookie nicht über diesen Endpunkt gelöscht werden.

## E-Mail-Wechsel (Account)

1. `PATCH /account` mit `{ "email": "neu@example.com" }` (Bearer-Token nötig).
2. `validateUpdateAccount` prüft Typ, Format und normalisiert die Adresse.
3. `changeEmail` lehnt die aktuelle Adresse und bereits von anderen Usern genutzte Adressen ab,
   prüft den Cooldown (`emailChangeLastRequestedAt`, 5 min, nur in Production), erzeugt ein
   24-h-Token und speichert `pendingEmail` + Token-Hash + `emailChangeLastRequestedAt`.
4. Die Bestätigungsmail geht an die **neue** Adresse und enthält `${CLIENT_BASE_URL}/confirm-email-change?token=...`.
   Schlägt der Versand fehl, werden die Pending-Felder und der Cooldown zurückgesetzt.
5. `GET /account/confirm-email?token=...` ist **ohne Login** erreichbar (der Token ist der Nachweis). Der Service hasht den Token, prüft Ablauf und setzt per Aggregation-Pipeline `email = pendingEmail`, `emailVerified = true` und entfernt die Pending-Felder.
6. Greift inzwischen der Unique-Index auf `email`, antwortet der Endpunkt mit `409` und räumt die Pending-Felder auf.

## Sicherheit und Logging

- **Nur in Production:** Helmet (CSP, HSTS, Frameguard …), CORS mit fester Origin-Liste, globales Rate-Limit, `secure` Cookies.
- **CORS:** in Development ist `http://localhost:5173` mit `credentials: true` erlaubt (Frontend-Port). Läuft das Frontend auf einem anderen Port, muss `corsConfig.develop.origin` angepasst werden.
- **Body-Limit:** 10 kb für JSON und URL-Encoded.
- **Fehlerantworten:** `error.js` loggt den Fehler und gibt `err.message` nur bei gesetztem `status` aus, sonst `500 { message: "Internal server error" }`.
- **Logger:** Pino; Development mit `pino-pretty`, Production nach `logs/info.log` und `logs/error.log`. Im Dev-Fallback werden Mail-Links geloggt — in Production niemals Tokens loggen.
- Unbekannte Routen liefern JSON mit `404`.
- `db/mongo.js` legt beim Start Unique-Indizes auf `users.name` und `users.email` an.
- Doppelte Namen/E-Mails werden zusätzlich im Service über `E11000` abgefangen und als `409`
  (Signup) bzw. `errorMessages` (Account) beantwortet.

## Tests

`backend/test/api.test.js` deckt den kompletten Auth- und Account-Flow ab:

- leerer Body → `400`
- Signup inkl. Dev-Mail-Fallback, Duplikate → `409`, Name-/Passwort-/E-Mail-Policy
- Login per E-Mail/Name, falsches Passwort, unverifizierter Account
- Refresh-Cookie inkl. fehlendem/ungültigem Token
- E-Mail-Verifikation inkl. Aufräumen der Token-Felder
- Forgot-/Reset-Password inkl. Normalisierung, Policy und Token-Entwertung
- E-Mail-Wechsel inkl. Kollision, Bestätigung und Unique-Index
- Account-Update (Name, Passwort, Fehlerfälle)
- Sign-out und JSON-404

Der Testserver läuft als Child-Process gegen eine temporäre DB; die Tests verändern keine
Entwicklungsdaten.

## Bekannte offene Punkte

Priorisiert; nichts davon ist derzeit umgesetzt.

1. `PATCH /account` antwortet auch bei komplettem Fehlschlag mit `200` und `errorMessages`. Besser: `400`/`409`, wenn nichts übernommen wurde.
2. Fehlerformat ist gemischt: meist `{ message }`, in `validateUpdateAccount` `{ error }` bzw. `{ error: { type, message } }`.
3. CORS-Origins sind in `config/corsConfig.js` hartcodiert (`example.com`) und nutzen nicht `CLIENT_BASE_URL`/ENV.
4. In Production werden Default-JWT-Secrets (`change_this`) nicht abgelehnt → Fail-fast-Validierung fehlt.
5. In Production schreibt `logger.error` in den Info-Stream; `logger.logError` (für `error.log`) wird nirgends aufgerufen, `error.log` bleibt leer.
6. Passwortänderung/-Reset invalidiert bestehende Refresh- und Access-Tokens nicht (kein `tokenVersion`/Revocation-Store).
7. Sign-out hinter `authUser` → mit abgelaufenem Access-Token ist kein Logout möglich.
8. Kein `trust proxy`: hinter Reverse Proxy teilen sich alle Clients die Proxy-IP im Rate-Limit.
9. `POST /auth/reset-password` hat kein eigenes Rate-Limit (nur die globale Production-Grenze).
10. `_moduleAliases` in `package.json` zeigen auf nicht existierende Pfade (`src/router`, `src/modules/controller`, …); `module-alias` wird nirgends verwendet.
11. Helmet 8 kennt `xssFilter`/`ieNoOpen` nicht mehr; diese Optionen in `helmetConfig.js` prüfen/entfernen.
12. `PATCH /account` prüft nicht, ob das neue Passwort dem alten entspricht (bcrypt-Hashes sind immer unterschiedlich).
13. Der Dev-Mail-Fallback loggt Tokens im Klartext — nur für Development gedacht.

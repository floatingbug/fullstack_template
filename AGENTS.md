# <Projectname>

<Kurze Projektbeschreibung>

> **Vorlage:** `<Projectname>` und `<Kurze Projektbeschreibung>` beim Start eines neuen
> Projekts ersetzen. Alles andere beschreibt den Ist-Zustand des Templates.

## Aufbau (Monorepo)

- `backend/`: Node.js, Express 5, MongoDB (offizieller `mongodb`-Treiber, kein ODM), JWT, Pino
- `frontend/`: Vue 3, Vite, Pinia, vue-router, vue-i18n, Vitest, SCSS — **kein UI-Framework**
  Feature-Struktur mit eigenem Router je Feature (`features/<name>/router/index.js`)

## Regeln für Bereiche

Lies vor Änderungen in einem Bereich die zugehörige Datei:

- Backend: `backend/AGENTS.md`
- Frontend: `frontend/AGENTS.md`
- Frontend-Features: `frontend/src/features/AGENTS.md`

## Befehle

Backend (im Ordner `backend/`):

- `npm install`
- `npm run dev` — nodemon
- `node main.js` — ohne Watch
- `npm test` — `node:test` gegen eine temporäre MongoDB-Datenbank (startet den Server als Child-Process)
- `node --check <datei>` — Syntaxprüfung (es gibt weiterhin **kein** Lint-Setup)

Frontend (im Ordner `frontend/`):

- `npm install`
- `npm run dev` — Dev-Server auf Port 5173
- `npm test` — Tests einmalig (CI)
- `npm run test:unit` — Tests im Watch-Modus
- `npm run build` — Production-Build
- `npm run format` — Prettier (es gibt **kein** ESLint und keinen Typecheck)

## Voraussetzungen

- Laufende MongoDB
- `backend/.env` nach Vorlage `backend/.env.example`
- `frontend/.env` nach Vorlage `frontend/.env.example` (wird nicht versioniert)
- Ports: Backend `3000`, Frontend `5173`
- SMTP ist optional: fehlt `SMTP_HOST` außerhalb von Production, werden Mail-Links nur geloggt

## API-Vertrag

- Basis-URL im Frontend: `VITE_API_URL` (Default `http://localhost:3000`)
- Alle Aufrufe laufen über `apiFetch` aus `frontend/src/shared/api/apiFetch.js`
- Pfade ohne Präfix, direkt die Backend-Routen: `/users/me`, `/recipes`, `/auth/sign-in`
- `credentials: 'include'` ist gesetzt, damit das Refresh-Cookie mitgeht
- Geschützte Endpunkte: `Authorization: Bearer <accessToken>`
- JSON in camelCase, `_id` wird als `id` ausgegeben, kein Envelope
- Fehler: `{ message }` mit passendem HTTP-Status, unbekannte Routen `404` als JSON
- Eingaben: Name 3–50 Zeichen (`^[a-zA-Z0-9._-]+$`), Passwort 8–128 mit Groß-, Kleinbuchstabe
  und Zahl (nie trimmen), E-Mail wird immer `trim` + `lowercase` normalisiert
- `name` und `email` sind unique; Duplikate liefern `409`
- CORS im Backend erlaubt im Development `http://localhost:5173` mit Credentials

## Neues Feature (End-to-End)

1. Anforderungen klären: Name (Singular/Plural), Felder, Listen, Backend-Bedarf.
   Bei Unklarheiten nachfragen statt raten.
2. Backend (falls Daten gespeichert werden): Modul unter `backend/src/modules/<feature>/`
   anlegen, Router in `backend/main.js` mounten. Details: `backend/AGENTS.md`.
3. Frontend: den Skill `create-feature` verwenden (siehe unten). Jedes Feature bekommt
   `frontend/src/features/<name>/router/index.js` (Layout als Parent, Views als `children`);
   der Feature-Router wird in `frontend/src/app/router/index.js` importiert und in `routes`
   aufgenommen.
4. Prüfen: Backend `npm test` und `node --check`, Frontend `npm test` und `npm run build`.
5. Doku/Übersetzungen: neue Texte in `de.json` **und** `en.json`.

## Skills

- `create-feature` (`.opencode/skills/create-feature`) — legt neue Features an.
- `vue-best-practices` (`.opencode/skills/vue-best-practices`) — Vue-Regeln. Das Projekt nutzt
  bewusst JavaScript, kein TypeScript; TypeScript-Empfehlungen dort ignorieren.
- `backend/.agents/skills/nodejs-express-server` — generisches Express-Skill. Es beschreibt
  Sequelize/PostgreSQL und passt **nicht** zu diesem Stack (MongoDB-Treiber). Nicht befolgen.

## Sprache

- Sichtbare UI-Texte ausschließlich über vue-i18n (`de.json` / `en.json`)
- Bezeichner im Code englisch
- Kommentare deutsch
- Backend-Fehlermeldungen englisch (wie im Bestand)

## Definition of Done

- Backend: `npm test` grün, `node --check` für jede geänderte Datei, betroffene Endpunkte manuell geprüft
- Frontend: `npm test` und `npm run build` grün
- Neue sichtbare Texte in beiden Locale-Dateien vorhanden
- Keine Platzhalter (`__Name__`, `TODO` aus Vorlagen) im Ergebnis

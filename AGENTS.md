# <Projectname>

<Kurze Projektbeschreibung>

## Aufbau (Monorepo)

- `backend/`: Node.js, Express, MongoDB (node.js driver)
- `frontend/`: Vue 3, Vite, Pinia, vue-i18n, vue-router, Vitest

## Regeln für Bereiche

Lies vor Änderungen in einem Bereich die zugehörige Datei:

- Backend: `backend/AGENTS.md`
- Frontend `frontend/AGENTS.md`

## Befehle

Backend (im Ordner `backend/`):

- Dev-Server: `npm run dev`
- Tests: `npm test` (einzelne Datei: `npm test -- <pfad>`)
- Lint: `npm run lint`

Frontend (im Ordner `frontend/`):

- Dev-Server: `npm run dev`
- Tests: `npm test`
- Lint und Typecheck: `npm run lint && npm run typecheck`
- Build: `npm run build`

## Arbeitsweise

Nach jeder Änderung: Tests und Lint des betroffenen Teils ausführen und Fehler selbst beheben,
bevor du die Aufgabe als erledigt meldest.

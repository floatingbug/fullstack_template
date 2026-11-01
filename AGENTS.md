# Projectname

## Aufbau (Monorepo)

```
Projectverzeichnis/
  ├── backend/     Node.js + Express
  ├── frontend/    Vue
  └── contracts/   API-Vertrag (openapi.yaml)
```

## Backend-Architektur

```
backend/src/
  ├── config/        Konfiguration
  ├── db/            Datenbankzugriff
  ├── middlewares/   Express-Middlewares
  ├── features/      ein Ordner pro Fachbereich
  └── utils/         allgemeine Hilfsfunktionen
```

## Frontend-Architektur

```
frontend/src/
  ├── __tests__/
  ├── app/           App-weite Einrichtung (Router, Store, ...)
  ├── features/      ein Ordner pro Fachbereich
  ├── locales/       Übersetzungen
  ├── shared/        feature-übergreifende Komponenten und Helfer
  ├── App.vue
  └── main.ts
```

## Bereichsspezifische Regeln

- Bevor du Dateien in `backend/` änderst, lies `backend/AGENTS.md`.
- Bevor du Dateien in `frontend/` änderst, lies `frontend/AGENTS.md`.

## Workflow

Reihenfolge bei neuen Features oder Endpoint-Änderungen:

1. API-Vertrag in `contracts/openapi.yaml` anpassen
2. Backend implementieren (mit Tests)
3. `npm run gen:api` im Ordner `frontend/` ausführen
4. Frontend implementieren (mit Tests)

## Regeln

- Der API-Vertrag (`contracts/openapi.yaml`) ist die einzige Wahrheit für die Schnittstelle.
- Implementiere keine Endpoints, die nicht im API-Vertrag stehen.
- Requests werden im Backend immer mit `express-openapi-validator` validiert; Responses nur außerhalb von Produktion (Tests und Entwicklung).
- Generierte Dateien (z. B. `frontend/src/shared/api/schema.d.ts`) nie von Hand ändern.
- Nach Änderungen am API-Vertrag `npm run gen:api` im Ordner `frontend/` ausführen und die generierte Datei `frontend/src/shared/api/schema.d.ts` mit committen.

## Definition of Done

- Backend-Änderung: `npm run type-check` und `npm run test` in `backend/` laufen grün.
- Frontend-Änderung: `npm run type-check`, `npm run test` und `npm run build` in `frontend/` laufen grün.

## Befehle

### Frontend (im Ordner `frontend/`)

- `npm run dev`
- `npm run type-check`
- `npm run build`
- `npm run test`
- `npm run test:unit`
- `npm run format`
- `npm run gen:api` (Typen aus dem API-Vertrag generieren)

### Backend (im Ordner `backend/`)

- `npm run dev`
- `npm run type-check`
- `npm run test`

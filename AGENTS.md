# Projectname

## Aufbau (Monorepo)

```
Projectverzeichnis/
  ├── backend/     Node.js + Express
  ├── frontend/    Vue
  └── contracts/   API-Vertrag
        ├── api/                     Quelle (hier ändern), Einstiegspunkt: openapi.yaml
        └── openapi.bundled.yaml     generiert, nie von Hand ändern
```

## Backend-Architektur

Feature-basiert: Code liegt in `backend/src/features/` (ein Ordner pro Fachbereich),
feature-übergreifende Helfer in `backend/src/utils/`, Konfiguration in `backend/src/config/`.
Einstiegspunkt ist `backend/main.ts`, Tests liegen in `backend/test/`.
Die vollständige Verzeichnisstruktur und die Regeln stehen in `backend/AGENTS.md`.

## Frontend-Architektur

Feature-basiert: Code liegt in `frontend/src/features/` (ein Ordner pro Fachbereich),
feature-übergreifende Komponenten und Helfer in `frontend/src/shared/`,
App-weite Einrichtung (Router, Store) in `frontend/src/app/`.
Die vollständige Verzeichnisstruktur und die Regeln stehen in `frontend/AGENTS.md`.

## Bereichsspezifische Regeln

- Bevor du Dateien in `backend/` änderst, lies `backend/AGENTS.md`.
- Bevor du Dateien in `frontend/` änderst, lies `frontend/AGENTS.md`.

## Workflow

Reihenfolge bei neuen Features oder Endpoint-Änderungen:

1. API-Vertrag in `contracts/api/` anpassen
2. Backend implementieren (mit Tests). `npm run test` bundelt den Vertrag automatisch.
3. `npm run gen:api` im Ordner `frontend/` ausführen (bundelt den Vertrag vorher automatisch)
4. Frontend implementieren (mit Tests)

## Regeln

- Der API-Vertrag ist die einzige Wahrheit für die Schnittstelle. Er wird ausschließlich in `contracts/api/` geändert.
- `contracts/openapi.bundled.yaml` ist generiert und wird nie von Hand bearbeitet.
- Implementiere keine Endpoints, die nicht im API-Vertrag stehen.
- Generierte Dateien (z. B. `frontend/src/shared/api/schema.d.ts`) nie von Hand ändern.
- Nach Änderungen am API-Vertrag `npm run gen:api` im Ordner `frontend/` ausführen und die generierte Datei `frontend/src/shared/api/schema.d.ts` mit committen.
- Das Bundlen des Vertrags läuft über `@redocly/cli` im Backend. Voraussetzung ist, dass in `backend/` `npm install` gelaufen ist.

## Definition of Done

- Backend-Änderung: `npm run type-check` und `npm run test` in `backend/` laufen grün.
- Frontend-Änderung: `npm run type-check`, `npm run test`, `npm run build` und `npm run format:check` in `frontend/` laufen grün.

## Befehle

### Frontend (im Ordner `frontend/`)

- `npm run dev`
- `npm run type-check`
- `npm run build`
- `npm run preview`
- `npm run test` (einmaliger Lauf, auch für Agenten)
- `npm run test:watch` (Watch-Modus, nur für die manuelle Entwicklung, nicht als Agent ausführen)
- `npm run format` (formatiert den Code)
- `npm run format:check` (prüft die Formatierung, ändert nichts)
- `npm run gen:api` (bundelt den API-Vertrag und generiert daraus die Typen)
- `npm run bundle:api` (API-Vertrag bündeln, ruft das Backend-Script auf)

### Backend (im Ordner `backend/`)

- `npm run dev`
- `npm run type-check`
- `npm run test`
- `npm run build`
- `npm run bundle:api` (API-Vertrag bündeln)

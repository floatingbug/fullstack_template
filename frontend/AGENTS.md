# Frontend (Vue)

## Verzeichnisstruktur

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

## API-Vertrag

- Die Quelle des API-Vertrags liegt in `../contracts/api/`. Änderungen am Vertrag erfolgen ausschließlich dort (siehe Workflow im Root und `backend/AGENTS.md`).
- `../contracts/openapi.bundled.yaml` ist generiert und wird nie von Hand bearbeitet. `npm run gen:api` bundelt den Vertrag vorher automatisch (über das Backend-Script, dafür muss in `backend/` `npm install` gelaufen sein).
- Typen aus dem Vertrag werden mit `npm run gen:api` erzeugt (Ausgabe: `src/shared/api/schema.d.ts`).
- `src/shared/api/types.ts` enthält nur Aliase auf die generierten Typen; keine eigenen Felddefinitionen.
- Generierte Dateien nie von Hand ändern. Bei Änderungen am Vertrag neu generieren und die generierte Datei mit committen.
- Rufe nur Endpoints auf, die im API-Vertrag stehen. Fehlt ein Endpoint, ändere zuerst den Vertrag in `contracts/api/` und implementiere das Backend (siehe Workflow im Root).

## Regeln

- Neuer Code gehört in den passenden Ordner unter `src/features/`. Wiederverwendbares, feature-übergreifendes kommt nach `src/shared/`.
- Texte, die der Nutzer sieht, nie hartkodieren, sondern über `src/locales/` pflegen.
- Neue Abhängigkeiten nur hinzufügen, wenn nötig, und kurz begründen.

## Features

- Neue Features und neue Use-Cases in bestehenden Features immer mit dem Skill `create-feature-frontend` umsetzen. Das gilt auch für einzelne neue Views, API-Funktionen, Services, Store-Actions und Komponenten.
- Fehlt das Feature, wird der angeforderte Use-Case vollständig angelegt. Bei einem allgemeinen Prompt ohne konkreten Use-Case zuerst nachfragen und kein vollständiges CRUD annehmen.
- Ist das Feature bereits vorhanden, dessen Aufbau zuerst ansehen und vorhandene API-Funktionen, Services, Stores und Komponenten wiederverwenden. Nur fehlende Teile ergänzen und kein neues Feature-Verzeichnis oder parallele Strukturen für denselben Zweck anlegen.
- Die Schichten und Importrichtungen beschreibt `.opencode/skills/create-feature-frontend/references/architecture.md`. Bei Erweiterungen haben die vorhandene Struktur, Benennung und Schichtung des Features Vorrang vor allgemeinen Templates.
- Weicht ein Feature unklar vom dokumentierten Muster ab, die Abweichung nicht blind übernehmen, sondern nachfragen.

## Befehle (im Ordner `frontend/` ausführen)

- `npm run dev` startet den Entwicklungsserver
- `npm run type-check` prüft die Typen
- `npm run build` führt `type-check` aus und erzeugt den Produktions-Build
- `npm run preview` startet eine lokale Vorschau des Produktions-Builds
- `npm run test` führt alle Tests einmalig aus (auch für Agenten)
- `npm run test:watch` startet Vitest im Watch-Modus (nur für die manuelle Entwicklung, nicht als Agent ausführen)
- `npm run format` formatiert den Code
- `npm run format:check` prüft die Formatierung, ohne Dateien zu ändern
- `npm run gen:api` bundelt den API-Vertrag und erzeugt daraus die Typen
- `npm run bundle:api` bündelt nur den API-Vertrag (ruft das Backend-Script auf)

## Definition of Done

- `npm run type-check`, `npm run test`, `npm run build` und `npm run format:check` laufen grün.
- Neue sichtbare Texte sind in `locales/` hinterlegt.
- Nach Vertragsänderungen: `npm run gen:api` wurde ausgeführt und `src/shared/api/schema.d.ts` ist aktuell.

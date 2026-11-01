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

- Der API-Vertrag liegt in `../contracts/openapi.yaml`.
- Typen aus dem Vertrag werden mit `npm run gen:api` erzeugt (Ausgabe: `src/api/schema.d.ts`).
- Generierte Dateien nie von Hand ändern. Bei Änderungen am Vertrag neu generieren.
- Rufe nur Endpoints auf, die im API-Vertrag stehen. Fehlt ein Endpoint, ändere zuerst den Vertrag und implementiere das Backend (siehe Workflow im Root).

## Regeln

- Neuer Code gehört in den passenden Ordner unter `features/`. Wiederverwendbares, feature-übergreifendes kommt nach `shared/`.
- Texte, die der Nutzer sieht, nie hartkodieren, sondern über `locales/` pflegen.
- Neue Abhängigkeiten nur hinzufügen, wenn nötig, und kurz begründen.

## Features

<!-- Aufbau eines Features (Komponenten, Composables, Store, Tests usw.) hier später ergänzen. -->

## Befehle (im Ordner `frontend/` ausführen)

- `npm run dev` startet den Entwicklungsserver
- `npm run type-check` prüft die Typen
- `npm run build` erzeugt den Produktions-Build
- `npm run test` führt alle Tests aus
- `npm run test:unit` führt nur die Unit-Tests aus
- `npm run format` formatiert den Code
- `npm run gen:api` erzeugt die Typen aus dem API-Vertrag

## Definition of Done

- `npm run type-check`, `npm run test` und `npm run build` laufen grün.
- Neue sichtbare Texte sind in `locales/` hinterlegt.

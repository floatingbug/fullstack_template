# Backend (Node.js + Express)

## Verzeichnisstruktur

```
backend/src/
  ├── config/        Konfiguration
  ├── db/            Datenbankzugriff
  ├── middlewares/   Express-Middlewares
  ├── features/      ein Ordner pro Fachbereich
  └── utils/         allgemeine Hilfsfunktionen
```

## API-Vertrag

- Der API-Vertrag liegt in `../contracts/openapi.yaml`.
- Requests und Responses werden mit `express-openapi-validator` als Middleware validiert.
- Implementiere keine Endpoints, die nicht im API-Vertrag stehen. Ändere zuerst den Vertrag.
- Weicht die Implementierung vom Vertrag ab, passe die Implementierung an, nicht den Validator (Validierung nie abschalten oder umgehen).

## Regeln

- Neuer Code gehört in den passenden Ordner unter `features/`. Feature-übergreifende Helfer kommen nach `utils/`.
- Konfigurationswerte (Ports, Datenbank-URLs, Secrets) nie im Code hartkodieren, sondern über `config/` beziehen.
- Keine Secrets oder `.env`-Dateien committen.
- Neue Abhängigkeiten nur hinzufügen, wenn nötig, und kurz begründen.

## Features

<!-- Aufbau eines Features (Router, Service, Repository, Tests usw.) hier später ergänzen. -->

## Befehle (im Ordner `backend/` ausführen)

- `npm run dev` startet den Entwicklungsserver
- `npm run type-check` prüft die Typen
- `npm run test` führt die Tests aus

## Definition of Done

- `npm run type-check` läuft ohne Fehler.
- `npm run test` läuft grün.
- Der Endpoint entspricht dem API-Vertrag (Validator meldet keine Fehler).

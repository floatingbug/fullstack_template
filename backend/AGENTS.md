# Backend (Node.js + Express)

## Verzeichnisstruktur

```
backend/
  ├── main.ts            Einstiegspunkt (Server-Start)
  ├── test/              Tests (test/**/*.ts)
  └── src/
      ├── config/        Konfiguration
      ├── db/            Datenbankzugriff
      ├── middlewares/   Express-Middlewares
      ├── features/      ein Ordner pro Fachbereich
      ├── types/         feature-übergreifende TypeScript-Typen
      └── utils/         allgemeine Hilfsfunktionen
```

## API-Vertrag

- Die Quelle des API-Vertrags liegt in `../contracts/api/` (Einstiegspunkt: `../contracts/api/openapi.yaml`). Änderungen am Vertrag erfolgen ausschließlich dort.
- `../contracts/openapi.bundled.yaml` wird daraus generiert (`npm run bundle:api`) und nie von Hand bearbeitet. Der Validator liest diese gebundelte Datei.
- Gebundelt wird automatisch bei `npm run dev` (inkl. Watcher), `npm run test` und `npm run build` sowie beim `gen:api` im Frontend. Manuell ist `npm run bundle:api` nur nötig, wenn die gebundelte Datei sonst ohne diese Befehle gebraucht wird (z. B. zum Prüfen des Ergebnisses).
- Requests werden immer mit `express-openapi-validator` als Middleware validiert; Responses nur außerhalb von Produktion (Tests und Entwicklung).
- Implementiere keine Endpoints, die nicht im API-Vertrag stehen. Ändere zuerst den Vertrag in `contracts/api/`.
- Weicht die Implementierung vom Vertrag ab, passe die Implementierung an, nicht den Validator (Validierung nie abschalten oder umgehen).
- Jeder neue oder geänderte Endpoint braucht mindestens einen Test. `validateResponses` prüft nur Operationen, die von Tests durchlaufen werden.

## Regeln

- Neuer Code gehört in den passenden Ordner unter `src/features/`. Feature-übergreifende Helfer kommen nach `src/utils/`.
- Typen, die von mehreren Features genutzt werden, kommen nach `src/types/`; featurespezifische Typen bleiben im Feature-Ordner.
- Tests liegen unter `backend/test/`, nicht neben dem Code.
- Konfigurationswerte (Ports, Datenbank-URLs, Secrets) nie im Code hartkodieren, sondern über `src/config/` beziehen.
- Keine Secrets oder `.env`-Dateien committen.
- Neue Abhängigkeiten nur hinzufügen, wenn nötig, und kurz begründen.

## Features

- Neue Features und neue Use-Cases in bestehenden Features immer mit dem Skill `create-feature-backend` umsetzen. Das gilt auch für einzelne neue Endpunkte, Controller, Services, Models und API-Tests.
- `src/features/user/` ist das Referenz-Feature für die Struktur: `index.ts` als Express-Router, dann `controller/`, `services/` und bei Bedarf `models/` mit jeweils passenden `index.ts`-Dateien.
- Fehlt das Feature, wird der angeforderte Use-Case einschließlich API-Vertrag, Router-Registrierung und API-Tests vollständig angelegt. Bei einem allgemeinen Prompt ohne konkreten Use-Case zuerst nachfragen und kein vollständiges CRUD annehmen.
- Ist das Feature bereits vorhanden, dessen Aufbau zuerst ansehen und vorhandene Controller, Services, Models und Middleware wiederverwenden. Nur fehlende Teile ergänzen und keine parallelen Strukturen für denselben Zweck anlegen.
- Der Aufrufpfad ist `Router → Controller → Service → Model → MongoDB`. Die Schichten und Importrichtungen beschreibt `.opencode/skills/create-feature-backend/references/architecture.md`. Bei Erweiterungen haben die vorhandenen Muster des Features Vorrang vor allgemeinen Templates.
- Weicht ein Feature unklar vom Referenzmuster ab, die Abweichung nicht blind übernehmen, sondern nachfragen.

## Befehle (im Ordner `backend/` ausführen)

- `npm run dev` startet den Entwicklungsserver (inkl. Bundle-Watcher für den API-Vertrag)
- `npm run type-check` prüft die Typen
- `npm run test` führt die Tests aus (bundelt vorher den API-Vertrag)
- `npm run bundle:api` bündelt `../contracts/api/openapi.yaml` zu `../contracts/openapi.bundled.yaml`
- `npm run build` kompiliert das Projekt nach `dist/` (bundelt vorher den API-Vertrag)

## Definition of Done

- `npm run type-check` läuft ohne Fehler.
- `npm run test` läuft grün.
- Der Endpoint entspricht dem API-Vertrag (Validator meldet keine Fehler).
- Neue oder geänderte Endpoints haben mindestens einen Test.

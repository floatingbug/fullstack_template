# Backend-Feature-Architektur

Diese Referenz beschreibt die Standardarchitektur neuer Features auf Basis von
`backend/src/features/user/`. Bei einem bestehenden Feature werden zuerst dessen tatsächliche Muster
gelesen und beibehalten. Der API-Vertrag bleibt in beiden Fällen die einzige Wahrheit für die
Schnittstelle.

## Aufrufpfad und Importrichtung

```text
backend/main.ts
      ↓
feature/index.ts                 Express-Router und Middleware
      ↓
controller/<operation>.ts        HTTP Request/Response
      ↓
services/<operation>.ts          fachliche Operation
      ↓
models/<operation>.ts            Persistenz/Datenzugriff
      ↓
db/mongo.ts                      getDb(), ObjectId
```

Der normale fachliche Aufrufpfad lautet:

```text
Router → Controller → Service → Model → MongoDB
```

- Controller importieren Services über `services/index.ts`.
- Services importieren Models über `models/index.ts`.
- Models importieren den Datenbankzugriff aus `db/mongo.ts`.
- Controller greifen nicht direkt auf Models oder MongoDB zu.
- Services und Models kennen weder Express-Request noch Express-Response.

Beispiel für die relativen Importe eines Features `todo`:

```ts
// index.ts
import controller from './controller/index.js';

// controller/getTodo.ts
import services from '../services/index.js';

// services/getTodoById.ts
import models from '../models/index.js';

// models/findById.ts
import { getDb, ObjectId } from '../../../db/mongo.js';
```

## Verzeichnisstruktur

```text
backend/src/features/<feature>/
  ├── index.ts
  ├── controller/
  │   ├── index.ts
  │   └── <operation>.ts
  ├── services/
  │   ├── index.ts
  │   └── <operation>.ts
  └── models/
      ├── index.ts
      └── <operation>.ts
```

Die Struktur entspricht dem Referenz-Feature `user`. Models werden nur angelegt, wenn der Use-Case
Datenzugriff oder Persistenz benötigt. Bei wachsender fachlicher Komplexität kann ein Service in einen
eigenen Unterordner aufgeteilt werden; das ist keine Pflicht für das initiale Gerüst.

Feature-spezifische Typen bleiben im Feature-Ordner, beispielsweise in einer `types.ts`. Nur Typen,
die tatsächlich von mehreren Features verwendet werden, gehören nach `backend/src/types/`.
Feature-übergreifende Helfer gehören nach `backend/src/utils/`.

## Verantwortung der Schichten

### `index.ts` – Feature-Router

- Erzeugt und exportiert den Express-Router des Features.
- Verbindet HTTP-Methode und relativen Pfad mit der Controller-Operation.
- Ordnet Authentifizierung, feature-eigene Validierung und `openApiMiddleware` in der erforderlichen
  Reihenfolge an.
- Verwendet `authUser` nur für Endpunkte, deren Vertrag Authentifizierung verlangt.
- Enthält keine Fachlogik oder Datenbankzugriffe.
- Wird in `backend/main.ts` mit dem vertraglich festgelegten Basis-Pfad registriert, bevor der 404-
  Handler und der zentrale Error-Handler folgen.

### `controller/`

- Eine Datei kapselt typischerweise eine Controller-Operation; `index.ts` bündelt die Exporte.
- Liest bereits validierte Parameter, Body-Daten oder die authentifizierte User-ID und übergibt sie an
  eine Service-Operation.
- Setzt den im Vertrag beschriebenen Statuscode und die Response.
- Verwendet `catchAsync`, damit asynchrone Fehler den zentralen Error-Handler erreichen.
- Enthält keine Fachregeln, MongoDB-Abfragen oder direkten Model-Zugriffe.

### `services/`

- Eine Datei kapselt typischerweise eine fachliche Operation; `index.ts` bündelt die Exporte.
- Enthält Fachlogik, Validierung auf fachlicher Ebene, Transformation und Response-Mapping.
- Importiert Models und feature-eigene beziehungsweise gemeinsame Utilities.
- Verwendet `AppError` für erwartete fachliche HTTP-Fehler mit passendem Statuscode.
- Gibt nur Daten zurück, deren Struktur dem API-Vertrag entspricht, und lehnt keine internen Dokumente
  ungeprüft an den Controller durch.
- Ist unabhängig von Express und konkreten HTTP-Transportdetails.

### `models/`

- Eine Datei kapselt typischerweise eine Datenzugriffsoperation; `index.ts` bündelt die Exporte.
- Verwendet `getDb()` und typisierte MongoDB-Collections.
- Kapselt Query- und Persistenzdetails einschließlich `ObjectId`-Konvertierung.
- Enthält keine HTTP- oder übergeordnete Fachlogik.
- Wird nur für tatsächlich benötigten Datenzugriff angelegt; nicht jeder Use-Case benötigt MongoDB.

## API-Vertrag und Middleware

- Die Quelldateien liegen in `contracts/api/openapi.yaml`, `contracts/api/paths/` und
  `contracts/api/components/`.
- Jeder Endpunkt wird vor seiner Implementierung dort mit Methode, Parametern, Security sowie allen
  relevanten Responses beschrieben.
- `contracts/openapi.bundled.yaml` wird ausschließlich über die vorhandenen Scripts erzeugt.
- `openApiMiddleware` validiert Requests immer und Responses außerhalb von Produktion. Validierung
  wird nicht deaktiviert, um Implementierungsfehler zu verdecken.
- Nach Vertragsänderungen werden auch die Frontend-Typen mit `npm run gen:api` in `frontend/`
  generiert.

## Tests

- Tests liegen unter `backend/test/`, nicht neben dem Produktionscode.
- `backend/test/api.test.ts` und `backend/test/helpers/testServer.ts` zeigen den vorgesehenen
  Integrationstest mit echtem Server und temporärer MongoDB-Datenbank.
- Jeder neue oder geänderte Endpunkt braucht mindestens einen Test, der ihn tatsächlich aufruft.
  `validateResponses` prüft nur durchlaufene Operationen.
- Teste den dokumentierten Success-Case sowie relevante Auth-, Validierungs- und Error-Fälle.
- Prüfe bei Persistenz zusätzlich den relevanten Datenbankzustand, wenn er Teil des Use-Cases ist.
- Erzeuge keine isolierten Scheintests nur zum Abhaken einer Dateiliste, wenn ein API-Test erforderlich
  ist.

## Erweiterung am Beispiel Todo

Für einen neuen Endpunkt in einem bereits vorhandenen `todo`-Feature wird zuerst inventarisiert:

1. Ist die Operation einschließlich Response bereits im API-Vertrag beschrieben?
2. Gibt es im Router bereits einen passenden Pfad oder eine wiederverwendbare Middleware-Kette?
3. Gibt es bereits eine Controller- und Service-Operation für denselben Zweck?
4. Gibt es bereits eine Model-Funktion für den benötigten Datenzugriff?
5. Welche vorhandenen API-Tests und Fixtures können erweitert werden?

Vorhandene Glieder werden wiederverwendet, fehlende Glieder ergänzt und in den vorhandenen
`index.ts`-Dateien exportiert. Es entsteht kein zweiter Controller-, Service- oder Datenbankpfad für
dieselbe fachliche Operation.

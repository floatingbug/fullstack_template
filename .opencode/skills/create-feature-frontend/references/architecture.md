# Frontend-Feature-Architektur

Diese Referenz beschreibt die Standardarchitektur für neue Features. Bei einem bestehenden Feature
werden zuerst dessen tatsächliche Muster gelesen und beibehalten. Der API-Vertrag bleibt in beiden
Fällen die einzige Wahrheit für die Schnittstelle.

## Datenfluss und Importrichtung

```text
frontend/src/app/router/index.ts
              ↓
      feature/router/index.ts
              ↓
          ui/views
              ↓
           store
              ↓
         services
              ↓
            api
              ↓
    shared/api/apiFetch
```

Views komponieren zusätzlich ihre UI-Komponenten und bei Bedarf fokussierte Composables. Diese bilden
keinen alternativen Weg zur API-Schicht.

Der normale fachliche Aufrufpfad lautet:

```text
View → Store → Service → API → apiFetch
```

- Services importieren API-Funktionen.
- Stores importieren Services, aber keine API-Funktionen.
- Views koordinieren Stores und UI-Komponenten, ohne API oder Service direkt aufzurufen.
- UI-Komponenten erhalten Daten vorzugsweise über Props und melden Absichten über Events.
- Composables und Items werden nur angelegt, wenn sie einen konkreten Nutzen haben; sie bilden keine
  zusätzliche Datenzugriffsschicht.

Beispiel für die relativen Importe eines Features `todo`:

```ts
// services/todoService.ts
import { getTodosApi } from '../api/getTodosApi'

// store/todoStore.ts
import { loadTodos } from '../services/todoService'

// ui/views/TodoListView.vue
import { useTodoStore } from '../../store/todoStore'
```

## Verzeichnisstruktur

```text
frontend/src/features/<feature>/
  ├── api/
  │   └── <operation>Api.ts
  ├── router/
  │   └── index.ts
  ├── services/
  │   └── <feature>Service.ts
  ├── store/
  │   └── <feature>Store.ts
  ├── ui/
  │   ├── components/
  │   ├── composables/       optional
  │   ├── items/             optional
  │   └── views/
  └── utils/                 optional
```

Tests liegen als `*.test.ts` neben der getesteten Datei. Es müssen keine leeren Verzeichnisse oder
unbenutzten Schichten erzeugt werden. Feature-übergreifender Code gehört nach `frontend/src/shared/`,
nicht in ein zufällig gewähltes Feature.

## Verantwortung der Schichten

### `api/`

- Kapselt HTTP-Aufrufe, typischerweise eine Funktion pro Endpunkt und Datei.
- Verwendet `apiFetch` aus `@/shared/api/apiFetch`.
- Verwendet Antwort- und Payload-Typen aus `@/shared/api/types`; diese Datei enthält nur Aliase auf
  die generierten OpenAPI-Typen.
- Enthält keine Fachlogik und keinen UI- oder Pinia-State.
- Pfad, Methode, Body, Authentifizierung und Retry-Verhalten müssen zum Vertrag und Use-Case passen.

### `services/`

- Enthält fachliche Operationen, Validierung, Transformation und Fehlerzuordnung.
- Importiert eine oder mehrere API-Funktionen und feature-eigene Utilities.
- Ist unabhängig von Vue, Pinia und konkreten Komponenten.
- Kann mehrere fachlich abgegrenzte Dateien besitzen, wenn das Feature wächst. Nicht für jede kleine
  Funktion eine neue Abstraktion erzwingen.

### `store/`

- Besitzt den geteilten State des Features und orchestriert Service-Aufrufe.
- Kapselt Lade-, Fehler- und fachliche Zustände sowie zugehörige Actions.
- Importiert Services, aber niemals die API-Schicht direkt.
- Enthält keine DOM-Logik. Rein lokaler Komponenten-State gehört nicht automatisch in den Store.

### `ui/views/`

- Views sind routebare Seiten und koordinieren einen konkreten Use-Case.
- Verwenden die Composition API mit `<script setup lang="ts">`.
- Verwenden den Store, lösen das initiale Laden aus und verbinden Komponenten.
- Enthalten keine direkten API- oder Service-Aufrufe.
- Sichtbare Texte kommen aus `frontend/src/locales/`; hartkodierte Nutzer-Texte sind nicht zulässig.

### `ui/components/`

- Kapseln verständliche UI-Verantwortungen und lokale Interaktionen.
- Kommunizieren standardmäßig über typisierte Props und Events: Props down, Events up.
- Erhalten Daten von der View oder einer fachlich passenden übergeordneten Komponente.
- Rufen weder API noch Services direkt auf. Ein direkter Store-Zugriff ist nicht der Standard und muss
  durch die vorhandene Feature-Architektur begründet sein.
- Komponenten nicht nur wegen einer willkürlichen Dateilänge aufteilen; ein kleiner, kohärenter
  Use-Case kann in einer SFC bleiben.

### `ui/composables/` (optional)

- Kapseln eine abgegrenzte, substanzielle stateful UI-Verantwortung samt Lifecycle und Cleanup.
- Geben eine fokussierte, typisierte Schnittstelle aus State und Aktionen zurück.
- Ersetzen nicht den Store und keine Service-Schicht. Einfache lokale Werte oder reine Berechnungen
  bleiben in der Komponente beziehungsweise in `utils/`.

### `ui/items/` (optional)

- Enthält typisierte Konfiguration für konfigurationsgetriebene Listen, Felder oder Navigationselemente.
- Verwendet stabile IDs und Übersetzungsschlüssel statt sichtbarer hartkodierter Texte.
- Enthält keine Datenbank- oder API-Daten und keine allgemeine Geschäftslogik.

### `utils/` (optional)

- Enthält reine, feature-spezifische Hilfsfunktionen ohne Vue- oder Store-Zwang.
- Feature-übergreifende Utilities gehören nach `frontend/src/shared/`.

### `router/`

- Exportiert typisierte `RouteRecordRaw`-Konfigurationen und lädt Views per dynamischem Import.
- Legt Layout, Pfade, Namen und Metadaten wie `requiresAuth` passend zum Use-Case fest.
- Wird in `frontend/src/app/router/index.ts` registriert. Die Not-Found-Route bleibt zuletzt.

## Tests

- Tests liegen neben der getesteten Datei und verwenden Vitest.
- Services und Utilities werden an ihrem fachlichen Verhalten getestet.
- Store-Tests initialisieren Pinia und prüfen State-Übergänge, Fehler und Service-Aufrufe.
- View-Tests prüfen das beobachtbare Verhalten des Use-Cases, einschließlich relevanter Lade- und
  Fehlerzustände.
- Items-Tests können eindeutige IDs und vorhandene Übersetzungen in `de.json` und `en.json` prüfen.
- Keine redundanten Tests erzeugen, die ausschließlich eine bedeutungslose Durchreichfunktion
  bestätigen. Vorhandene sinnvolle Testmuster des Features haben Vorrang.

## Erweiterungen am Beispiel Todo-Liste

Für den Prompt „Erstelle eine View, in der alle Todos als Liste dargestellt werden“ wird zuerst
inventarisiert:

1. Gibt es den Listen-Endpunkt und seinen Typ im API-Vertrag?
2. Gibt es bereits `getTodosApi`?
3. Gibt es bereits eine Service-Funktion wie `loadTodos`?
4. Besitzt der Store bereits `items` beziehungsweise `todos` und eine passende Action?
5. Gibt es wiederverwendbare Listen- oder Zeilenkomponenten?

Vorhandene Glieder werden wiederverwendet, fehlende Glieder ergänzt. Die View erhält ihre Daten über
dieselbe Kette wie die übrigen Use-Cases des Features; es entsteht kein zweiter Datenzugriffspfad.

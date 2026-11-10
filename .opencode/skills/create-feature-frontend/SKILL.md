---
name: create-feature-frontend
description: Legt neue Frontend-Features als vollständige Use-Cases an und erweitert bestehende Features um Views, API-Funktionen, Services, Stores, Komponenten und weitere Use-Cases.
---

# Frontend-Feature anlegen oder erweitern

## Verbindliche Grundlagen

1. Lies vor der Umsetzung `references/architecture.md`. Die Datei beschreibt die Schichten,
   Importrichtungen und Integrationspunkte.
2. Beachte zusätzlich die `AGENTS.md` im Projektroot und in `frontend/`.
3. Lade bei Arbeiten an Vue-Komponenten den Skill `vue-best-practices` und befolge ihn.
4. Verwende TypeScript, `<script setup lang="ts">` sowie die Benennung und Formatierung des
   bestehenden Frontends.
5. Der API-Vertrag in `contracts/api/` ist die einzige Wahrheit für Endpunkte und Datenmodelle.
   Erfinde keine Endpunkte, Felder oder Antworttypen und ändere niemals generierte Dateien von Hand.

## 1. Arbeitsmodus bestimmen

Ermittle das betroffene Feature unter `frontend/src/features/<feature>/`:

- **Verzeichnis nicht vorhanden:** Arbeitsmodus [Neues Feature](#2-neues-feature-anlegen).
- **Verzeichnis vorhanden:** Arbeitsmodus [Bestehendes Feature erweitern](#3-bestehendes-feature-erweitern),
  auch wenn eine neue View oder ein neuer Use-Case angefordert wird.
- Ist das betroffene Feature oder der angeforderte Umfang unklar, frage nach, bevor du Dateien änderst.

## 2. Neues Feature anlegen

### Use-Case klären

Ein allgemeiner Prompt wie **„Lege das Feature Todo an“** enthält noch keinen ausreichend
bestimmten Use-Case. Lege in diesem Fall noch keine Dateien an, sondern frage beispielsweise:

> Welcher erste Use-Case soll für Todo umgesetzt werden – beispielsweise Todos anzeigen, ein neues
> Todo erstellen oder beides?

Erzeuge nicht automatisch vollständiges CRUD. Ist ein konkreter Use-Case angegeben, implementiere
ihn als **vollständigen, lauffähigen vertikalen Ausschnitt** mit allen dafür benötigten Schichten,
Integrationen und Tests. „Vollständig“ bedeutet nicht, dass jede denkbare Schicht oder CRUD-Operation
vorhanden sein muss.

### Umsetzung

1. Prüfe die benötigten Operationen und Schemas in `contracts/api/` sowie die generierten Typen.
2. Fehlt ein Endpunkt oder Schema, stoppe die Frontend-Implementierung und kläre, ob der im Root
   beschriebene Fullstack-Workflow ausgeführt werden soll. Nach Vertragsänderungen müssen Backend,
   `npm run gen:api` in `frontend/` und die Alias-Typen aufeinander abgestimmt werden.
3. Plane den Datenfluss gemäß `references/architecture.md` und lege nur benötigte Dateien an.
4. Verwende passende Dateien aus `templates/` als flexible Ausgangspunkte. Pfade, Parameter,
   Rückgabetypen und Verhalten müssen zum Vertrag und zum Use-Case passen.
5. Integriere das Feature vollständig:
   - Feature-Router in `frontend/src/app/router/index.ts` registrieren; die Not-Found-Route bleibt
     die letzte Route.
   - sichtbare Texte in `frontend/src/locales/de.json` und `en.json` ergänzen
   - benötigte Aliase auf generierte Schemas in `frontend/src/shared/api/types.ts` ergänzen
   - Loading-, Empty-, Error- und Erfolgszustände behandeln, soweit sie für den Use-Case relevant sind
6. Ergänze Tests für das neue Verhalten. Reine Durchreichfunktionen benötigen nicht allein wegen der
   Dateistruktur einen Test.

## 3. Bestehendes Feature erweitern

1. Lies zuerst den Aufbau und die für den Use-Case relevanten Dateien des bestehenden Features.
   Seine Benennung, Schichtung, Importe, Fehlerbehandlung und Testmuster sind das primäre Vorbild.
2. Ermittle die vorhandene Kette aus API-Funktionen, Services, Store, Views und Komponenten.
3. Verwende vorhandene Bausteine wieder und ergänze ausschließlich fehlende Teile. Keine parallelen
   Stores, Services oder API-Funktionen für denselben Zweck anlegen.
4. Beispiel „Alle Todos in einer View darstellen“:
   - Sind `getTodosApi`, `loadTodos` und `fetchTodos` bereits vorhanden, nur noch View, gegebenenfalls
     Komponente, Route, Übersetzungen und Tests ergänzen.
   - Fehlt ein Glied, nur dieses Glied und seine notwendigen Anschlüsse ergänzen.
   - Fehlt der Endpunkt im Vertrag, gilt dieselbe Fullstack-Abfrage wie beim neuen Feature.
5. Templates haben bei einer Erweiterung nur untergeordnete Bedeutung. Nutze sie höchstens für eine
   bisher nicht vorhandene Dateiart, wenn das Feature selbst kein passendes Muster enthält.
6. Überschreibe oder refaktorisiere keine funktionierenden Feature-Teile, die für den neuen Use-Case
   nicht geändert werden müssen. Weicht das bestehende Feature unklar vom dokumentierten Muster ab,
   frage nach, statt die Abweichung blind zu übernehmen.
7. Erweitere bestehende Tests und ergänze neue Tests für das zusätzliche Verhalten.

## 4. Templates verwenden

Die Inhalte der Templates werden nicht automatisch geladen. Lies nur die für den Use-Case benötigten
Vorlagen und kopiere sie nicht ungeprüft.

Platzhalter:

| Platzhalter | Bedeutung | Beispiel |
| --- | --- | --- |
| `__name__` | Feature- oder Typname in camelCase, singular | `todo` |
| `__Name__` | Feature- oder Typname in PascalCase, singular | `Todo` |
| `__names__` | tatsächlicher Pfad- oder Ressourcenname | `todos` |
| `__Names__` | Ressourcenname in PascalCase, plural | `Todos` |

`__names__` ist insbesondere kein Freifahrtschein für eine geratene URL: In API-Templates muss der
Pfad immer aus dem API-Vertrag stammen; im Router wird er an die gewünschte Frontend-Route angepasst.
IDs, Antworten und List-Responses müssen ebenfalls an den Vertrag angepasst werden.

| Vorlage | Typisches Ziel |
| --- | --- |
| `templates/api.ts.template` | `api/get<Name>Api.ts` |
| `templates/api-list.ts.template` | `api/get<Names>Api.ts` |
| `templates/service.ts.template` | `services/<name>Service.ts` |
| `templates/service.test.ts.template` | `services/<name>Service.test.ts` |
| `templates/store.ts.template` | `store/<name>Store.ts` |
| `templates/view.vue.template` | `ui/views/<Name>View.vue` |
| `templates/router.ts.template` | `router/index.ts` |
| `templates/items.ts.template` | `ui/items/<name>Items.ts` |
| `templates/items.test.ts.template` | `ui/items/<name>Items.test.ts` |

Übernimm nur benötigte Funktionen, States und Actions. Items sind optional und nur für
konfigurationsgetriebene UI-Listen vorgesehen. Entferne nicht benötigte Vorlagenbestandteile und
ersetze alle Platzhalter und erklärenden Template-Kommentare durch die konkrete Implementierung.

## 5. Abschlussprüfung

- Keine Template-Platzhalter oder unfertigen Template-Kommentare im erzeugten Code.
- Keine ungenutzten Schichten, doppelten Zugriffspfade oder direkten API-Aufrufe aus Store/UI.
- Router, Übersetzungen und benötigte Typ-Aliase sind integriert.
- Nach Vertragsänderungen ist `frontend/src/shared/api/schema.d.ts` neu generiert.
- In `frontend/` laufen `npm run type-check`, `npm run test`, `npm run build` und
  `npm run format:check` erfolgreich.

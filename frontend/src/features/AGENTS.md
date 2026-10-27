# Features

Jedes Feature liegt in `src/features/<name>/` und besteht aus:

- `router/`: Routen des Features, Layout als Parent, Views als `children`
- `api/`: HTTP-Aufrufe, keine Logik
- `services/`: Geschäftslogik, nutzt die API-Schicht
- `store/`: Zustand, kein direkter API-Zugriff
- `ui/`: Darstellung (siehe unten)

Importe gehen nur nach unten: ui → store → services → api.
Eine Schicht importiert nie aus einer höheren und überspringt keine Schicht.
`shared/` darf aus jeder Schicht importiert werden, `features/` nie aus `shared/`.
`router/` ist keine Datenschicht: Es darf `@/app/layouts` und `../ui/views` importieren,
aber nicht `store`, `services` oder `api`.

Zum Anlegen eines neuen Features den Skill `create-feature` verwenden
(`.opencode/skills/create-feature/SKILL.md`). Er enthält auch die Vorlagen.

## Datenfluss

```
View (ui/views)
  → Store-Action (store/<name>Store.js)
    → Service (services/<name>Service.js)
      → API (api/get<Name>Api.js)
        → apiFetch (shared/api) → Backend
```

Die View ruft nur Store-Actions auf, nie Services oder die API direkt.
Der Store hält `item`/`items`, `loading` und `error`; Fehler werden in der Action
gefangen und in `error` abgelegt, nicht in der View.

### ui

- `ui/views/`: ganze Seiten, je eine pro Route
- `ui/components/`: wiederverwendbare Bausteine, die in mehreren Views vorkommen
- `ui/items/`: Beschreibung der Einträge einer Liste, die per `v-for` gerendert wird
  (z. B. Formularfelder, Tabellenspalten, Detailfelder, Navigationseinträge).
  Nur für Listen, nicht für einzelne Texte. Ohne Logik, Markup, Texte oder veränderliche Werte.
  - `id`: camelCase, im Feature eindeutig, nach Möglichkeit gleich der Store-Eigenschaft
  - `labelKey`: `<name>.<id>`
  - Beispiel: `{ id: "newTodo", labelKey: "todo.newTodo" }`
  - Items aus den Anforderungen des Features ableiten. Sind die Felder unklar, nachfragen
    statt raten. Anforderungen stehen in der Vorgabe des Nutzers oder in einer
    `requirements.md` im Repository-Root.

## Zustand

- Pro Feature genau ein Pinia-Store `use<Name>Store` in `store/<name>Store.js`.
  Er wird nicht zentral registriert.
- Stil wie in der Vorlage: Options-API-Store mit `state` und `actions`.
- Veränderliche Werte (z. B. Eingaben) liegen im Store, z. B. `useTodoStore().todoValue`,
  nie in Items.

## Route

- Jedes Feature hat `router/index.js`. Dort wird das Layout importiert und als Eltern-Route
  verwendet, die Views sind `children`:

  ```js
  import AppLayout from '@/app/layouts/AppLayout.vue'

  export default {
    path: '/',
    component: AppLayout,
    children: [
      { path: 'recipes', name: 'recipe', component: () => import('../ui/views/RecipeView.vue') },
    ],
  }
  ```

- `src/app/router/index.js` importiert den Feature-Router und legt ihn ins `routes`-Array:
  `import recipeRoutes from '@/features/recipe/router'` → `const routes = [..., recipeRoutes]`.
- Kein `meta.layout`: Das Layout ergibt sich aus der Eltern-Route.
- Geschützte Seiten → `AppLayout`, öffentliche Seiten → `PublicLayout`, Auth → `AuthLayout`.
- `children`-Pfade relativ ohne führenden Slash. Mehrere Features dürfen `path: '/'` als
  Parent haben, solange die vollen Pfade und Route-Namen eindeutig sind.

## Texte und Übersetzungen

- Alle sichtbaren Texte stehen in `src/locales/de.json` und `src/locales/en.json`, nie fest im Code.
- Neue Schlüssel immer in beiden Dateien anlegen.
- Einzelne feste Texte (Überschrift, Buttons, Hinweise): direkt über `t('<name>.<key>')`,
  z. B. `t('health.refresh')`. Kein Item dafür anlegen.
- Listen (alles, was per `v-for` gerendert wird): über Items, Texte per `t(item.labelKey)`.

## Benennung

- Dateien zu einem Datensatz im Singular (`getCustomerApi.js`), Listen im Plural (`getCustomersApi.js`)
- Services: `<name>Service.js`, Stores: `<name>Store.js`, Store-Funktion: `use<Name>Store`
- Views: `<Name>View.vue`, Items: `<name>Items.js`, Router: `router/index.js`
- Übersetzungsschlüssel: `<name>.<key>` in camelCase, z. B. `health.refresh`

## Tests

- Service-Tests: `<name>Service.test.js`, API-Aufrufe mit `vi.mock` ersetzen.
- Item-Tests: `<name>Items.test.js`, prüfen Ids, `labelKey`-Schema und dass jeder
  Schlüssel in `de.json` und `en.json` existiert.
- Tests liegen neben dem Code; `npm test` muss grün sein.

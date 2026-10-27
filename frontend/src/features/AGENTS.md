## Architektur

Jedes Feature liegt in `features/<name>/` und besteht aus:

- `api/`: HTTP-Aufrufe, keine Logik
- `services/`: Geschäftslogik, nutzt die API-Schicht
- `store/`: Zustand, kein direkter API-Zugriff
- `ui/`: Darstellung (siehe unten)

Importe gehen nur nach unten: ui → store → services → api.
Eine Schicht importiert nie aus einer höheren und überspringt keine Schicht.
Zum Anlegen eines neuen Features den Skill `create-feature` verwenden.

### ui

- `ui/views/`: ganze Seiten, je eine pro Route
- `ui/components/`: wiederverwendbare Bausteine, die in mehreren Views vorkommen
- `ui/items/`: Beschreibung der Einträge einer Liste, die per `v-for` gerendert wird
  (z. B. Formularfelder, Tabellenspalten, Detailfelder, Navigationseinträge).
  Nur für Listen, nicht für einzelne Texte. Ohne Logik, Markup, Texte oder veränderliche Werte.
  - `id`: camelCase, im Feature eindeutig, nach Möglichkeit gleich der Store-Eigenschaft
  - `labelKey`: `<name>.<id>`
  - Beispiel: `{ id: "newTodo", labelKey: "todo.newTodo" }`
  - Items aus den Anforderungen des Features ableiten (`requirements.md` bzw. Vorgabe des Nutzers). Sind die Felder unklar, nachfragen statt raten.

## Zustand

- Pro Feature genau ein Pinia-Store `use<Name>Store`. Er wird nicht zentral registriert.
- Veränderliche Werte (z. B. Eingaben) liegen im Store, z. B. `useTodoStore().todoValue`, nie in Items.

## Texte und Übersetzungen

- Alle sichtbaren Texte stehen in `src/locales/de.json` und `src/locales/en.json`, nie fest im Code.
- Neue Schlüssel immer in beiden Dateien anlegen.
- Einzelne feste Texte (Überschrift, Buttons, Hinweise): direkt über `t('<name>.<key>')`, z. B. `t('health.refresh')`. Kein Item dafür anlegen.
- Listen (alles, was per `v-for` gerendert wird): über Items, Texte per `t(item.labelKey)`.

## Benennung

- Dateien zu einem Datensatz im Singular (`getCustomerApi.js`), Listen im Plural (`getCustomersApi.js`)
- Services: `<name>Service.js`, Stores: `<name>Store.js`, Store-Funktion: `use<Name>Store`
- Views: `<Name>View.vue`, Items: `<name>Items.js`
- Übersetzungsschlüssel: `<name>.<key>` in camelCase, z. B. `health.refresh`

## Router/Layouts

- Ist der Benutzer angemeldet, werden views aus `/features/ui/views/` in `app/layouts/AppLayout.vue` durch router-view gerendert.
- Ist der Benutzer nicht angemeldet, werden die views in `app/layouts/PublicLayout.vue` gerendert.
- Für auth routen, wie /sign-in oder /sign-up, werden die views in `app/layouts/AuthLayout.vue` gerendert.

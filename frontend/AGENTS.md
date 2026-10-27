# Frontend

Vue 3 mit Vite, Pinia, vue-router, vue-i18n und Vitest. Styles mit SCSS.
**Kein UI-Framework**, **kein TypeScript** (JavaScript, `jsconfig.json` nur für den `@`-Alias).

## Befehle

```bash
npm install
npm run dev        # Dev-Server, Port 5173
npm test           # Tests einmalig
npm run test:unit  # Tests im Watch-Modus
npm run build      # Production-Build
npm run format     # Prettier
```

`.env` nach Vorlage `.env.example` anlegen. Es gibt kein ESLint und keinen Typecheck.

## Architektur

```
src/
├── app/          Zusammenbau der Anwendung
│   ├── i18n/     vue-i18n-Instanz
│   ├── layouts/  AppLayout, AuthLayout, PublicLayout (+ layouts/components)
│   └── router/   importiert nur die Feature-Router
├── features/     Fachbereiche, siehe src/features/AGENTS.md
├── locales/      de.json, en.json
└── shared/       Wiederverwendbares
    ├── api/      apiFetch
    ├── components/  Button, Footer, Logo, Sidebar, Topbar, UserMenu
    └── styles/   _variables, _breakpoints, _media, global.scss
```

### app/

Hier liegt der Code, der die gesamte Anwendung zusammenführt und konfiguriert.
`app/router/index.js` ist nur die Sammelstelle für die Feature-Router. Seiten liegen
immer in `features/<name>/ui/views/`, auch die Startseite (`features/home`) und Auth
(`features/auth`).

### features/

Hier liegt der Code für konkrete Anwendungsbereiche.
Lies die Datei `src/features/AGENTS.md`.

### shared/

Code, der von mehreren Features verwendet wird und nicht zu einem einzelnen Feature gehört.
`shared/` importiert nie aus `features/` oder `app/`.

## Layouts und Router

- `App.vue` enthält nur `<RouterView />`. Das Layout wird über die Routen-Struktur gewählt,
  nicht über `meta`.
- Jedes Feature hat eine eigene Router-Datei `features/<name>/router/index.js`. Dort wird das
  Layout importiert und als Eltern-Route verwendet; die Views sind `children`:

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

- `src/app/router/index.js` importiert nur noch die Feature-Router und sammelt sie im
  `routes`-Array. Dort stehen weder Layouts noch Views.
- URLs sind flach: `/<plural>` (z. B. `/recipes`), Auth-Routen unter `/auth/...`.
- Layout-Zuordnung im Feature-Router: öffentliche Seiten → `PublicLayout`, `/auth/...` →
  `AuthLayout`, angemeldete Bereiche → `AppLayout`. Layouts werden statisch importiert,
  Views lazy (`() => import(...)`).
- Mehrere Feature-Router dürfen `path: '/'` als Parent haben, solange die vollen Pfade
  eindeutig bleiben. Route-Namen müssen eindeutig sein (Feature-Singular).
- Ein 404-Catch-all gehört auf die oberste Ebene, nicht in einen Layout-Block.

## Texte und Übersetzungen

- Alle sichtbaren Texte stehen in `src/locales/de.json` und `src/locales/en.json`, nie fest im Code.
- Neue Schlüssel immer in beiden Dateien anlegen.
- In `<script setup>`: `const { t } = useI18n()`, im Template `{{ t('home.title') }}`.
- Generische Primitives (`Button`) bekommen den fertigen Text als Prop:
  `:label="t('auth.signIn')"`.
- App-Chrome (`Logo`, `Footer`, `UserMenu`, `Sidebar`) übersetzt seine Texte selbst.
- Listen werden über Items gerendert (`v-for` + `t(item.labelKey)`), siehe `src/features/AGENTS.md`.

## API

- Alle Aufrufe über `apiFetch` aus `src/shared/api/apiFetch.js`.
- Basis-URL aus `VITE_API_URL` (siehe `.env.example`), Pfade ohne Präfix: `apiFetch('/users/me')`.
- `credentials: 'include'` ist gesetzt (Refresh-Cookie).
- Geschützte Endpunkte: `Authorization: Bearer <accessToken>` im `headers`-Objekt übergeben.
- Fehler werfen einen `Error` mit `status` und `data`; Store-Actions fangen sie und legen sie in `error` ab.
- Antworten sind camelCase-JSON ohne Envelope, `_id` kommt als `id`.

## Styling

- `<style scoped>` in den Komponenten, `<style scoped lang="scss">` nur bei Bedarf.
- Design-Tokens als CSS-Variablen aus `shared/styles/global.scss`
  (`--space-md`, `--color-text`, `--topbar-height`, …). Keine hartcodierten Farben oder Abstände.
- Breakpoints: `@use "@/shared/styles/breakpoints" as bp;` und
  `@use "@/shared/styles/media" as media;` → `@include media.up(bp.$bp-lg) { … }`.
- `global.scss` wird in `main.js` importiert und darf nicht in Komponenten importiert werden.

## Tests

- Vitest mit jsdom, `@vue/test-utils`; `npm test` muss grün sein.
- Feature-Tests liegen neben dem Code (`<name>Service.test.js`, `<name>Items.test.js`).
- App-weite Tests liegen in `src/__tests__/`.
- Beim Mounten die echten Plugins verwenden: `createPinia()`, `router` aus `app/router`,
  `i18n` aus `app/i18n`. i18n nicht mocken.

## Offene Punkte

- Kein Auth-Flow: Es gibt weder Login-/Logout-Views noch Token-Handling oder Route-Guards.
  Die Zuordnung zum `AppLayout` ist nur Darstellung, sie schützt keine Route.
- `/auth/sign-in` und `/auth/sign-up` rendern `AuthPlaceholderView` als Platzhalter.
- Kein ESLint und kein Typecheck; Qualitätssicherung über Prettier, Tests und Build.

## Benennung

- Komponenten und Views: `PascalCase.vue`; pro Ordner ein `index.js` als Sammel-Export.
- Composables: `use<Name>.js`; Utilities: `<name>.js`.
- Dateien zu einem Datensatz im Singular, Listen im Plural.
- Weitere Regeln für Features: `src/features/AGENTS.md`.

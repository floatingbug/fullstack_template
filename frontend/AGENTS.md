# Frontend

Vue 3 mit Vite, Pinia, vue-router, vue-i18n und Vitest. Styles mit reinem CSS
(Custom Properties, kein SCSS). **Kein UI-Framework**, **kein TypeScript** (JavaScript,
`jsconfig.json` nur für den `@`-Alias).

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
│   ├── router/   importiert die Feature-Router und installiert den Auth-Guard
│   └── pinia.js  Singleton-Pinia für App und Guard
├── features/     Fachbereiche, siehe src/features/AGENTS.md
├── locales/      de.json, en.json
└── shared/       Wiederverwendbares
    ├── api/      apiFetch, authSession, baseUrl
    ├── components/  Button, Footer, Input, Logo, Sidebar, ThemeToggle, Topbar, UserMenu
    ├── router/   safeRedirect
    ├── theme/    theme.js (Light/Dark/System)
    └── styles/   tokens.css, theme.css, base.css, index.css, README.md
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
  `routes`-Array. Dort stehen weder Layouts noch Views. Zusätzlich registriert die Datei
  den Auth-Guard (`installAuthGuard(router)`).
- Geschützte Seiten setzen `meta: { requiresAuth: true }`, reine Gast-Seiten
  (Anmelden, Registrieren, Passwort vergessen) `meta: { guestOnly: true }`. Der Guard in
  `app/router/guards.js` leitet Gäste mit `redirect`-Query zur Anmeldung und angemeldete
  User von Gast-Seiten weg. Das `redirect`-Ziel wird mit `safeRedirect` geprüft.
- `main.js` nutzt die Singleton-Pinia aus `app/pinia.js`, damit Guard und Komponenten
  denselben Auth-Store sehen. In Tests dieselbe Instanz verwenden und vor jedem Test
  `useAuthStore(pinia).$reset()` aufrufen.
- URLs sind flach: `/<plural>` (z. B. `/recipes`), Auth-Routen unter `/auth/...`.
- Layout-Zuordnung im Feature-Router: öffentliche Seiten → `PublicLayout`, `/auth/...` →
  `AuthLayout`, angemeldete Bereiche → `AppLayout`. Layouts werden statisch importiert,
  Views lazy (`() => import(...)`).
- `Topbar` enthält den ThemeToggle. `AuthLayout` hat einen eigenen Header mit Logo und
  ThemeToggle, weil dort keine Topbar verwendet wird.
- Mehrere Feature-Router dürfen `path: '/'` als Parent haben, solange die vollen Pfade
  eindeutig bleiben. Route-Namen müssen eindeutig sein (Feature-Singular).
- Ein 404-Catch-all gehört auf die oberste Ebene, nicht in einen Layout-Block.

## Texte und Übersetzungen

- Alle sichtbaren Texte stehen in `src/locales/de.json` und `src/locales/en.json`, nie fest im Code.
- Neue Schlüssel immer in beiden Dateien anlegen.
- In `<script setup>`: `const { t } = useI18n()`, im Template `{{ t('home.title') }}`.
- Generische Primitives (`Button`) bekommen den fertigen Text als Prop:
  `:label="t('auth.signIn')"`.
- App-Chrome (`Logo`, `Footer`, `UserMenu`, `Sidebar`, `ThemeToggle`) übersetzt seine Texte selbst.
- Listen werden über Items gerendert (`v-for` + `t(item.labelKey)`), siehe `src/features/AGENTS.md`.

## API

- Alle Aufrufe über `apiFetch` aus `src/shared/api/apiFetch.js`.
- Basis-URL aus `VITE_API_URL` (siehe `.env.example`), Pfade ohne Präfix: `apiFetch('/users/me')`.
- `credentials: 'include'` ist gesetzt (Refresh-Cookie).
- `apiFetch` hängt den Access-Token automatisch an (`shared/api/authSession.js`, nur im RAM)
  und erneuert ihn bei `401` einmal über das Refresh-Cookie. Parallele Refreshes werden
  geteilt. Öffentliche Endpunkte setzen `auth: false`, Login und Refresh zusätzlich
  `retryOnUnauthorized: false`.
- Fehler werfen einen `Error` mit `status` und `data`; Store-Actions fangen sie und legen
  einen i18n-Key in `errorKey` ab.
- Antworten sind camelCase-JSON ohne Envelope, `_id` kommt als `id`.

## Auth und Session

- Der Access-Token liegt ausschließlich im Speicher (`shared/api/authSession.js`), nie in
  `localStorage` oder `sessionStorage`. Nach einem Reload wird er über das HttpOnly-Cookie
  erneut angefordert.
- `features/auth/store/authStore.js` hält `status` (`unknown | guest | authenticated`),
  `user`, Formularzustände und Fehler-Keys. `restoreSession()` läuft einmal pro Seitenaufruf
  und wird vom Guard ausgelöst.
- Die Anmeldung setzt Token und User; die Registrierung meldet **nicht** automatisch an,
  weil zuerst die E-Mail bestätigt werden muss.
- Backend-Meldungen werden nie direkt angezeigt. `services/authErrors.js` übersetzt
  Statuscodes in i18n-Keys, die Views rendern `t(store.errorKey)`.
- Mail-Links zeigen auf `/auth/verify-email`, `/auth/reset-password` und
  `/auth/confirm-email-change` (jeweils mit `?token=`).

## Styling

- Reines CSS, kein SCSS/Sass. Komponenten nutzen `<style scoped>` ohne `lang="scss"`.
- `shared/styles/index.css` importiert Schrift, `tokens.css`, `theme.css` und `base.css`.
  Die Datei wird in `main.js` importiert und nie in Komponenten.
- `tokens.css` enthält Rohpalette, Typografie, Abstände, Radien, Schatten, Layoutgrößen und
  Bewegung. `theme.css` bildet sie auf semantische Tokens ab (`--color-bg`, `--color-text`,
  `--color-primary`, …) und steuert Light/Dark/System über `light-dark()` und `color-scheme`.
- Komponenten verwenden nur semantische Tokens (`--color-*`, `--space-*`, `--radius-*`,
  `--shadow-*`, `--font-*`). Keine Hex-/RGB-Werte und keine Magic Numbers.
- Dark Mode ausschließlich über die Tokens. Kein eigenes
  `@media (prefers-color-scheme)` in Komponenten.
- Breakpoints sind normale `@media`-Queries (480 / 768 / 1024 / 1280 px), weil
  CSS-Variablen in Media Queries nicht funktionieren.
- Fokusring, Selection und reduzierte Bewegung kommen global aus `base.css`.
- Der Theme-Schalter besteht aus `shared/theme/theme.js` und `ThemeToggle.vue`. `Topbar`
  (Public- und App-Layout) sowie `AuthLayout` binden ihn ein. Die Auswahl liegt in
  `localStorage` (`theme`); ein Inline-Script in `index.html` verhindert das Aufblitzen
  des falschen Themes.
- Anpassung für neue Projekte: `shared/styles/README.md` (Marke, Typografie, Form, Dichte,
  Layout und Design-Brief).

## Tests

- Vitest mit jsdom, `@vue/test-utils`; `npm test` muss grün sein.
- Feature-Tests liegen neben dem Code (`<name>Service.test.js`, `<name>Items.test.js`).
- App-weite Tests liegen in `src/__tests__/`.
- Beim Mounten die echten Plugins verwenden: `createPinia()`, `router` aus `app/router`,
  `i18n` aus `app/i18n`. i18n nicht mocken.
- Auth-Tests: `apiFetch` mit gestubtem `fetch` testen, `authSession` und `authService` per
  `vi.mock` ersetzen. Der Auth-Store wird vor jedem Test zurückgesetzt; der Guard nutzt die
  Singleton-Pinia aus `app/pinia.js`.
- Theme-Tests: `shared/theme/theme.test.js` und `ThemeToggle.test.js`. Vor jedem Test
  `setTheme('system')` aufrufen und `localStorage` leeren.

## Offene Punkte

- Kein ESLint und kein Typecheck; Qualitätssicherung über Prettier, Tests und Build.

## Benennung

- Komponenten und Views: `PascalCase.vue`; pro Ordner ein `index.js` als Sammel-Export.
- Composables: `use<Name>.js`; Utilities: `<name>.js`.
- Dateien zu einem Datensatz im Singular, Listen im Plural.
- Weitere Regeln für Features: `src/features/AGENTS.md`.

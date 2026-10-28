# Design-System

Das Design-System ist reines CSS (kein SCSS) und liegt in
`frontend/src/shared/styles`. Komponenten verwenden ausschließlich die
semantischen Tokens, nie die Rohwerte aus der Palette.

## Dateien

| Datei        | Inhalt                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------- |
| `tokens.css` | Markenpalette, neutrale Palette, Statusfarben, Typografie, Abstände, Radien, Layoutgrößen, Bewegung |
| `theme.css`  | Semantische Farben und Schatten für Light, Dark und System                                          |
| `base.css`   | Reset, Element-Standards, Fokusring, Selection, reduzierte Bewegung                                 |
| `index.css`  | Importiert Schrift und alle Stylesheets                                                             |
| `README.md`  | Diese Anleitung                                                                                     |

`index.css` wird in `src/main.js` importiert und darf nicht in Komponenten
importiert werden.

## Neues Projekt anpassen

### 1. Marke

In `tokens.css` die `--brand-*`-Werte ersetzen. Für die meisten Projekte reicht
eine Primärfarbe plus passende helle und dunkle Abstufungen:

```css
--brand-500: #4a74f2;
--brand-600: #2f5bea; /* Primäraktion im Light-Mode */
--brand-700: #2447c9; /* Hover im Light-Mode */
--brand-300: #92b1ff; /* Primäraktion im Dark-Mode */
```

Die Zuordnung zu den semantischen Tokens steht in `theme.css`
(`--color-primary`, `--color-primary-hover`, …).

### 2. Typografie

Die Basisschrift ist Instrument Sans (self-hosted über
`@fontsource-variable/instrument-sans`, OFL). Für eine andere Schrift:

1. Paket installieren, z. B. `npm install @fontsource-variable/<schrift>`.
2. Import in `index.css` austauschen.
3. `--font-family-base` in `tokens.css` anpassen.
4. Bei Bedarf die Größenleiter (`--font-size-*`) und Laufhöhen
   (`--line-height-*`) überschreiben.

### 3. Form und Dichte

- Rundungen: `--radius-xs` bis `--radius-full`
- Abstände: `--space-2xs` bis `--space-3xl` (4-px-Raster)
- Schatten: `--shadow-sm`, `--shadow-md`, `--shadow-lg`

Für ein kompakteres UI die Abstände eine Stufe kleiner wählen; für ein
großzügigeres UI eine Stufe größer. Komponenten nicht einzeln anfassen.

### 4. Layout

`--topbar-height`, `--footer-height`, `--sidebar-width`,
`--content-max-width` und `--auth-card-width` in `tokens.css` anpassen.
Die Breakpoints stehen direkt als Media Queries in den Layouts
(480 / 768 / 1024 / 1280 px). CSS-Variablen funktionieren in Media Queries
nicht; deshalb sind sie bewusst nicht als Tokens definiert.

### 5. Design-Brief für ein neues Projekt

Diese Vorlage ausfüllen und danach die Tokens anpassen:

```text
Produkt:
Zielgruppe:
Hauptaufgabe der Oberfläche:
Stimmung (3 Adjektive):
Primärfarbe:
Sekundärfarbe (optional):
Schrift:
Rundungen (eckig / weich):
Dichte (kompakt / großzügig):
Besonderes Element:
```

## Themes

`theme.css` definiert die semantischen Farben mit `light-dark()`. Der Modus
wird über `color-scheme` gesteuert:

```css
:root {
  color-scheme: light dark; /* System */
}

:root[data-theme='light'] {
  color-scheme: light;
}

:root[data-theme='dark'] {
  color-scheme: dark;
}
```

`light-dark()` liefert automatisch den passenden Wert. Deshalb gibt es keine
doppelten Dark-Mode-Blöcke, und native Formularelemente sowie Scrollbars
passen sich mit an. Das setzt moderne Browser voraus (Baseline 2024).

Der Modus wird auf `<html data-theme="…">` gesetzt:

| Wert     | Bedeutung                    |
| -------- | ---------------------------- |
| `light`  | immer hell                   |
| `dark`   | immer dunkel                 |
| `system` | folgt `prefers-color-scheme` |

Der Inline-Script in `frontend/index.html` setzt den Wert vor dem ersten Paint
aus `localStorage` (Schlüssel `theme`). Das verhindert ein Aufblitzen des
falschen Themes. Ohne JavaScript bleibt `color-scheme: light dark` aktiv und
das Design folgt dem System.

## Regeln für Komponenten

- Nur semantische Tokens verwenden: `--color-*`, `--space-*`, `--radius-*`,
  `--shadow-*`, `--font-*`.
- Keine Hex-, RGB- oder HSL-Werte in Komponenten.
- Kein eigenes `@media (prefers-color-scheme)` in Komponenten. Dark Mode
  entsteht ausschließlich über die Tokens.
- Neue Farben zuerst als semantischen Token in `theme.css` ergänzen, dann in
  der Komponente verwenden.
- `<style scoped>` ohne `lang="scss"`.
- Fokusring und reduzierte Bewegung kommen global aus `base.css`; nicht
  lokal überschreiben, außer es gibt einen fachlichen Grund.
- Abstände und Rundungen nicht als Magic Numbers setzen.

## Theme-Schalter

- `src/shared/theme/theme.js`: reaktiver Modus, `localStorage`, Synchronisierung
  zwischen Tabs.
- `src/shared/components/ThemeToggle.vue`: dreiteiliger Schalter mit
  `aria-pressed` und i18n-Labels.
- Der Schalter steckt in `Topbar.vue` (Public- und App-Layout) und im
  `AuthLayout`, weil dort keine Topbar existiert.
- Texte: `theme.label`, `theme.light`, `theme.dark`, `theme.system` in
  `de.json` und `en.json`.

## Breakpoints

| Name | Breite  | Verwendung          |
| ---- | ------- | ------------------- |
| sm   | 480 px  | kleine Anpassungen  |
| md   | 768 px  | Tablet              |
| lg   | 1024 px | Desktop mit Sidebar |
| xl   | 1280 px | große Flächen       |

Beispiel:

```css
@media (min-width: 1024px) {
  .layout {
    display: grid;
  }
}
```

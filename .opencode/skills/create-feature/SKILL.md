---
name: create-feature
description: Legt ein neues Feature (Frontend und bei Bedarf Backend) mit API-, Service-, Store- und UI-Schicht samt Tests, Route und Übersetzungen (de/en) an, bei Bedarf mit Items für Listen. Verwende diesen Skill immer, wenn ein neues Feature, ein neuer Fachbereich oder eine neue Seite samt Datenanbindung entstehen soll (z. B. "Recipe", "MealPlan", "lege das Feature Kunden an"), auch wenn der Nutzer nicht ausdrücklich "Skill" oder "Feature" sagt. Nicht verwenden für Änderungen an bestehenden Features.
---

# Neues Feature anlegen

Die allgemeinen Architektur-, Benennungs- und Übersetzungsregeln stehen in
`frontend/AGENTS.md` und `frontend/src/features/AGENTS.md`. Dieser Skill beschreibt
nur den Ablauf und die Vorlagen. Lies bei Unklarheiten zuerst diese Dateien.

Alle Pfade in diesem Dokument sind relativ zum Repository-Root.

## Eingaben

Falls nicht genannt, frage nach:

- Name des Features im Singular (z. B. `Recipe`)
- Plural dazu (z. B. `Recipes`), nicht selbst ableiten
- Welche Texte und welche Listen die UI braucht (z. B. Formularfelder, Tabellenspalten),
  aus `requirements.md` oder der Vorgabe des Nutzers. Sind sie unklar, nachfragen statt raten.
- Ob das Feature Daten im Backend speichert. Wenn ja: welche Felder, welche Endpunkte,
  und ob eine Anmeldung nötig ist.
- Ob die Seiten geschützt sind (`AppLayout`) oder öffentlich (`PublicLayout`).

## Platzhalter

Die Vorlagen in `templates/` verwenden diese Platzhalter. Sie dürfen im Ergebnis nirgends mehr vorkommen.

| Platzhalter | Bedeutung | Beispiel |
|---|---|---|
| `__Name__` | Singular, PascalCase | `Recipe` |
| `__name__` | Singular, camelCase | `recipe` |
| `__Names__` | Plural, PascalCase | `Recipes` |
| `__names__` | Plural, camelCase | `recipes` |

## Zuordnung Vorlage → Zieldatei

| Vorlage in `templates/` | Zieldatei |
|---|---|
| `api.js.template` | `frontend/src/features/__name__/api/get__Name__Api.js` |
| `api-list.js.template` | `frontend/src/features/__name__/api/get__Names__Api.js` |
| `service.js.template` | `frontend/src/features/__name__/services/__name__Service.js` |
| `service.test.js.template` | `frontend/src/features/__name__/services/__name__Service.test.js` |
| `store.js.template` | `frontend/src/features/__name__/store/__name__Store.js` |
| `router.js.template` | `frontend/src/features/__name__/router/index.js` |
| `view.vue.template` | `frontend/src/features/__name__/ui/views/__Name__View.vue` |
| `items.js.template` | `frontend/src/features/__name__/ui/items/__name__Items.js` (nur wenn das Feature Listen rendert) |
| `items.test.js.template` | `frontend/src/features/__name__/ui/items/__name__Items.test.js` (nur zusammen mit den Items) |

Der Ordner `frontend/src/features/__name__/ui/components/` wird nur angelegt, wenn das Feature
eigene Components braucht. Für Dateien ohne Vorlage keine Dateien erfinden.

## Frontend-Schritte

1. Prüfe, dass `frontend/src/features/__name__/` noch nicht existiert. Wenn doch: abbrechen und nachfragen.
2. Lege die Ordner `router/`, `api/`, `services/`, `store/` und `ui/views/` an.
   `ui/items/` nur, wenn das Feature mindestens eine Liste per `v-for` rendert.
3. Lies die Vorlagen, ersetze die Platzhalter und schreibe die Zieldateien gemäß der Tabelle.
   Ändere die Struktur der Vorlagen nicht. Ergänze Fachlogik nur dort, wo `// TODO` steht.
4. Die API-Schicht nutzt immer `apiFetch` aus `frontend/src/shared/api/apiFetch.js`.
   Die Basis-URL kommt aus `VITE_API_URL` (siehe `frontend/.env.example`), Pfade werden ohne
   Präfix angegeben, z. B. `/recipes`. Kein zweiter Fetch-Wrapper, keine absolute URL im Code.
5. Rendert das Feature Listen: Fülle `__name__Items.js` mit einem Eintrag pro Listenelement,
   Schema `{ id: "<id>", labelKey: "__name__.<id>" }`, und rendere die Liste in der View
   per `v-for` mit `t(item.labelKey)`. Einzelne Texte kommen nicht in die Items, sondern
   direkt als `t('__name__.<key>')` in die View.
6. Ergänze die Übersetzungen in `frontend/src/locales/de.json` und `frontend/src/locales/en.json`:
   ein Block `__name__` (mit den echten Werten statt der Platzhalter) mit dem Schlüssel `title`,
   einem Schlüssel pro weiterem Text der View und einem Schlüssel pro Item-`id`.
   Bestehende Schlüssel nicht überschreiben.
   Beide Dateien immer gleich ergänzen, de auf Deutsch, en auf Englisch.
7. Lege den Feature-Router an: Rendere `router.js.template` nach
   `frontend/src/features/__name__/router/index.js`. Bei einem öffentlichen Feature
   `PublicLayout` statt `AppLayout` importieren. Das Layout ist dort der Parent, die View
   ist ein `children`-Eintrag; es gibt kein `meta.layout`.
8. Registriere den Feature-Router in `frontend/src/app/router/index.js`: Import
   (`import __name__Routes from '@/features/__name__/router'`) und Eintrag im `routes`-Array.
   Der App-Router importiert selbst keine Layouts und definiert keine Feature-Views.
   Fehlt die Datei, nachfragen.
9. Prüfe, dass keine Platzhalter übrig sind:
   `grep -rE "__[Nn]ames?__" frontend/src/features/__name__ frontend/src/locales frontend/src/app/router`
   darf nichts finden (im Pfad `features/__name__` den echten Namen einsetzen, das Suchmuster
   bleibt unverändert).
10. Im Ordner `frontend/`: `npm test` und `npm run build` ausführen und Fehler beheben.
    Falls Items existieren, prüft `__name__Items.test.js`, dass jeder `labelKey` in `de.json`
    und `en.json` existiert.

## Backend-Schritte (nur wenn das Feature Daten speichert)

Die Schichten und Regeln stehen in `backend/AGENTS.md`. Kurzfassung:

1. Lege `backend/src/modules/__name__/` mit `controller/`, `services/`, `models/` an
   (plus `middlewares/`, wenn Eingaben validiert werden).
2. Ein File pro Use Case; `index.js` in jedem Unterordner sammelt die Exporte.
3. `backend/src/modules/__name__/index.js` baut den Router (`express.Router()`), inklusive
   `authUser`, falls die Endpunkte eine Anmeldung brauchen.
4. Mounte den Router in `backend/main.js`: `app.use('/__names__', __name__Routes);`
   Der Pfad muss exakt dem Pfad in der Frontend-API-Schicht entsprechen.
5. Antworten: camelCase-JSON, `_id` als `id`, kein Envelope. Fehler als `{ message }`
   mit passendem Status (siehe `backend/AGENTS.md`).
6. Prüfe jede geänderte Datei mit `node --check <datei>` und führe `npm test` im Backend aus.
   Ein Lint-Setup gibt es nicht; neue Endpunkte bekommen einen Test in `backend/test/`.

## Regeln für diesen Ablauf

- Existiert das Feature schon, nichts überschreiben.
- Pro Feature genau ein Pinia-Store (`use__Name__Store`), keine zentrale Registrierung.
- Items nur für Listen, die per `v-for` gerendert werden. Einzelne Texte direkt über `t('__name__.<key>')`.
- Items enthalten nur Ids und Label-Schlüssel, keine Texte und keine veränderlichen Werte.
- Alle sichtbaren Texte stehen in `de.json` und `en.json`, nie fest im Code.

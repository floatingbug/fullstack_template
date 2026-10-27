---
name: create-feature
description: Legt ein neues Feature mit API-, Service-, Store- und UI-Schicht samt Tests, Route und Übersetzungen (de/en) an, bei Bedarf mit Items für Listen. Verwende diesen Skill immer, wenn ein neues Feature, ein neuer Fachbereich oder eine neue Seite samt Datenanbindung entstehen soll (z. B. "Recipe", "MealPlan", "lege das Feature Kunden an"), auch wenn der Nutzer nicht ausdrücklich "Skill" oder "Feature" sagt. Nicht verwenden für Änderungen an bestehenden Features.
---

# Neues Feature anlegen

Die allgemeinen Architektur-, Benennungs- und Übersetzungsregeln stehen in der `AGENTS.md`
im . Dieser Skill beschreibt nur den Ablauf und die Vorlagen.
Lies bei Unklarheiten zuerst diese `AGENTS.md`.

## Eingaben

Falls nicht genannt, frage nach:
- Name des Features im Singular (z. B. `Recipe`)
- Plural dazu (z. B. `Recipes`), nicht selbst ableiten
- Welche Texte und welche Listen die UI braucht (z. B. Formularfelder, Tabellenspalten),
  aus `requirements.md` oder der Vorgabe des Nutzers. Sind sie unklar, nachfragen statt raten.

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
| `api.js.template` | `features/__name__/api/get__Name__Api.js` |
| `api-list.js.template` | `features/__name__/api/get__Names__Api.js` |
| `service.js.template` | `features/__name__/services/__name__Service.js` |
| `service.test.js.template` | `features/__name__/services/__name__Service.test.js` |
| `store.js.template` | `features/__name__/store/__name__Store.js` |
| `view.vue.template` | `features/__name__/ui/views/__Name__View.vue` |
| `items.js.template` | `features/__name__/ui/items/__name__Items.js` (nur wenn das Feature Listen rendert) |
| `items.test.js.template` | `features/__name__/ui/items/__name__Items.test.js` (nur zusammen mit den Items) |

Der Ordner `features/__name__/ui/components/` wird nur angelegt, wenn das Feature eigene Components braucht.
Für Dateien ohne Vorlage keine Dateien erfinden.

## Schritte

1. Prüfe, dass `features/__name__/` noch nicht existiert. Wenn doch: abbrechen und nachfragen.
2. Lege die Ordner `api/`, `services/`, `store/` und `ui/views/` an.
   `ui/items/` nur, wenn das Feature mindestens eine Liste per `v-for` rendert.
3. Lies die Vorlagen, ersetze die Platzhalter und schreibe die Zieldateien gemäß der Tabelle.
   Ändere die Struktur der Vorlagen nicht. Ergänze Fachlogik nur dort, wo `// TODO` steht.
4. Rendert das Feature Listen: Fülle `__name__Items.js` mit einem Eintrag pro Listenelement,
   Schema `{ id: "<id>", labelKey: "__name__.<id>" }`, und rendere die Liste in der View
   per `v-for` mit `t(item.labelKey)`. Einzelne Texte kommen nicht in die Items, sondern
   direkt als `t('__name__.<key>')` in die View.
5. Ergänze die Übersetzungen in `src/locales/de.json` und `src/locales/en.json`:
   ein Block `__name__` (mit den echten Werten statt der Platzhalter) mit dem Schlüssel `title`,
   einem Schlüssel pro weiterem Text der View und einem Schlüssel pro Item-`id`.
   Bestehende Schlüssel nicht überschreiben.
   Beide Dateien immer gleich ergänzen, de auf Deutsch, en auf Englisch.
6. Registriere die View als Route in `src/router/index.js` (Pfad `/__names__`, Name `__name__`,
   Lazy-Import der View). Fehlt die Datei, nachfragen.
7. Prüfe, dass keine Platzhalter übrig sind:
   `grep -rE "__[Nn]ames?__" features/__name__ src/locales src/router` darf nichts finden
   (im Pfad `features/__name__` den echten Namen einsetzen, das Suchmuster bleibt unverändert).
8. Führe `npm run lint && npm test` aus und behebe Fehler. Falls Items existieren, prüft
   `__name__Items.test.js`, dass jeder `labelKey` in `de.json` und `en.json` existiert.

## Regeln für diesen Ablauf

- Existiert das Feature schon, nichts überschreiben.
- Pro Feature genau ein Pinia-Store (`use__Name__Store`), keine zentrale Registrierung.
- Items nur für Listen, die per `v-for` gerendert werden. Einzelne Texte direkt über `t('__name__.<key>')`.
- Items enthalten nur Ids und Label-Schlüssel, keine Texte und keine veränderlichen Werte.
- Alle sichtbaren Texte stehen in `de.json` und `en.json`, nie fest im Code.

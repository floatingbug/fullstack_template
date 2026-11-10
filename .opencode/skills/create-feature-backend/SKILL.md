---
name: create-feature-backend
description: Legt neue Backend-Features als vollständige Use-Cases an und erweitert bestehende Features um Endpunkte, Controller, Services, Models und API-Tests.
---

# Backend-Feature anlegen oder erweitern

## Verbindliche Grundlagen

1. Lies vor der Umsetzung `references/architecture.md`. Die Datei beschreibt die Schichten,
   Importrichtungen, Registrierung und Tests.
2. Beachte zusätzlich die `AGENTS.md` im Projektroot und in `backend/`.
3. Verwende die Struktur von `backend/src/features/user/` als Referenz für neue Features:
   Express-Router, Controller, Services und Models mit jeweils passenden Barrel-Dateien.
4. Der API-Vertrag in `contracts/api/` ist die einzige Wahrheit für Endpunkte, Parameter,
   Statuscodes, Security und Datenmodelle. Implementiere keinen Endpunkt, der dort nicht beschrieben
   ist. `contracts/openapi.bundled.yaml` ist generiert und wird nie von Hand geändert.
5. Verwende TypeScript im NodeNext-Modus mit den im Backend üblichen `.js`-Importen für relative
   TypeScript-Module.

## 1. Arbeitsmodus bestimmen

Ermittle das betroffene Feature unter `backend/src/features/<feature>/`:

- **Verzeichnis nicht vorhanden:** Arbeitsmodus [Neues Feature](#2-neues-feature-anlegen).
- **Verzeichnis vorhanden:** Arbeitsmodus [Bestehendes Feature erweitern](#3-bestehendes-feature-erweitern),
  auch wenn ein neuer Endpunkt oder Use-Case angefordert wird.
- Ist das betroffene Feature oder der angeforderte Umfang unklar, frage nach, bevor du Dateien änderst.

## 2. Neues Feature anlegen

### Use-Case klären

Ein allgemeiner Prompt wie **„Lege das Feature Todo an“** enthält noch keinen ausreichend
bestimmten Use-Case. Ändere in diesem Fall weder Vertrag noch Backend, sondern frage beispielsweise:

> Welcher erste Use-Case soll für Todo umgesetzt werden – beispielsweise Todos auflisten, ein einzelnes
> Todo abrufen oder ein neues Todo erstellen?

Erzeuge nicht automatisch vollständiges CRUD. Ist ein konkreter Use-Case angegeben, implementiere
ihn als **vollständigen, lauffähigen vertikalen Ausschnitt** einschließlich Vertrag, Registrierung,
benötigter Schichten und API-Tests.

### Umsetzung

1. Beschreibe zuerst die benötigten Operationen und Schemas in `contracts/api/`. Verwende dabei die
   vorhandene Aufteilung in `openapi.yaml`, `paths/` und `components/`.
2. Prüfe insbesondere HTTP-Methode, Pfadparameter, Request-Body, Security, Statuscodes sowie Success-
   und Error-Responses. Der Validator wird niemals deaktiviert oder umgangen.
3. Plane den Aufrufpfad gemäß `references/architecture.md` und lege nur benötigte Dateien an.
4. Verwende passende Dateien aus `templates/` als flexible Ausgangspunkte. Pfade, Middleware,
   Parameter, Persistenz und Response-Mapping müssen zum Vertrag und Use-Case passen.
5. Registriere den Feature-Router in `backend/main.ts` vor dem 404- und dem zentralen Error-Handler.
6. Ergänze mindestens einen API-Test pro neuem oder geändertem Endpunkt unter `backend/test/`.
   Orientiere dich an `backend/test/api.test.ts` und `backend/test/helpers/testServer.ts`, damit der
   echte Server, die Middleware und die Response-Validierung durchlaufen werden.
7. Führe in `backend/` `npm run type-check` und `npm run test` aus. Der Testlauf bundelt den Vertrag
   automatisch.
8. Führe nach Vertragsänderungen zusätzlich `npm run gen:api` in `frontend/` aus, damit die generierten
   Frontend-Typen aktuell bleiben. Implementiere nicht ohne Auftrag ein Frontend-Feature.

## 3. Bestehendes Feature erweitern

1. Lies zuerst Router, Controller, Services, Models, Typen und relevante Tests des bestehenden Features.
   Seine Benennung, Schichtung, Fehlerbehandlung und Testmuster sind das primäre Vorbild.
2. Ermittle vorhandene Operationen und verwende sie wieder. Ergänze ausschließlich fehlende Teile.
3. Exportiere neue Operationen über die vorhandenen `index.ts`-Dateien der jeweiligen Schicht.
   Erzeuge keine parallelen Services, Models oder Router für denselben Zweck.
4. Bei einem neuen Endpunkt gilt weiterhin zuerst der API-Vertrag. Ändere nicht den Validator, um eine
   abweichende Implementierung durchzulassen.
5. Templates haben bei einer Erweiterung nur untergeordnete Bedeutung. Nutze sie höchstens für eine
   bisher nicht vorhandene Dateiart, wenn das Feature selbst kein passendes Muster enthält.
6. Überschreibe oder refaktorisiere keine funktionierenden Feature-Teile, die für den neuen Use-Case
   nicht geändert werden müssen. Weicht das bestehende Feature unklar vom Referenzmuster ab, frage
   nach, statt die Abweichung blind zu übernehmen.
7. Erweitere die API-Tests um Success- und relevante Error-, Auth- oder Validierungsfälle.

## 4. Templates verwenden

Die Inhalte der Templates werden nicht automatisch geladen. Lies nur die für den Use-Case benötigten
Vorlagen und kopiere sie nicht ungeprüft.

Platzhalter:

| Platzhalter | Bedeutung | Beispiel |
| --- | --- | --- |
| `__name__` | Feature- oder Typname in camelCase, singular | `todo` |
| `__Name__` | Feature- oder Typname in PascalCase, singular | `Todo` |
| `__names__` | tatsächlicher Collection- oder Ressourcenname | `todos` |

Die Vorlagen bilden beispielhaft einen einzelnen Abruf per ID ab. Das ist **keine Vorgabe, immer GET
oder CRUD zu erzeugen**. Methode, Router-Pfad, Parametername, `authUser`, Statuscode, Service-Logik,
Collection und Response-Mapping sind an den konkreten Vertrag anzupassen. Für öffentliche Endpunkte
wird `authUser` nicht ungeprüft übernommen.

| Vorlage | Typisches Ziel |
| --- | --- |
| `templates/feature-index.ts.template` | `index.ts` |
| `templates/controller.ts.template` | `controller/get<Name>.ts` |
| `templates/controller-index.ts.template` | `controller/index.ts` |
| `templates/service.ts.template` | `services/get<Name>ById.ts` |
| `templates/service-index.ts.template` | `services/index.ts` |
| `templates/model.ts.template` | `models/findById.ts` |
| `templates/model-index.ts.template` | `models/index.ts` |

Entferne nicht benötigte Vorlagenbestandteile und ersetze alle Platzhalter und erklärenden
Template-Kommentare durch die konkrete Implementierung. Models werden nur für tatsächlich benötigte
Persistenz oder Datenzugriffe erzeugt.

## 5. Abschlussprüfung

- Keine Template-Platzhalter oder unfertigen Template-Kommentare im erzeugten Code.
- Keine Endpunkte ohne API-Vertrag und keine Validator-Umgehung.
- Keine HTTP-Verantwortung in Services oder Models und kein direkter DB-Zugriff im Controller.
- Router registriert, Barrel-Dateien aktualisiert und Middleware-Reihenfolge geprüft.
- Jeder neue oder geänderte Endpunkt wurde mindestens einmal durch einen API-Test durchlaufen.
- Nach Vertragsänderungen sind `contracts/openapi.bundled.yaml` und
  `frontend/src/shared/api/schema.d.ts` neu generiert.
- In `backend/` laufen `npm run type-check` und `npm run test` erfolgreich.

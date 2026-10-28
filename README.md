# Klangtherapie Crew V0.17

## Festival Control Center

- Live-Einsatzübersicht
- laufende und kommende Schichten
- Crew-Besetzung pro Schicht
- Check-in-Feed
- Teamstatus
- Incident-/Problemmanagement
- Prioritäten Normal, Hoch und Kritisch
- Workflow Offen → In Arbeit → Gelöst
- Realtime-Refresh bei Incidents, Check-ins und Schichtbesetzungen
- kritische Meldungen erzeugen Notifications für Teamleitung/Admin/Super Admin

## Migration

`_migrations/` ist der Hauptordner für Migrationsunterlagen:

- `_migrations/COPILOT-INTEGRATION/` enthält die Integrationsnotizen.
- `_migrations/SUPABASE/01-16__v17__SQL/` enthält die einzelnen SQL-Migrationen `001` bis `016`.
- `_migrations/SUPABASE/v17.sql` fasst `001` bis `016` für eine neue Datenbank zusammen. Sie darf nicht zusätzlich zu den Einzelmigrationen ausgeführt werden.
- `_migrations/SUPABASE/017_kt_v017_demo_data.sql` ist eine optionale Datenmigration für sieben Aufgaben und fünf Chat-Vorschauen aus `_migrations/demo.ts`.

Vor der Demo-Datenmigration `kt.demo_actor_username` auf ein vorhandenes App-Profil setzen und das angenommene Jahr 2026 prüfen. Die Profile `max`, `lena`, `sarah`, `lisa` und `kim` müssen bereits über Supabase Auth existieren; andernfalls bricht die Transaktion ohne Datenänderung ab.

Der [Migrationsplan](./_migrations/MIGRATIONSPLAN-V0.17.md) nennt noch zu behebende Schema- und RLS-Probleme. Die SQL-Dateien sind bislang nicht gegen die Ziel-Datenbank getestet. Laufzeitcode für Supabase Edge Functions liegt weiterhin unter `supabase/functions/`.

## Rollen

Das Control Center ist für die operative Leitung gedacht. Die Incident-RLS erlaubt Lesen nach Teamzugehörigkeit bzw. Leitungsrolle und Änderungen durch Melder, Verantwortliche oder Leitung.

## Übergabe und Dokumentation

Die aktuelle Projektübergabe liegt unter [_doku/](./_doku/): [Projektstand](./_doku/Projekt_Doku.md), [Aufgaben](./_doku/ToDos.md), [Sidebar-Navigation](./_doku/Sidebar-Navigation.md), [technischer Aufbau](./_doku/Technischer_Aufbau.md) und [komprimierte Chat-Zusammenfassung](./_doku/Chat_Zusammenfassung.md). Die Aktualisierungsregel steht in [AGENTS.md](./AGENTS.md).

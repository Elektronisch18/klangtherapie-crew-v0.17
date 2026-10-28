# Repository-Regeln

## Ziel der Übergabe

Ein anderer Agent soll ohne Chat-Verlauf erkennen können, was das Projekt kann, was geändert wurde, was geprüft ist und was als Nächstes ansteht. Dokumentation ist Teil jeder Projektarbeit.

## Dokumentation unter `_doku/`

- `_doku/Projekt_Doku.md`: Zweck, aktueller Stand, Module, Entscheidungen, offene Risiken und Einstiegspunkte.
- `_doku/ToDos.md`: priorisierte, konkrete Aufgaben mit Status, Abhängigkeiten und Prüfkriterium. Erledigtes abhaken; keine erledigten Aufgaben als offen stehen lassen.
- `_doku/Sidebar-Navigation.md`: sichtbare Navigation, Route-IDs, tatsächliche Zielseiten, Rollen und bekannte Lücken.
- `_doku/Technischer_Aufbau.md`: Stack, Verzeichnisstruktur, Datenfluss, Auth, Supabase, Konfiguration und Test-/Deployment-Stand.
- `_doku/Chat_Zusammenfassung.md`: nach jeder projektbezogenen Unterhaltung eine kurze, datierte Zusammenfassung von Nutzerwunsch, Entscheidung, erledigter Arbeit, offenem Punkt und nächstem Schritt. Komprimieren statt Chats wörtlich zu kopieren; ältere Einträge bei Bedarf thematisch zusammenfassen.

Nach jeder Änderung oder neuen Erkenntnis die betroffenen Dateien aktualisieren, bevor die Arbeit als abgeschlossen gemeldet wird. Fakten aus dem Code von Plänen und Annahmen trennen. Dateipfade in Markdown relativ zum jeweiligen Dokument verlinken. Keine Passwörter, Schlüssel, Tokens, vollständigen `.env`-Inhalte oder privaten Chatdaten dokumentieren. Ungeprüfte Datenbank- oder Laufzeitannahmen ausdrücklich als ungeprüft kennzeichnen.

## Migrationen

- `_migrations/` ist der Hauptordner für Migrationsunterlagen.
- `_migrations/COPILOT-INTEGRATION/` enthält die Copilot-Integrationsnotizen.
- `_migrations/SUPABASE/` enthält SQL-Schema- und Datenmigrationen. Die historischen Einzelmigrationen `001` bis `016` liegen in `01-16__v17__SQL/`.
- Neue Migrationsdateien und zugehörige Dokumentation unter `_migrations/` ablegen und Verweise in `README.md` aktualisieren.
- `supabase/functions/` bleibt der Laufzeitordner für Supabase Edge Functions.

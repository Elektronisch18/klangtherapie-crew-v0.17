# Projekt-Dokumentation

Stand: 28. Oktober 2026. Version laut [package.json](../package.json): 0.17.0.

## Zweck

Klangtherapie Crew ist eine React-Anwendung für Crew-Verwaltung und Festivalbetrieb. Geplante Module sind Dashboard, Aufgaben, Messenger, Schichten, Kalender, Dokumente, Profile, Rollen und ein Control Center. Die historischen Integrationsnotizen liegen unter [COPILOT-INTEGRATION](../_migrations/COPILOT-INTEGRATION/).

## Aktueller Stand

- Der Auth-Code schaltet ohne konfigurierte Supabase-Umgebung in den Demo-Modus. Die Konfiguration erfolgt über Vite-Variablen; ein Laufzeittest steht aus. Siehe [Technischer_Aufbau.md](./Technischer_Aufbau.md).
- Das UI enthält vollständige Seiten und Services für alle Module: Dashboard, Aufgaben (Kanban + TaskDetailDrawer), Messenger, Schichten, Kalender, Dokumente, Profile, Admin, Rollen, Festival-Verwaltung, Control Center sowie die neue Wissensdatenbank **FAQ & Hilfe** (`FAQ.tsx` mit Akkordeon-Komponente und Volltextsuche). Alle Ansichten sind in [App.tsx](../src/App.tsx) erreichbar; Details stehen in [Sidebar-Navigation.md](./Sidebar-Navigation.md).
- Die npm-Abhängigkeiten sind installiert. Der Build `npm run build` (`tsc -b && vite build`) schließt fehlerfrei mit Exit-Code 0 ab.
- Das Schema ist als 16 historische Einzeldateien, als gebündelte [v17.sql](../_migrations/SUPABASE/v17.sql) und ergänzende [018_kt_v017_schema_alignment.sql](../_migrations/SUPABASE/018_kt_v017_schema_alignment.sql) vorhanden. Die optionale [Demo-Datenmigration](../_migrations/SUPABASE/017_kt_v017_demo_data.sql) übernimmt sieben Aufgaben und fünf Chat-Vorschauen aus [demo.ts](../_migrations/demo.ts), sofern die vorausgesetzten Auth-Profile existieren.
- Die SQL-Dateien wurden statisch verglichen, aber nicht gegen die Ziel-Datenbank ausgeführt. Der [Migrationsplan](../_migrations/MIGRATIONSPLAN-V0.17.md) beschreibt bekannte Schema-, RLS- und App-Vertragsprobleme.
- Die bereitgestellte Self-hosted-Adresse lieferte bei der letzten Prüfung ein Traefik-Standardzertifikat und HTTP 404 für `/rest/v1/`; der direkte PostgreSQL-Port bot kein TLS. Es wurden keine Zugangsdaten an den Server gesendet und keine Datenbankdaten verändert.

## Wichtige Entscheidungen

- [_migrations/](../_migrations/) ist der Hauptordner für Migrationsunterlagen. SQL liegt unter [SUPABASE/](../_migrations/SUPABASE/), Integrationsnotizen unter [COPILOT-INTEGRATION/](../_migrations/COPILOT-INTEGRATION/).
- Die Demo-Datenmigration erstellt keine Auth-Benutzer und verlangt einen vorhandenen App-Benutzer als `kt.demo_actor_username`. Die Demo-Daten nennen bei Aufgaben nur Tag und Monat; die SQL-Datei nimmt 2026 an und markiert diese Annahme.
- Für eine bestehende Datenbank ist vor jeder Migration der tatsächliche Schema- und Datenstand zu prüfen. Die gebündelte Datei ist kein Upgrade-Skript.

## Nächster Einstieg

1. [ToDos.md](./ToDos.md) für priorisierte Arbeit lesen.
2. [Migrationsplan](../_migrations/MIGRATIONSPLAN-V0.17.md) und [Technischer_Aufbau.md](./Technischer_Aufbau.md) abgleichen.
3. Vor DB-Arbeit eine gültige, verschlüsselte Verbindung und den Istzustand nachweisen.

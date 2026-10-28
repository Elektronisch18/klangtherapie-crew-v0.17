# Copilot Integration V0.17
## Modul
- `src/pages/ControlCenter.tsx`
- `src/services/controlCenter.ts`
- `_migrations/SUPABASE/01-16__v17__SQL/016_kt_v017_control_center.sql`

## TODO
- [ ] Migration 016 testen
- [ ] Control-Center-Navigation für Teamleitung/Admin beschränken
- [ ] Realtime mit zwei Clients testen
- [ ] Incident Team/Location/Assignee im Dialog auswählbar machen
- [ ] Eskalations- und Lösungsnotizen ergänzen
- [ ] Check-in-Zahlen gegen echte Schichtdaten validieren
- [ ] spätere Push-Benachrichtigungen für kritische Incidents vorbereiten

## Agent
Control Center ist eine aggregierte Live-Ansicht. Bestehende Schicht-, Check-in-, Team- und Notification-Tabellen weiterverwenden. Keine parallelen Kopien dieser Daten anlegen.

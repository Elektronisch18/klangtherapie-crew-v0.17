# Copilot Integration V0.15
## Modul
- `src/pages/Calendar.tsx`
- `src/services/calendar.ts`
- `_migrations/SUPABASE/01-16__v17__SQL/014_kt_v015_calendar.sql`

## TODO
- [ ] Migration 014 testen
- [ ] Crew-/Team-/Private-RLS testen
- [ ] Schichten, Timetable und Task-Fälligkeiten gegen echte Daten prüfen
- [ ] Event-Bearbeiten/Löschen UI ergänzen
- [ ] Erinnerungen/Notifications ergänzen
- [ ] optional später iCal/CalDAV/Google-Kalender-Sync planen

## Agent
Der Kalender aggregiert bestehende Module; keine Daten duplizieren, wenn Schicht, Timetable oder Aufgabe bereits ihre eigene Tabelle besitzt. Host-App-Design hat Vorrang.

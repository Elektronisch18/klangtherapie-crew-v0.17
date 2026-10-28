# Klangtherapie Crew App V0.7

## Neu: Festival Hub
- Schichtplan mit Selbst-Ein-/Austragen
- Helfer-Verfügbarkeiten als Datenmodell
- Artists
- Timetable
- Gelände / Locations
- wichtige Crew-Kontakte
- Notfallinformationen
- Demo-Daten ohne Supabase
- RLS-Grundlage für Crew, Teamleitung und Admin

## Migrationen
1. `001_kt_core.sql`
2. `002_kt_v03.sql`
3. `003_kt_v04.sql`
4. `004_kt_v05.sql`
5. `005_kt_v06.sql`
6. `006_kt_v07_festival.sql`

## Start
```bash
cp .env.example .env.local
npm install
npm run dev
```

## V0.8 sinnvoll
- Festival-Admineditor für Schichten, Artists und Timetable
- visuelle Tages-/Stage-Timeline
- Verfügbarkeitskalender
- QR-/Crew-Check-in
- Push-Benachrichtigungen für Schichtbeginn und Änderungen

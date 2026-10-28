# Klangtherapie Crew App V0.3

Interne React/PWA-Basis für Klangtherapie mit selbst gehostetem Supabase.

## V0.3 ergänzt
- Supabase Services für Profile, Teams, Rollen und Benutzerzuordnung
- Realtime-Grundlage für Gruppen-/Privatchat
- Aufgaben aus `KT_tasks`
- Storage-Bucket `kt-crew-files`
- zusätzliche RLS-Policies und Indizes
- Username-Login nicht mehr über eine öffentlich erreichbare Email-Auflösung
- Vorbereitung für serverseitigen Username+Passwort-Login

## Installation
```bash
cp .env.example .env.local
npm install
npm run dev
```

Dann in `.env.local` eintragen:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Niemals den `service_role` Key ins Frontend eintragen.

## SQL Reihenfolge
Im SQL Editor der selbst gehosteten Supabase-Instanz ausführen:

1. `supabase/migrations/001_kt_core.sql`
2. `supabase/migrations/002_kt_v03.sql`

## Benutzername + Passwort
E-Mail + Passwort funktioniert direkt über Supabase Auth.

Für Benutzername + Passwort muss `VITE_USERNAME_LOGIN_URL` auf einen eigenen serverseitigen Endpoint zeigen. Dieser Endpoint darf den Service-Role-Key ausschließlich serverseitig verwenden, sucht die Auth-E-Mail zum Username und meldet den Benutzer anschließend über Supabase Auth an. So wird die E-Mail-Auflösung nicht als öffentliche Datenbank-RPC exponiert.

## Nächste sinnvolle Schritte
- Chat-Screens direkt mit `services/chat.ts` verbinden
- Admin UI mit `services/admin.ts` verbinden
- Kanban Drag & Drop + `services/tasks.ts`
- Upload-Komponente für `kt-crew-files`
- serverseitige Einladung / Benutzeranlage
- Push/PWA Notifications

# Klangtherapie Crew App — V0.2

React/TypeScript/Vite UI + Vorbereitung für selbst gehostetes Supabase.

## Neu in V0.2
- Supabase JS Client
- `.env.example`
- Auth Context + Session Handling
- Login mit E-Mail + Passwort
- Vorbereitung für Benutzername + Passwort
- geschützter App-Bereich bei konfiguriertem Supabase
- SQL Migration für `KT_` Tabellen
- Profile, Systemrollen + freie Rollen, Rechte und Teams
- Gespräche / Gruppen / Nachrichten
- globales Aufgabenboard
- RLS-Grundregeln
- Demo-Modus solange Supabase noch nicht konfiguriert ist

## Start
```bash
cp .env.example .env.local
# URL + ANON KEY eintragen
npm install
npm run dev
```

## Supabase
SQL aus `supabase/migrations/001_kt_core.sql` in deiner selbst gehosteten Instanz ausführen.

### WICHTIG: Benutzername + Passwort
Supabase Auth meldet Benutzer nativ über E-Mail/Telefon an. Die Migration enthält bewusst **keinen öffentlich zugänglichen RPC**, der Benutzernamen in E-Mail-Adressen auflöst. Für den produktiven Username-Login sollte V0.3 eine rate-limitierte Server-/Edge-Function bekommen. E-Mail + Passwort funktioniert direkt.

### Admin-Anlage / Einladungen
Benutzer-Erstellung mit Service-Role-Key gehört ausschließlich auf die Server-/Edge-Function-Seite. Den Service-Role-Key niemals in `VITE_*` Variablen oder den Browser legen.

## Nächste Stufe V0.3
- Admin Edge Function: Benutzer erstellen / Einladungen
- sicherer Username Login Resolver
- echte Admin CRUD Screens
- Realtime Chat + Presence
- Storage Buckets + RLS für Anhänge
- Tasks aus Supabase statt Demo-Daten

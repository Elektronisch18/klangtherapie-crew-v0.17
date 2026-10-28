# Klangtherapie Crew App V0.4

## Neu
- geöffneter Messenger-Screen
- Supabase Realtime-Nachrichten
- UI für neue Gruppe / private Nachricht
- globales Kanban mit Drag & Drop
- Supabase Services für Chat, Aufgaben, Teams und Rollen
- sichere SQL-RPCs zum Erstellen von Gruppen- und Direktchats
- weiterhin Demo-Modus, solange keine Supabase-ENV gesetzt ist

## Start
```bash
cp .env.example .env.local
npm install
npm run dev
```

## Migrationen
In Reihenfolge ausführen:
1. `001_kt_core.sql`
2. `002_kt_v03.sql`
3. `003_kt_v04.sql`

## Wichtig
Den Supabase `service_role` Key niemals in `VITE_*` Variablen oder in den Browser-Code eintragen.

Die Admin-Funktion „Benutzer anlegen/einladen“ benötigt als nächsten Schritt einen serverseitigen Endpoint / Edge Function, weil nur dort der Service-Role-Key sicher verwendet werden darf.

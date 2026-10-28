# Klangtherapie Crew App V0.5

## Neu in V0.5
- Admin-Benutzerverwaltung mit Status, Teams und Rollen
- Einladungsdialog und sichere DB-Funktion zum Anlegen einer Einladung
- Aufgaben über die UI erstellen
- Kanban Drag & Drop bleibt mit Supabase synchronisierbar
- Datei-/Bildauswahl im Chat
- privater Storage Bucket `kt-crew-files`
- Rollen-/Team-Zuweisung über die Admin-Oberfläche

## Wichtig zur Benutzeranlage
Das Frontend legt **keine Supabase-Auth-Benutzer mit Service Role an**. `KT_create_invitation` erstellt nur den sicheren Einladungsdatensatz.

Das tatsächliche Versenden einer Supabase-Auth-Einladung (`auth.admin.inviteUserByEmail`) gehört in einen serverseitigen Endpoint bzw. eine Edge Function. Dort darf der Service-Role-Key liegen, niemals in React oder einer `VITE_*` Variable.

## Start
```bash
cp .env.example .env.local
npm install
npm run dev
```

## SQL-Migrationen
In dieser Reihenfolge:
1. `001_kt_core.sql`
2. `002_kt_v03.sql`
3. `003_kt_v04.sql`
4. `004_kt_v05.sql`

## Empfohlene V0.6
- serverseitige Invite Edge Function
- Gruppen-Dialog mit echter Mitgliederauswahl
- Chat-Anhänge als strukturierte Datensätze statt Textpfad
- Task-Detailansicht mit Kommentaren, Unteraufgaben und Verantwortlichen
- Festival-Schichten / Helferplanung

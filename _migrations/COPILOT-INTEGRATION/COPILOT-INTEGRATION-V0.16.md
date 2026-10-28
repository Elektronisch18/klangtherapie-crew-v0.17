# Copilot Integration V0.16
## Modul
- `src/pages/Messenger.tsx`
- `src/services/messenger.ts`
- `_migrations/SUPABASE/01-16__v17__SQL/015_kt_v016_messenger.sql`

## TODO
- [ ] Migration 015 testen
- [ ] Gruppen und DMs gegen echte Supabase-Daten testen
- [ ] Realtime bei zwei parallelen Sessions prüfen
- [ ] Unread-Zähler aus `last_read_at` serverseitig berechnen
- [ ] Suchdialog an `searchMessages()` anbinden
- [ ] Datei-Upload im Composer mit bestehendem Storage-Service verbinden
- [ ] Reply-Vorschau des Originaltexts serverseitig/join-basiert ergänzen
- [ ] Mention-Autocomplete für @username ergänzen

## Agent
Bestehende KT_conversations/KT_messages weiterverwenden. Keine zweite Chat-Datenstruktur anlegen. RLS und Conversation-Mitgliedschaft müssen die Zugriffskontrolle bleiben.

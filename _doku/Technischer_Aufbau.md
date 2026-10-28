# Technischer Aufbau

Stand: 28. Oktober 2026.

## Stack und Startpunkte

- Frontend: React 19, TypeScript 5.8, Vite 7 und Supabase JS 2; Skripte stehen in [package.json](../package.json).
- Einstieg: [main.tsx](../src/main.tsx) rendert [App.tsx](../src/App.tsx); [AuthContext.tsx](../src/contexts/AuthContext.tsx) verwaltet Session und Demo-Modus. [App.tsx](../src/App.tsx) routet alle 18 Ansichten; [Layout.tsx](../src/components/Layout.tsx) stellt Sidebar, Header, Profil-Aktionen und mobile Bottom-Navigation bereit.
- UI: [pages/](../src/pages/), [components/](../src/components/) und [styles.css](../src/styles.css). Datenbankzugriffe liegen in [services/](../src/services/).
- Supabase-Client: [supabase.ts](../src/lib/supabase.ts) nutzt `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`; ohne echte Werte startet die App im Demo-Modus. Die Vorlage ist [.env.example](../.env.example). Keine Service-Role-Schlüssel in `VITE_*`-Variablen setzen.

## Backend und Datenfluss

- Schema: historische SQL-Migrationen [001–016](../_migrations/SUPABASE/01-16__v17__SQL/), gebündelte [v17.sql](../_migrations/SUPABASE/v17.sql), optionale [Demo-Datenmigration](../_migrations/SUPABASE/017_kt_v017_demo_data.sql), sowie [018_kt_v017_schema_alignment.sql](../_migrations/SUPABASE/018_kt_v017_schema_alignment.sql) für Foreign-Key-Alignment (`public.KT_profiles`) und `KT_conversations.updated_at`. `KT_`-Tabellen in `public`, Auth-Benutzer in `auth.users`, privater Storage-Bucket `kt-crew-files`.
- Typisierung: [database.ts](../src/types/database.ts) und [index.ts](../src/types/index.ts) definieren strikte Typen für alle 21 Tabellen, RPCs und Enums; [supabase.ts](../src/lib/supabase.ts) instanziiert `createClient<Database>`.
- Auth: E-Mail/Passwort über Supabase. Benutzername/Passwort erfordert einen gesonderten Server-Endpunkt (`VITE_USERNAME_LOGIN_URL`); dessen Implementierung ist nicht im Repository. Profilanlage ist als Datenbanktrigger vorgesehen.
- Einladungen: [kt-invite-user](../supabase/functions/kt-invite-user/index.ts) nutzt serverseitig Supabase Admin Auth und trägt eine Einladung in `KT_invitations` ein. Deployment und Fehlerpfad sind ungeprüft.
- Realtime: Services abonnieren Nachrichten, Notifications und Control-Center-Daten. Publication-Einträge sind teilweise in den SQL-Dateien enthalten; eine Live-Prüfung fehlt.

## Vertragsabgleich und DB-Felder (behoben)

- [messenger.ts](../src/services/messenger.ts) fragt nun `KT_conversations.title`/`created_at` und den Composite Key von `KT_message_reactions` (`message_id, emoji, user_id`) ab; [Messenger.tsx](../src/pages/Messenger.tsx) unterstützt `title` und `name`.
- [controlCenter.ts](../src/services/controlCenter.ts) fragt bei Check-ins `checked_in_at` ab und mappt es für die UI; Schichten nutzen `needed` statt `capacity`.
- [taskDetail.ts](../src/services/taskDetail.ts) schreibt bei Kommentaren korrekt `author_id`.
- [tasks.ts](../src/services/tasks.ts) mappt Prioritäten robust auf die im CHECK-Constraint definierten Werte (`low`, `normal`, `medium`, `high`); [Tasks.tsx](../src/pages/Tasks.tsx) sendet standardisierte Enums.
- [018_kt_v017_schema_alignment.sql](../_migrations/SUPABASE/018_kt_v017_schema_alignment.sql) stellt Fremdschlüssel von `KT_checkins`, `KT_shift_assignments`, `KT_documents`, `KT_task_activity`, `KT_availability`, `KT_calendar_events` und `KT_incidents` auf `public."KT_profiles"(id)` bereit, sodass PostgREST-Embeds wie `KT_profiles(...)` fehlerfrei aufgelöst werden.
- SQL-RLS- und Trigger-Probleme sind weiterhin im [Migrationsplan](../_migrations/MIGRATIONSPLAN-V0.17.md) priorisiert.

## Test- und Deployment-Stand

Die SQL-Dateien wurden nur statisch geprüft. Node.js 24.22.1 und npm 11.19.1 sind auf dem Rechner installiert. `npm install --no-audit --no-fund` hat 82 Pakete installiert und [package-lock.json](../package-lock.json) erzeugt; `npm ls --depth=0` ist erfolgreich. Die Syntax- und Typfehler in [Chats.tsx](../src/pages/Chats.tsx), [Tasks.tsx](../src/pages/Tasks.tsx), [Calendar.tsx](../src/pages/Calendar.tsx) sowie die Vite-Client-Typdefinition in [vite-env.d.ts](../src/vite-env.d.ts) wurden behoben; `npm run build` (`tsc -b && vite build`) schließt mit Exit-Code 0 ab. Der Vite-Dev-Server startet sauber über `npm run dev`. Eine Supabase-CLI-Konfiguration und DB-Integrationstests fehlen weiterhin. Die zuletzt geprüfte Self-hosted-Adresse bot keinen verifizierten HTTPS-API-Zugang und kein PostgreSQL-TLS; die Ziel-DB wurde nicht verändert. Für die nächsten Prüfschritte siehe [ToDos.md](./ToDos.md).

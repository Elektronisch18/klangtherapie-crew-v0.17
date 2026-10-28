# Copilot Integration V0.14

## Dateien
- `src/components/TaskDetailDrawer.tsx`
- `src/services/taskDetail.ts`
- `_migrations/SUPABASE/01-16__v17__SQL/013_kt_v014_task_workspace.sql`

## TODO
- [ ] Migrationen 001–013 in Test-Supabase anwenden
- [ ] Task-Detail mit Crew/Teamleitung/Admin testen
- [ ] Kommentare und Unteraufgaben testen
- [ ] Dokument-RLS innerhalb Task-Detail testen
- [ ] Aktivitätstrigger bei Status/Priorität/Fälligkeit prüfen
- [ ] mobilen Detail-Button an Kanban-Karten ergänzen
- [ ] Dateiupload direkt im Task-Drawer ergänzen

## Agent
Das Task-Modul soll eigenständig bleiben. Host-App-Design hat Vorrang. Keine RLS-Umgehung im Client. Dokumentzugriffe müssen weiterhin über die vorhandene Dokument-RLS und private Signed URLs laufen.

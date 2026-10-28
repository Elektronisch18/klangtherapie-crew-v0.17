-- ===== 018_kt_v017_schema_alignment.sql =====
-- Klangtherapie Crew V0.17
-- Schema-Harmonisierung & PostgREST Foreign Key Alignment:
-- 1. Verknüpft Tabellen mit Benutzerbezug direkt mit public."KT_profiles"(id) statt nur auth.users(id).
--    Dies ermöglicht PostgREST saubere eingebettete Joins (z.B. KT_checkins(..., KT_profiles(...))).
-- 2. Ergänzt KT_conversations.updated_at und Aktualisierungs-Trigger bei neuen Nachrichten.
-- 3. Stellt Indizes für Performance sicher.

begin;

-- 1. Foreign Keys auf public."KT_profiles"(id)
do $$
begin
  -- KT_shift_assignments.user_id
  if not exists (select 1 from pg_constraint where conname = 'KT_shift_assignments_user_id_profile_fkey') then
    alter table public."KT_shift_assignments"
      add constraint "KT_shift_assignments_user_id_profile_fkey"
      foreign key (user_id) references public."KT_profiles"(id) on delete cascade;
  end if;

  -- KT_checkins.user_id
  if not exists (select 1 from pg_constraint where conname = 'KT_checkins_user_id_profile_fkey') then
    alter table public."KT_checkins"
      add constraint "KT_checkins_user_id_profile_fkey"
      foreign key (user_id) references public."KT_profiles"(id) on delete cascade;
  end if;

  -- KT_documents.uploaded_by
  if not exists (select 1 from pg_constraint where conname = 'KT_documents_uploaded_by_profile_fkey') then
    alter table public."KT_documents"
      add constraint "KT_documents_uploaded_by_profile_fkey"
      foreign key (uploaded_by) references public."KT_profiles"(id) on delete restrict;
  end if;

  -- KT_task_activity.user_id
  if not exists (select 1 from pg_constraint where conname = 'KT_task_activity_user_id_profile_fkey') then
    alter table public."KT_task_activity"
      add constraint "KT_task_activity_user_id_profile_fkey"
      foreign key (user_id) references public."KT_profiles"(id) on delete set null;
  end if;

  -- KT_availability.user_id
  if not exists (select 1 from pg_constraint where conname = 'KT_availability_user_id_profile_fkey') then
    alter table public."KT_availability"
      add constraint "KT_availability_user_id_profile_fkey"
      foreign key (user_id) references public."KT_profiles"(id) on delete cascade;
  end if;

  -- KT_calendar_events.created_by
  if not exists (select 1 from pg_constraint where conname = 'KT_calendar_events_created_by_profile_fkey') then
    alter table public."KT_calendar_events"
      add constraint "KT_calendar_events_created_by_profile_fkey"
      foreign key (created_by) references public."KT_profiles"(id) on delete restrict;
  end if;

  -- KT_shifts.created_by
  if not exists (select 1 from pg_constraint where conname = 'KT_shifts_created_by_profile_fkey') then
    alter table public."KT_shifts"
      add constraint "KT_shifts_created_by_profile_fkey"
      foreign key (created_by) references public."KT_profiles"(id) on delete set null;
  end if;

  -- KT_incidents.reported_by
  if not exists (select 1 from pg_constraint where conname = 'KT_incidents_reported_by_profile_fkey') then
    alter table public."KT_incidents"
      add constraint "KT_incidents_reported_by_profile_fkey"
      foreign key (reported_by) references public."KT_profiles"(id) on delete restrict;
  end if;

  -- KT_incidents.assigned_to
  if not exists (select 1 from pg_constraint where conname = 'KT_incidents_assigned_to_profile_fkey') then
    alter table public."KT_incidents"
      add constraint "KT_incidents_assigned_to_profile_fkey"
      foreign key (assigned_to) references public."KT_profiles"(id) on delete set null;
  end if;
end $$;

-- 2. Ergänzung von updated_at in KT_conversations
alter table public."KT_conversations"
  add column if not exists updated_at timestamptz default now();

update public."KT_conversations" set updated_at = created_at where updated_at is null;

-- Trigger für Aktualisierung von KT_conversations.updated_at bei neuen Nachrichten
create or replace function public."KT_touch_conversation_timestamp"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  update public."KT_conversations"
  set updated_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists "KT_on_message_touch_conversation" on public."KT_messages";
create trigger "KT_on_message_touch_conversation"
  after insert on public."KT_messages"
  for each row execute procedure public."KT_touch_conversation_timestamp"();

-- 3. Leistungsindizes
create index if not exists "KT_checkins_user_id_idx" on public."KT_checkins"(user_id, checked_in_at desc);
create index if not exists "KT_shift_assignments_user_idx" on public."KT_shift_assignments"(user_id, status);
create index if not exists "KT_incidents_status_priority_idx" on public."KT_incidents"(status, priority);

commit;

-- Klangtherapie V0.15 – Calendar
create table if not exists public."KT_calendar_events"(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 description text,
 starts_at timestamptz not null,
 ends_at timestamptz not null,
 location_id uuid references public."KT_locations"(id) on delete set null,
 location_text text,
 team_id uuid references public."KT_teams"(id) on delete cascade,
 visibility text not null default 'crew' check(visibility in('crew','team','private')),
 created_by uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 check(ends_at>starts_at)
);
alter table public."KT_calendar_events" enable row level security;
drop policy if exists "KT calendar read" on public."KT_calendar_events";
create policy "KT calendar read" on public."KT_calendar_events" for select to authenticated using(
 visibility='crew'
 or created_by=(select auth.uid())
 or (visibility='team' and team_id is not null and exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_calendar_events".team_id and tm.user_id=(select auth.uid())))
 or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')
);
drop policy if exists "KT calendar insert" on public."KT_calendar_events";
create policy "KT calendar insert" on public."KT_calendar_events" for insert to authenticated with check(
 created_by=(select auth.uid())
 and (visibility<>'team' or (team_id is not null and exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_calendar_events".team_id and tm.user_id=(select auth.uid()))))
);
drop policy if exists "KT calendar update" on public."KT_calendar_events";
create policy "KT calendar update" on public."KT_calendar_events" for update to authenticated
using(created_by=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(created_by=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
drop policy if exists "KT calendar delete" on public."KT_calendar_events";
create policy "KT calendar delete" on public."KT_calendar_events" for delete to authenticated
using(created_by=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create index if not exists "KT_calendar_events_time_idx" on public."KT_calendar_events"(starts_at,ends_at);
create index if not exists "KT_calendar_events_team_idx" on public."KT_calendar_events"(team_id);
do $$ begin alter publication supabase_realtime add table public."KT_calendar_events"; exception when duplicate_object then null; end $$;

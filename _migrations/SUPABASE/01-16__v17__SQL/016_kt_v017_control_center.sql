-- Klangtherapie V0.17 – Festival Control Center
create table if not exists public."KT_incidents"(
 id uuid primary key default gen_random_uuid(),
 title text not null,
 description text,
 priority text not null default 'normal' check(priority in('normal','high','critical')),
 status text not null default 'open' check(status in('open','in_progress','resolved')),
 team_id uuid references public."KT_teams"(id) on delete set null,
 location_id uuid references public."KT_locations"(id) on delete set null,
 reported_by uuid not null references auth.users(id) on delete restrict,
 assigned_to uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(),
 resolved_at timestamptz
);
alter table public."KT_incidents" enable row level security;

drop policy if exists "KT incidents read" on public."KT_incidents";
create policy "KT incidents read" on public."KT_incidents" for select to authenticated
using(
 team_id is null
 or exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_incidents".team_id and tm.user_id=(select auth.uid()))
 or public."KT_has_role"('Teamleitung') or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')
);
drop policy if exists "KT incidents create" on public."KT_incidents";
create policy "KT incidents create" on public."KT_incidents" for insert to authenticated
with check(reported_by=(select auth.uid()));
drop policy if exists "KT incidents update leads" on public."KT_incidents";
create policy "KT incidents update leads" on public."KT_incidents" for update to authenticated
using(
 reported_by=(select auth.uid()) or assigned_to=(select auth.uid())
 or public."KT_has_role"('Teamleitung') or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')
)
with check(
 reported_by=(select auth.uid()) or assigned_to=(select auth.uid())
 or public."KT_has_role"('Teamleitung') or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')
);
create index if not exists "KT_incidents_status_priority_idx" on public."KT_incidents"(status,priority,created_at desc);
create index if not exists "KT_incidents_team_idx" on public."KT_incidents"(team_id);

do $$ begin alter publication supabase_realtime add table public."KT_incidents"; exception when duplicate_object then null; end $$;

-- Critical incidents notify admins/team leads already represented in the user-role model.
create or replace function public."KT_notify_critical_incident"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.priority='critical' then
  insert into public."KT_notifications"(user_id,title,body)
  select distinct ur.user_id,'Kritischer Einsatzfall',new.title
  from public."KT_user_roles" ur join public."KT_roles" r on r.id=ur.role_id
  where r.name in('Super Admin','Admin','Teamleitung') and ur.user_id<>new.reported_by;
 end if;
 return new;
end $$;
revoke all on function public."KT_notify_critical_incident"() from public;
drop trigger if exists "KT_critical_incident_notify" on public."KT_incidents";
create trigger "KT_critical_incident_notify" after insert on public."KT_incidents"
for each row execute function public."KT_notify_critical_incident"();

-- Klangtherapie Crew V0.17: vollständiges Schema für eine neue Supabase-Datenbank.
-- Enthält die Migrationen 001 bis 016 in Reihenfolge. Nicht zusätzlich zu diesen Dateien ausführen.
-- Voraussetzungen: Supabase Auth, Storage und Realtime sowie die üblichen Datenbankrollen.

begin;

-- ===== 001_kt_core.sql =====
-- Klangtherapie Crew V0.2 / self-hosted Supabase
create extension if not exists pgcrypto;

create table if not exists public."KT_profiles" (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_.-]{3,32}$'),
  display_name text not null default '', avatar_url text, phone text,
  active boolean not null default true, last_seen timestamptz, created_at timestamptz not null default now()
);
create table if not exists public."KT_roles" (id uuid primary key default gen_random_uuid(), name text unique not null, system_role boolean not null default false, rank int not null default 0, created_at timestamptz default now());
create table if not exists public."KT_permissions" (id uuid primary key default gen_random_uuid(), key text unique not null, description text);
create table if not exists public."KT_user_roles" (user_id uuid references public."KT_profiles"(id) on delete cascade, role_id uuid references public."KT_roles"(id) on delete cascade, primary key(user_id,role_id));
create table if not exists public."KT_role_permissions" (role_id uuid references public."KT_roles"(id) on delete cascade, permission_id uuid references public."KT_permissions"(id) on delete cascade, primary key(role_id,permission_id));
create table if not exists public."KT_teams" (id uuid primary key default gen_random_uuid(), name text unique not null, description text, created_at timestamptz default now());
create table if not exists public."KT_team_members" (team_id uuid references public."KT_teams"(id) on delete cascade, user_id uuid references public."KT_profiles"(id) on delete cascade, is_lead boolean default false, primary key(team_id,user_id));
create table if not exists public."KT_invitations" (id uuid primary key default gen_random_uuid(), email text not null, invited_by uuid references public."KT_profiles"(id), token_hash text unique not null, expires_at timestamptz not null, accepted_at timestamptz, created_at timestamptz default now());

create table if not exists public."KT_conversations" (id uuid primary key default gen_random_uuid(), type text not null check(type in ('direct','group')), title text, created_by uuid references public."KT_profiles"(id), created_at timestamptz default now());
create table if not exists public."KT_conversation_members" (conversation_id uuid references public."KT_conversations"(id) on delete cascade, user_id uuid references public."KT_profiles"(id) on delete cascade, joined_at timestamptz default now(), primary key(conversation_id,user_id));
create table if not exists public."KT_messages" (id uuid primary key default gen_random_uuid(), conversation_id uuid references public."KT_conversations"(id) on delete cascade not null, sender_id uuid references public."KT_profiles"(id) on delete set null, body text not null, reply_to uuid references public."KT_messages"(id) on delete set null, edited_at timestamptz, created_at timestamptz default now());
create table if not exists public."KT_message_reactions" (message_id uuid references public."KT_messages"(id) on delete cascade, user_id uuid references public."KT_profiles"(id) on delete cascade, emoji text not null, primary key(message_id,user_id,emoji));
create table if not exists public."KT_message_attachments" (id uuid primary key default gen_random_uuid(), message_id uuid references public."KT_messages"(id) on delete cascade, storage_path text not null, file_name text not null, mime_type text, size_bytes bigint);

create table if not exists public."KT_tasks" (id uuid primary key default gen_random_uuid(), title text not null, description text, status text not null default 'todo' check(status in ('todo','doing','done')), priority text not null default 'normal' check(priority in ('low','normal','medium','high')), due_at timestamptz, team_id uuid references public."KT_teams"(id) on delete set null, created_by uuid references public."KT_profiles"(id), created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public."KT_task_assignees" (task_id uuid references public."KT_tasks"(id) on delete cascade, user_id uuid references public."KT_profiles"(id) on delete cascade, primary key(task_id,user_id));
create table if not exists public."KT_subtasks" (id uuid primary key default gen_random_uuid(), task_id uuid references public."KT_tasks"(id) on delete cascade, title text not null, done boolean default false);
create table if not exists public."KT_task_comments" (id uuid primary key default gen_random_uuid(), task_id uuid references public."KT_tasks"(id) on delete cascade, author_id uuid references public."KT_profiles"(id), body text not null, created_at timestamptz default now());
create table if not exists public."KT_notifications" (id uuid primary key default gen_random_uuid(), user_id uuid references public."KT_profiles"(id) on delete cascade, type text not null, title text not null, body text, read_at timestamptz, created_at timestamptz default now());

insert into public."KT_roles"(name,system_role,rank) values ('Super Admin',true,100),('Admin',true,80),('Teamleitung',true,50),('Crew',true,10) on conflict(name) do nothing;
insert into public."KT_permissions"(key,description) values ('users.manage','Benutzer verwalten'),('roles.manage','Rollen verwalten'),('teams.manage','Teams verwalten'),('tasks.manage','Alle Aufgaben verwalten'),('chat.moderate','Chats moderieren') on conflict(key) do nothing;

create or replace function public."KT_has_role"(role_name text) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public."KT_user_roles" ur join public."KT_roles" r on r.id=ur.role_id where ur.user_id=auth.uid() and r.name=role_name); $$;

-- Username -> email must not be exposed directly to anonymous clients in production.
-- Keep this RPC disabled unless your API gateway/function validates rate limits and access.
create or replace function public."KT_resolve_login_email"(login_name text) returns text language sql security definer set search_path=public,auth as $$ select u.email from auth.users u join public."KT_profiles" p on p.id=u.id where lower(p.username)=lower(login_name) and p.active=true limit 1; $$;
revoke all on function public."KT_resolve_login_email"(text) from public;
-- For production username login, expose equivalent logic through a rate-limited Edge Function.

alter table public."KT_profiles" enable row level security;
alter table public."KT_roles" enable row level security; alter table public."KT_permissions" enable row level security; alter table public."KT_user_roles" enable row level security; alter table public."KT_role_permissions" enable row level security;
alter table public."KT_teams" enable row level security; alter table public."KT_team_members" enable row level security; alter table public."KT_conversations" enable row level security; alter table public."KT_conversation_members" enable row level security; alter table public."KT_messages" enable row level security; alter table public."KT_tasks" enable row level security; alter table public."KT_task_assignees" enable row level security; alter table public."KT_subtasks" enable row level security; alter table public."KT_task_comments" enable row level security; alter table public."KT_notifications" enable row level security;

create policy "KT crew profiles read" on public."KT_profiles" for select to authenticated using (active=true or id=auth.uid());
create policy "KT own profile update" on public."KT_profiles" for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "KT roles read" on public."KT_roles" for select to authenticated using(true);
create policy "KT teams read" on public."KT_teams" for select to authenticated using(true);
create policy "KT team members read" on public."KT_team_members" for select to authenticated using(true);
create policy "KT tasks read" on public."KT_tasks" for select to authenticated using(true);
create policy "KT tasks create" on public."KT_tasks" for insert to authenticated with check(created_by=auth.uid());
create policy "KT tasks creator update" on public."KT_tasks" for update to authenticated using(created_by=auth.uid() or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT conversations member read" on public."KT_conversations" for select to authenticated using(exists(select 1 from public."KT_conversation_members" cm where cm.conversation_id=id and cm.user_id=auth.uid()));
create policy "KT conversation members read" on public."KT_conversation_members" for select to authenticated using(exists(select 1 from public."KT_conversation_members" me where me.conversation_id=conversation_id and me.user_id=auth.uid()));
create policy "KT messages member read" on public."KT_messages" for select to authenticated using(exists(select 1 from public."KT_conversation_members" cm where cm.conversation_id="KT_messages".conversation_id and cm.user_id=auth.uid()));
create policy "KT messages member insert" on public."KT_messages" for insert to authenticated with check(sender_id=auth.uid() and exists(select 1 from public."KT_conversation_members" cm where cm.conversation_id="KT_messages".conversation_id and cm.user_id=auth.uid()));
create policy "KT notifications own" on public."KT_notifications" for select to authenticated using(user_id=auth.uid());

create or replace function public."KT_new_user_profile"() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public."KT_profiles"(id,username,display_name) values(new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email,'@',1)||'_'||substr(new.id::text,1,6)), coalesce(new.raw_user_meta_data->>'display_name',split_part(new.email,'@',1))) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists "KT_on_auth_user_created" on auth.users;
create trigger "KT_on_auth_user_created" after insert on auth.users for each row execute procedure public."KT_new_user_profile"();

-- ===== 002_kt_v03.sql =====
-- Klangtherapie Crew V0.3
-- Tighten RLS, add missing attachment RLS, admin policies, indexes and realtime.

alter table public."KT_message_reactions" enable row level security;
alter table public."KT_message_attachments" enable row level security;
alter table public."KT_invitations" enable row level security;

create or replace function public."KT_has_permission"(permission_key text)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1
    from public."KT_user_roles" ur
    join public."KT_role_permissions" rp on rp.role_id=ur.role_id
    join public."KT_permissions" p on p.id=rp.permission_id
    where ur.user_id=auth.uid() and p.key=permission_key
  ) or public."KT_has_role"('Super Admin');
$$;

-- Do not expose username -> email mapping through RPC.
drop function if exists public."KT_resolve_login_email"(text);

create policy "KT user roles own or admin read" on public."KT_user_roles"
for select to authenticated using(user_id=auth.uid() or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT permissions auth read" on public."KT_permissions"
for select to authenticated using(true);
create policy "KT role permissions auth read" on public."KT_role_permissions"
for select to authenticated using(true);

create policy "KT admins manage user roles" on public."KT_user_roles"
for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT admins manage teams" on public."KT_teams"
for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT admins manage team members" on public."KT_team_members"
for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));

create policy "KT message reactions member read" on public."KT_message_reactions"
for select to authenticated using(exists(
 select 1 from public."KT_messages" m join public."KT_conversation_members" cm on cm.conversation_id=m.conversation_id
 where m.id=message_id and cm.user_id=auth.uid()));
create policy "KT message reactions own insert" on public."KT_message_reactions"
for insert to authenticated with check(user_id=auth.uid() and exists(
 select 1 from public."KT_messages" m join public."KT_conversation_members" cm on cm.conversation_id=m.conversation_id
 where m.id=message_id and cm.user_id=auth.uid()));

create policy "KT attachments member read" on public."KT_message_attachments"
for select to authenticated using(exists(
 select 1 from public."KT_messages" m join public."KT_conversation_members" cm on cm.conversation_id=m.conversation_id
 where m.id=message_id and cm.user_id=auth.uid()));

create policy "KT invitations admin" on public."KT_invitations"
for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));

create policy "KT task assignees read" on public."KT_task_assignees" for select to authenticated using(true);
create policy "KT subtasks read" on public."KT_subtasks" for select to authenticated using(true);
create policy "KT task comments read" on public."KT_task_comments" for select to authenticated using(true);
create policy "KT task comments create" on public."KT_task_comments" for insert to authenticated with check(author_id=auth.uid());

create index if not exists "KT_messages_conversation_created_idx" on public."KT_messages"(conversation_id,created_at);
create index if not exists "KT_tasks_status_idx" on public."KT_tasks"(status);
create index if not exists "KT_notifications_user_idx" on public."KT_notifications"(user_id,created_at desc);

-- Add tables to realtime publication where supported.
do $$ begin
  alter publication supabase_realtime add table public."KT_messages";
exception when duplicate_object then null; when undefined_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public."KT_tasks";
exception when duplicate_object then null; when undefined_object then null;
end $$;

-- Storage bucket metadata. Actual file policies are below.
insert into storage.buckets(id,name,public) values('kt-crew-files','kt-crew-files',false)
on conflict(id) do nothing;

create policy "KT storage authenticated read" on storage.objects
for select to authenticated using(bucket_id='kt-crew-files');
create policy "KT storage authenticated upload" on storage.objects
for insert to authenticated with check(bucket_id='kt-crew-files' and owner_id=auth.uid()::text);
create policy "KT storage own delete" on storage.objects
for delete to authenticated using(bucket_id='kt-crew-files' and owner_id=auth.uid()::text);

-- ===== 003_kt_v04.sql =====
-- V0.4 conversation helpers
create or replace function public."KT_create_group"(group_title text, member_ids uuid[] default '{}')
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid; uid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public."KT_conversations"(type,title,created_by) values('group',group_title,auth.uid()) returning id into cid;
  insert into public."KT_conversation_members"(conversation_id,user_id) values(cid,auth.uid()) on conflict do nothing;
  foreach uid in array member_ids loop
    insert into public."KT_conversation_members"(conversation_id,user_id) values(cid,uid) on conflict do nothing;
  end loop;
  return cid;
end $$;

create or replace function public."KT_create_direct"(other_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
  if auth.uid() is null or other_user=auth.uid() then raise exception 'invalid user'; end if;
  select c.id into cid from public."KT_conversations" c
  where c.type='direct'
    and exists(select 1 from public."KT_conversation_members" a where a.conversation_id=c.id and a.user_id=auth.uid())
    and exists(select 1 from public."KT_conversation_members" b where b.conversation_id=c.id and b.user_id=other_user)
    and (select count(*) from public."KT_conversation_members" x where x.conversation_id=c.id)=2
  limit 1;
  if cid is null then
    insert into public."KT_conversations"(type,created_by) values('direct',auth.uid()) returning id into cid;
    insert into public."KT_conversation_members"(conversation_id,user_id) values(cid,auth.uid()),(cid,other_user);
  end if;
  return cid;
end $$;

grant execute on function public."KT_create_group"(text,uuid[]) to authenticated;
grant execute on function public."KT_create_direct"(uuid) to authenticated;

-- ===== 004_kt_v05.sql =====
-- Klangtherapie V0.5
-- Invitation records, task management and profile admin policies.

alter table public."KT_invitations" add column if not exists role_id uuid references public."KT_roles"(id) on delete set null;
alter table public."KT_invitations" add column if not exists team_id uuid references public."KT_teams"(id) on delete set null;
-- The invite Edge Function records Supabase Auth invitations without a local token.
alter table public."KT_invitations" alter column token_hash drop not null;
alter table public."KT_invitations" alter column expires_at drop not null;

create or replace function public."KT_create_invitation"(invite_email text, invite_role_id uuid default null, invite_team_id uuid default null)
returns uuid language plpgsql security definer set search_path=public as $$
declare iid uuid;
begin
  if not (public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')) then raise exception 'not allowed'; end if;
  insert into public."KT_invitations"(email,role_id,team_id,invited_by)
  values(lower(trim(invite_email)),invite_role_id,invite_team_id,auth.uid()) returning id into iid;
  return iid;
end $$;
grant execute on function public."KT_create_invitation"(text,uuid,uuid) to authenticated;

create policy "KT admins update profiles" on public."KT_profiles"
for update to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));

create policy "KT task create" on public."KT_tasks" for insert to authenticated with check(created_by=auth.uid());
create policy "KT task update" on public."KT_tasks" for update to authenticated using(true) with check(true);
create policy "KT task delete admin" on public."KT_tasks" for delete to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));

-- Invitation email delivery / auth.admin.inviteUserByEmail must be implemented server-side.

-- ===== 005_kt_v06.sql =====
alter table public."KT_invitations" add column if not exists auth_user_id uuid;
alter table public."KT_invitations" add column if not exists status text not null default 'pending';
create or replace function public."KT_can_invite"() returns boolean language sql stable security definer set search_path=public as $$ select public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'); $$;
grant execute on function public."KT_can_invite"() to authenticated;
create policy "KT subtasks create" on public."KT_subtasks" for insert to authenticated with check(true);
create policy "KT subtasks update" on public."KT_subtasks" for update to authenticated using(true) with check(true);
create policy "KT task assignees manage" on public."KT_task_assignees" for all to authenticated using(true) with check(true);

-- ===== 006_kt_v07_festival.sql =====
-- Klangtherapie Crew V0.7 - Festival module
create table if not exists public."KT_locations"(
 id uuid primary key default gen_random_uuid(), name text not null, description text, map_url text, created_at timestamptz not null default now()
);
create table if not exists public."KT_artists"(
 id uuid primary key default gen_random_uuid(), name text not null, genre text, contact text, notes text, created_at timestamptz not null default now()
);
create table if not exists public."KT_timetable"(
 id uuid primary key default gen_random_uuid(), artist_id uuid references public."KT_artists"(id) on delete cascade,
 location_id uuid references public."KT_locations"(id) on delete set null, starts_at timestamptz not null, ends_at timestamptz not null, notes text
);
create table if not exists public."KT_shifts"(
 id uuid primary key default gen_random_uuid(), title text not null, location_id uuid references public."KT_locations"(id) on delete set null,
 starts_at timestamptz not null, ends_at timestamptz not null, needed integer not null default 1, description text, created_by uuid references auth.users(id), created_at timestamptz default now()
);
create table if not exists public."KT_shift_assignments"(
 shift_id uuid references public."KT_shifts"(id) on delete cascade, user_id uuid references auth.users(id) on delete cascade,
 status text not null default 'confirmed', created_at timestamptz default now(), primary key(shift_id,user_id)
);
create table if not exists public."KT_availability"(
 user_id uuid references auth.users(id) on delete cascade, date date not null, status text not null check(status in('available','maybe','unavailable')),
 note text, primary key(user_id,date)
);
create table if not exists public."KT_crew_contacts"(
 id uuid primary key default gen_random_uuid(), name text not null, role text, phone text, email text, sort_order integer default 0
);
create table if not exists public."KT_emergency_info"(
 id uuid primary key default gen_random_uuid(), title text not null, body text not null, sort_order integer default 0
);

alter table public."KT_locations" enable row level security;
alter table public."KT_artists" enable row level security;
alter table public."KT_timetable" enable row level security;
alter table public."KT_shifts" enable row level security;
alter table public."KT_shift_assignments" enable row level security;
alter table public."KT_availability" enable row level security;
alter table public."KT_crew_contacts" enable row level security;
alter table public."KT_emergency_info" enable row level security;

create policy "KT festival locations read" on public."KT_locations" for select to authenticated using(true);
create policy "KT festival artists read" on public."KT_artists" for select to authenticated using(true);
create policy "KT festival timetable read" on public."KT_timetable" for select to authenticated using(true);
create policy "KT festival shifts read" on public."KT_shifts" for select to authenticated using(true);
create policy "KT festival contacts read" on public."KT_crew_contacts" for select to authenticated using(true);
create policy "KT festival emergency read" on public."KT_emergency_info" for select to authenticated using(true);
create policy "KT shift assignments read" on public."KT_shift_assignments" for select to authenticated using(true);
create policy "KT shift self insert" on public."KT_shift_assignments" for insert to authenticated with check(user_id=auth.uid());
create policy "KT shift self delete" on public."KT_shift_assignments" for delete to authenticated using(user_id=auth.uid());
create policy "KT availability own read" on public."KT_availability" for select to authenticated using(user_id=auth.uid() or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung'));
create policy "KT availability own insert" on public."KT_availability" for insert to authenticated with check(user_id=auth.uid());
create policy "KT availability own update" on public."KT_availability" for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());

create policy "KT festival admin locations" on public."KT_locations" for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')) with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT festival admin artists" on public."KT_artists" for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')) with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT festival admin timetable" on public."KT_timetable" for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin')) with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT festival admin shifts" on public."KT_shifts" for all to authenticated using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung')) with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung'));

-- ===== 007_kt_v08_ops.sql =====
-- V0.8 Festival Operations
create table if not exists public."KT_checkins"(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 shift_id uuid references public."KT_shifts"(id) on delete set null,
 checked_in_at timestamptz not null default now()
);
alter table public."KT_checkins" enable row level security;
create policy "KT checkin own insert" on public."KT_checkins" for insert to authenticated with check(user_id=auth.uid());
create policy "KT checkin own read" on public."KT_checkins" for select to authenticated using(user_id=auth.uid() or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung'));

create policy "KT festival admin contacts" on public."KT_crew_contacts" for all to authenticated
using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));

create policy "KT festival admin emergency" on public."KT_emergency_info" for all to authenticated
using(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'))
with check(public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));

create index if not exists "KT_checkins_user_idx" on public."KT_checkins"(user_id,checked_in_at desc);
create index if not exists "KT_shifts_start_idx" on public."KT_shifts"(starts_at);
create index if not exists "KT_timetable_start_idx" on public."KT_timetable"(starts_at);

-- ===== 008_kt_v09_dashboard_security.sql =====
-- Klangtherapie V0.9 Dashboard + security hardening
alter table public."KT_notifications" add column if not exists title text;
alter table public."KT_notifications" add column if not exists body text;
alter table public."KT_notifications" add column if not exists read_at timestamptz;

drop policy if exists "KT task update" on public."KT_tasks";
create policy "KT task update scoped" on public."KT_tasks"
for update to authenticated
using (
 created_by=(select auth.uid())
 or exists(select 1 from public."KT_task_assignees" a where a.task_id=id and a.user_id=(select auth.uid()))
 or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung')
)
with check (
 created_by=(select auth.uid())
 or exists(select 1 from public."KT_task_assignees" a where a.task_id=id and a.user_id=(select auth.uid()))
 or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung')
);

drop policy if exists "KT task assignees manage" on public."KT_task_assignees";
drop policy if exists "KT task assignees read" on public."KT_task_assignees";
create policy "KT task assignees read" on public."KT_task_assignees"
for select to authenticated using(true);
create policy "KT task assignees scoped insert" on public."KT_task_assignees"
for insert to authenticated with check(
 user_id=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung')
);
create policy "KT task assignees scoped delete" on public."KT_task_assignees"
for delete to authenticated using(
 user_id=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin') or public."KT_has_role"('Teamleitung')
);

do $$ begin
 alter publication supabase_realtime add table public."KT_notifications";
exception when duplicate_object then null;
end $$;

-- ===== 009_kt_v010_festival_ops.sql =====
-- Klangtherapie V0.10 – Festival Ops
alter table public."KT_shifts" add column if not exists capacity integer;
alter table public."KT_shifts" add column if not exists waitlist_enabled boolean not null default true;
alter table public."KT_shift_assignments" add column if not exists created_at timestamptz not null default now();

create unique index if not exists "KT_shift_assignments_unique" on public."KT_shift_assignments"(shift_id,user_id);
create unique index if not exists "KT_checkins_user_shift_unique" on public."KT_checkins"(user_id,shift_id) where shift_id is not null;
create index if not exists "KT_shift_assignments_user_status_idx" on public."KT_shift_assignments"(user_id,status);

create or replace function public."KT_shift_conflicts"(p_shift_id uuid)
returns table(shift_id uuid,title text,starts_at timestamptz,ends_at timestamptz)
language sql security invoker set search_path=public as $$
 select s.id,s.title,s.starts_at,s.ends_at
 from public."KT_shifts" target
 join public."KT_shifts" s on s.id<>target.id
 join public."KT_shift_assignments" a on a.shift_id=s.id
 where target.id=p_shift_id and a.user_id=(select auth.uid()) and a.status='confirmed'
 and s.starts_at < target.ends_at and s.ends_at > target.starts_at;
$$;
revoke all on function public."KT_shift_conflicts"(uuid) from public;
grant execute on function public."KT_shift_conflicts"(uuid) to authenticated;

create or replace function public."KT_join_shift"(p_shift_id uuid)
returns text language plpgsql security invoker set search_path=public as $$
declare cap integer; occupied integer; conflicts integer;
begin
 if (select auth.uid()) is null then raise exception 'not authenticated'; end if;
 if not exists(select 1 from public."KT_shifts" where id=p_shift_id) then raise exception 'shift not found'; end if;
 select count(*) into conflicts from public."KT_shift_conflicts"(p_shift_id);
 if conflicts>0 then raise exception 'shift conflict'; end if;
 select capacity into cap from public."KT_shifts" where id=p_shift_id;
 select count(*) into occupied from public."KT_shift_assignments" where shift_id=p_shift_id and status='confirmed';
 insert into public."KT_shift_assignments"(shift_id,user_id,status)
 values(p_shift_id,(select auth.uid()),case when cap is not null and occupied>=cap then 'waitlist' else 'confirmed' end)
 on conflict(shift_id,user_id) do update set status=excluded.status;
 if cap is not null and occupied>=cap then return 'waitlist'; end if;
 return 'confirmed';
end $$;
revoke all on function public."KT_join_shift"(uuid) from public;
grant execute on function public."KT_join_shift"(uuid) to authenticated;

create or replace function public."KT_leave_shift"(p_shift_id uuid)
returns void language plpgsql security invoker set search_path=public as $$
begin
 delete from public."KT_shift_assignments" where shift_id=p_shift_id and user_id=(select auth.uid());
 with next_user as (
   select user_id from public."KT_shift_assignments"
   where shift_id=p_shift_id and status='waitlist' order by created_at limit 1
 )
 update public."KT_shift_assignments" a set status='confirmed'
 from next_user n where a.shift_id=p_shift_id and a.user_id=n.user_id;
end $$;
revoke all on function public."KT_leave_shift"(uuid) from public;
grant execute on function public."KT_leave_shift"(uuid) to authenticated;

create or replace function public."KT_check_in_shift"(p_shift_id uuid)
returns text language plpgsql security invoker set search_path=public as $$
declare start_at timestamptz; end_at timestamptz;
begin
 if not exists(select 1 from public."KT_shift_assignments" where shift_id=p_shift_id and user_id=(select auth.uid()) and status='confirmed') then raise exception 'not assigned'; end if;
 select starts_at,ends_at into start_at,end_at from public."KT_shifts" where id=p_shift_id;
 if now()<start_at-interval '60 minutes' or now()>end_at then raise exception 'check-in outside allowed window'; end if;
 insert into public."KT_checkins"(user_id,shift_id) values((select auth.uid()),p_shift_id) on conflict(user_id,shift_id) where shift_id is not null do nothing;
 return 'checked_in';
end $$;
revoke all on function public."KT_check_in_shift"(uuid) from public;
grant execute on function public."KT_check_in_shift"(uuid) to authenticated;

-- ===== 010_kt_v011_shift_notifications.sql =====
-- Klangtherapie V0.11 – shift notifications
alter table public."KT_shifts" drop constraint if exists "KT_shifts_capacity_positive";
alter table public."KT_shifts" add constraint "KT_shifts_capacity_positive" check(capacity is null or capacity > 0);

create or replace function public."KT_notify_shift_assignment"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' or old.status is distinct from new.status then
   insert into public."KT_notifications"(user_id,title,body)
   values(new.user_id,
     case when new.status='confirmed' then 'Schicht bestätigt' else 'Schicht-Warteliste' end,
     (select title from public."KT_shifts" where id=new.shift_id)
   );
 end if;
 return new;
end $$;
revoke all on function public."KT_notify_shift_assignment"() from public;

drop trigger if exists "KT_shift_assignment_notify" on public."KT_shift_assignments";
create trigger "KT_shift_assignment_notify"
after insert or update of status on public."KT_shift_assignments"
for each row execute function public."KT_notify_shift_assignment"();

create or replace function public."KT_notify_shift_change"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.starts_at is distinct from new.starts_at or old.ends_at is distinct from new.ends_at or old.location_id is distinct from new.location_id then
   insert into public."KT_notifications"(user_id,title,body)
   select a.user_id,'Schicht geändert',new.title
   from public."KT_shift_assignments" a
   where a.shift_id=new.id and a.status in('confirmed','waitlist');
 end if;
 return new;
end $$;
revoke all on function public."KT_notify_shift_change"() from public;

drop trigger if exists "KT_shift_change_notify" on public."KT_shifts";
create trigger "KT_shift_change_notify"
after update on public."KT_shifts"
for each row execute function public."KT_notify_shift_change"();

-- ===== 011_kt_v012_crew_profiles_permissions.sql =====
-- Klangtherapie V0.12 – Crew profiles and permission management
alter table public."KT_profiles" add column if not exists bio text;
alter table public."KT_profiles" add column if not exists skills text[] not null default '{}';
alter table public."KT_profiles" add column if not exists emergency_contact text;

drop policy if exists "KT role permissions read" on public."KT_role_permissions";
create policy "KT role permissions authenticated read" on public."KT_role_permissions"
for select to authenticated using(true);

drop policy if exists "KT role permissions admin insert" on public."KT_role_permissions";
create policy "KT role permissions admin insert" on public."KT_role_permissions"
for insert to authenticated with check(
 public."KT_has_role"('Super Admin') or public."KT_has_role"('Admin')
);
drop policy if exists "KT role permissions admin delete" on public."KT_role_permissions";
create policy "KT role permissions admin delete" on public."KT_role_permissions"
for delete to authenticated using(
 public."KT_has_role"('Super Admin') or public."KT_has_role"('Admin')
);

-- Emergency contact is intentionally not exposed through a separate public crew view.
-- Existing profile select policy governs visibility; tighten it before storing sensitive data
-- if the installation should hide this field from normal Crew users.

-- ===== 012_kt_v013_documents.sql =====
-- Klangtherapie V0.13 – Documents
create table if not exists public."KT_documents"(id uuid primary key default gen_random_uuid(),name text not null,storage_path text not null unique,mime_type text,size_bytes bigint not null default 0 check(size_bytes>=0),folder text not null default 'Allgemein',category text,team_id uuid references public."KT_teams"(id) on delete set null,task_id uuid references public."KT_tasks"(id) on delete set null,uploaded_by uuid not null references auth.users(id) on delete restrict,created_at timestamptz not null default now());
alter table public."KT_documents" enable row level security;
create policy "KT documents read" on public."KT_documents" for select to authenticated using(team_id is null or exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_documents".team_id and tm.user_id=(select auth.uid())) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT documents insert" on public."KT_documents" for insert to authenticated with check(uploaded_by=(select auth.uid()) and (team_id is null or exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_documents".team_id and tm.user_id=(select auth.uid()))));
create policy "KT documents delete" on public."KT_documents" for delete to authenticated using(uploaded_by=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create index if not exists "KT_documents_folder_idx" on public."KT_documents"(folder,created_at desc);
create index if not exists "KT_documents_team_idx" on public."KT_documents"(team_id);
create index if not exists "KT_documents_task_idx" on public."KT_documents"(task_id);

-- ===== 013_kt_v014_task_workspace.sql =====
-- Klangtherapie V0.14 – Task workspace/activity
create table if not exists public."KT_task_activity"(
 id uuid primary key default gen_random_uuid(),
 task_id uuid not null references public."KT_tasks"(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null,
 event_type text not null default 'update',
 message text not null,
 created_at timestamptz not null default now()
);
alter table public."KT_task_activity" enable row level security;

drop policy if exists "KT task activity read" on public."KT_task_activity";
create policy "KT task activity read" on public."KT_task_activity" for select to authenticated
using(
 exists(select 1 from public."KT_tasks" t where t.id="KT_task_activity".task_id)
);

drop policy if exists "KT task activity insert" on public."KT_task_activity";
create policy "KT task activity insert" on public."KT_task_activity" for insert to authenticated
with check(user_id=(select auth.uid()));

create index if not exists "KT_task_activity_task_idx" on public."KT_task_activity"(task_id,created_at desc);

-- Audit status/priority/deadline changes without trusting client-generated text.
create or replace function public."KT_task_activity_trigger"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.status is distinct from new.status then
  insert into public."KT_task_activity"(task_id,user_id,event_type,message)
  values(new.id,(select auth.uid()),'status','Status geändert: '||coalesce(old.status,'–')||' → '||coalesce(new.status,'–'));
 end if;
 if old.priority is distinct from new.priority then
  insert into public."KT_task_activity"(task_id,user_id,event_type,message)
  values(new.id,(select auth.uid()),'priority','Priorität geändert: '||coalesce(old.priority,'–')||' → '||coalesce(new.priority,'–'));
 end if;
 if old.due_at is distinct from new.due_at then
  insert into public."KT_task_activity"(task_id,user_id,event_type,message)
  values(new.id,(select auth.uid()),'deadline','Fälligkeit wurde geändert');
 end if;
 return new;
end $$;
revoke all on function public."KT_task_activity_trigger"() from public;

drop trigger if exists "KT_task_activity_audit" on public."KT_tasks";
create trigger "KT_task_activity_audit" after update of status,priority,due_at on public."KT_tasks"
for each row execute function public."KT_task_activity_trigger"();

-- Documents can already reference task_id from V0.13.
-- Keep document RLS authoritative; task detail only sees rows allowed by document RLS.

-- ===== 014_kt_v015_calendar.sql =====
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

-- ===== 015_kt_v016_messenger.sql =====
-- Klangtherapie V0.16 – Messenger hardening/features
alter table public."KT_messages" add column if not exists reply_to uuid references public."KT_messages"(id) on delete set null;
alter table public."KT_conversation_members" add column if not exists last_read_at timestamptz;

create unique index if not exists "KT_message_reactions_unique" on public."KT_message_reactions"(message_id,user_id,emoji);
create index if not exists "KT_messages_conversation_created_idx" on public."KT_messages"(conversation_id,created_at);
create index if not exists "KT_messages_reply_idx" on public."KT_messages"(reply_to);

-- Reactions are only allowed for members of the message conversation.
drop policy if exists "KT reactions insert member" on public."KT_message_reactions";
create policy "KT reactions insert member" on public."KT_message_reactions" for insert to authenticated
with check(
 user_id=(select auth.uid()) and exists(
  select 1 from public."KT_messages" m
  join public."KT_conversation_members" cm on cm.conversation_id=m.conversation_id
  where m.id="KT_message_reactions".message_id and cm.user_id=(select auth.uid())
 )
);
drop policy if exists "KT reactions delete own" on public."KT_message_reactions";
create policy "KT reactions delete own" on public."KT_message_reactions" for delete to authenticated
using(user_id=(select auth.uid()));

-- Members may update only their own membership row (e.g. read cursor).
drop policy if exists "KT conversation member update self" on public."KT_conversation_members";
create policy "KT conversation member update self" on public."KT_conversation_members" for update to authenticated
using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

-- Mentions are derived server-side into notifications after message insert.
create or replace function public."KT_notify_mentions"()
returns trigger language plpgsql security definer set search_path=public as $$
declare r record;
begin
 for r in
  select p.id,p.display_name,p.username
  from public."KT_profiles" p
  join public."KT_conversation_members" cm on cm.user_id=p.id and cm.conversation_id=new.conversation_id
  where p.id<>new.sender_id and p.username is not null and new.body ilike '%@'||p.username||'%'
 loop
  insert into public."KT_notifications"(user_id,title,body)
  values(r.id,'Du wurdest erwähnt',left(new.body,180));
 end loop;
 return new;
end $$;
revoke all on function public."KT_notify_mentions"() from public;
drop trigger if exists "KT_message_mentions_notify" on public."KT_messages";
create trigger "KT_message_mentions_notify" after insert on public."KT_messages"
for each row execute function public."KT_notify_mentions"();

-- ===== 016_kt_v017_control_center.sql =====
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

commit;

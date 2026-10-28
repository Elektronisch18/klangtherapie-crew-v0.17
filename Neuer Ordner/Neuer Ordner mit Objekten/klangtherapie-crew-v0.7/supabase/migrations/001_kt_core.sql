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

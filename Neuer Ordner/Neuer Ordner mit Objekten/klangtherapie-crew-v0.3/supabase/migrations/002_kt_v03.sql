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

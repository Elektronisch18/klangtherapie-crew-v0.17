alter table public."KT_invitations" add column if not exists auth_user_id uuid;
alter table public."KT_invitations" add column if not exists status text not null default 'pending';
create or replace function public."KT_can_invite"() returns boolean language sql stable security definer set search_path=public as $$ select public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'); $$;
grant execute on function public."KT_can_invite"() to authenticated;
create policy "KT subtasks create" on public."KT_subtasks" for insert to authenticated with check(true);
create policy "KT subtasks update" on public."KT_subtasks" for update to authenticated using(true) with check(true);
create policy "KT task assignees manage" on public."KT_task_assignees" for all to authenticated using(true) with check(true);

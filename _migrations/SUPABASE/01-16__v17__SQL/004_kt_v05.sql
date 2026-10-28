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

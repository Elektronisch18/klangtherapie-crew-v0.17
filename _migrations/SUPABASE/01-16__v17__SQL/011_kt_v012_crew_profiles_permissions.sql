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

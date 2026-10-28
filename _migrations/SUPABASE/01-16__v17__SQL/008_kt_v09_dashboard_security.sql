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

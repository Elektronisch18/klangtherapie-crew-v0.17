-- Klangtherapie V0.13 – Documents
create table if not exists public."KT_documents"(id uuid primary key default gen_random_uuid(),name text not null,storage_path text not null unique,mime_type text,size_bytes bigint not null default 0 check(size_bytes>=0),folder text not null default 'Allgemein',category text,team_id uuid references public."KT_teams"(id) on delete set null,task_id uuid references public."KT_tasks"(id) on delete set null,uploaded_by uuid not null references auth.users(id) on delete restrict,created_at timestamptz not null default now());
alter table public."KT_documents" enable row level security;
create policy "KT documents read" on public."KT_documents" for select to authenticated using(team_id is null or exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_documents".team_id and tm.user_id=(select auth.uid())) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create policy "KT documents insert" on public."KT_documents" for insert to authenticated with check(uploaded_by=(select auth.uid()) and (team_id is null or exists(select 1 from public."KT_team_members" tm where tm.team_id="KT_documents".team_id and tm.user_id=(select auth.uid()))));
create policy "KT documents delete" on public."KT_documents" for delete to authenticated using(uploaded_by=(select auth.uid()) or public."KT_has_role"('Admin') or public."KT_has_role"('Super Admin'));
create index if not exists "KT_documents_folder_idx" on public."KT_documents"(folder,created_at desc);
create index if not exists "KT_documents_team_idx" on public."KT_documents"(team_id);
create index if not exists "KT_documents_task_idx" on public."KT_documents"(task_id);

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

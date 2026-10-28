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

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

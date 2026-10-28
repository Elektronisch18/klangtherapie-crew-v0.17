-- Klangtherapie V0.11 – shift notifications
alter table public."KT_shifts" drop constraint if exists "KT_shifts_capacity_positive";
alter table public."KT_shifts" add constraint "KT_shifts_capacity_positive" check(capacity is null or capacity > 0);

create or replace function public."KT_notify_shift_assignment"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if tg_op='INSERT' or old.status is distinct from new.status then
   insert into public."KT_notifications"(user_id,title,body)
   values(new.user_id,
     case when new.status='confirmed' then 'Schicht bestätigt' else 'Schicht-Warteliste' end,
     (select title from public."KT_shifts" where id=new.shift_id)
   );
 end if;
 return new;
end $$;
revoke all on function public."KT_notify_shift_assignment"() from public;

drop trigger if exists "KT_shift_assignment_notify" on public."KT_shift_assignments";
create trigger "KT_shift_assignment_notify"
after insert or update of status on public."KT_shift_assignments"
for each row execute function public."KT_notify_shift_assignment"();

create or replace function public."KT_notify_shift_change"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.starts_at is distinct from new.starts_at or old.ends_at is distinct from new.ends_at or old.location_id is distinct from new.location_id then
   insert into public."KT_notifications"(user_id,title,body)
   select a.user_id,'Schicht geändert',new.title
   from public."KT_shift_assignments" a
   where a.shift_id=new.id and a.status in('confirmed','waitlist');
 end if;
 return new;
end $$;
revoke all on function public."KT_notify_shift_change"() from public;

drop trigger if exists "KT_shift_change_notify" on public."KT_shifts";
create trigger "KT_shift_change_notify"
after update on public."KT_shifts"
for each row execute function public."KT_notify_shift_change"();

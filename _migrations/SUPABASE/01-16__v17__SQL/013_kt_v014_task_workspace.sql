-- Klangtherapie V0.14 – Task workspace/activity
create table if not exists public."KT_task_activity"(
 id uuid primary key default gen_random_uuid(),
 task_id uuid not null references public."KT_tasks"(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null,
 event_type text not null default 'update',
 message text not null,
 created_at timestamptz not null default now()
);
alter table public."KT_task_activity" enable row level security;

drop policy if exists "KT task activity read" on public."KT_task_activity";
create policy "KT task activity read" on public."KT_task_activity" for select to authenticated
using(
 exists(select 1 from public."KT_tasks" t where t.id="KT_task_activity".task_id)
);

drop policy if exists "KT task activity insert" on public."KT_task_activity";
create policy "KT task activity insert" on public."KT_task_activity" for insert to authenticated
with check(user_id=(select auth.uid()));

create index if not exists "KT_task_activity_task_idx" on public."KT_task_activity"(task_id,created_at desc);

-- Audit status/priority/deadline changes without trusting client-generated text.
create or replace function public."KT_task_activity_trigger"()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 if old.status is distinct from new.status then
  insert into public."KT_task_activity"(task_id,user_id,event_type,message)
  values(new.id,(select auth.uid()),'status','Status geändert: '||coalesce(old.status,'–')||' → '||coalesce(new.status,'–'));
 end if;
 if old.priority is distinct from new.priority then
  insert into public."KT_task_activity"(task_id,user_id,event_type,message)
  values(new.id,(select auth.uid()),'priority','Priorität geändert: '||coalesce(old.priority,'–')||' → '||coalesce(new.priority,'–'));
 end if;
 if old.due_at is distinct from new.due_at then
  insert into public."KT_task_activity"(task_id,user_id,event_type,message)
  values(new.id,(select auth.uid()),'deadline','Fälligkeit wurde geändert');
 end if;
 return new;
end $$;
revoke all on function public."KT_task_activity_trigger"() from public;

drop trigger if exists "KT_task_activity_audit" on public."KT_tasks";
create trigger "KT_task_activity_audit" after update of status,priority,due_at on public."KT_tasks"
for each row execute function public."KT_task_activity_trigger"();

-- Documents can already reference task_id from V0.13.
-- Keep document RLS authoritative; task detail only sees rows allowed by document RLS.

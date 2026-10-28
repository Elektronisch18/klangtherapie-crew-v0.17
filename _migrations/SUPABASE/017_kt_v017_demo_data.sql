-- Klangtherapie Crew V0.17: data from _migrations/demo.ts.
-- Run after schema migrations 001-016. This does not create Auth users.
-- Replace the username below with the EXISTING app profile that should own
-- the demo tasks and participate in the five demo conversations.
-- The source dates omit a year; 2026 follows the festival dates in this project.
-- Change the year below if these tasks belong to another festival season.

begin;

set local kt.demo_actor_username = 'REPLACE_WITH_EXISTING_USERNAME';
set local kt.demo_year = '2026';

do $$
declare
  actor_name text := current_setting('kt.demo_actor_username');
  missing_names text;
  ambiguous_names text;
begin
  if actor_name = 'REPLACE_WITH_EXISTING_USERNAME' or actor_name = '' then
    raise exception 'Set kt.demo_actor_username to an existing KT_profiles.username before running this seed';
  end if;

  if to_regclass('public."KT_profiles"') is null
     or to_regclass('public."KT_teams"') is null
     or to_regclass('public."KT_tasks"') is null
     or to_regclass('public."KT_conversations"') is null
     or to_regclass('public."KT_conversation_members"') is null
     or to_regclass('public."KT_messages"') is null then
    raise exception 'Apply schema migrations 001-016 before the demo seed';
  end if;

  select string_agg(required_name, ', ' order by required_name)
    into missing_names
  from (values (actor_name), ('max'), ('lena'), ('sarah'), ('lisa'), ('kim')) as required(required_name)
  where not exists (
    select 1 from public."KT_profiles" p
    where lower(p.username) = lower(required.required_name)
  );
  if missing_names is not null then
    raise exception 'Missing Auth-backed KT_profiles usernames: %', missing_names;
  end if;

  select string_agg(required_name, ', ' order by required_name)
    into ambiguous_names
  from (select distinct lower(required_name) as required_name
        from (values (actor_name), ('max'), ('lena'), ('sarah'), ('lisa'), ('kim')) as names(required_name)) required
  where (select count(*) from public."KT_profiles" p
         where lower(p.username) = required.required_name) > 1;
  if ambiguous_names is not null then
    raise exception 'Ambiguous KT_profiles usernames (case-insensitive): %', ambiguous_names;
  end if;

  if lower(actor_name) = 'lisa' then
    raise exception 'The demo actor must differ from Lisa for the direct conversation';
  end if;

  if current_setting('kt.demo_year') !~ '^20[0-9]{2}$' then
    raise exception 'kt.demo_year must be a four-digit year from 2000 onward';
  end if;
end $$;

-- Team names are unique in the schema; preserve existing team descriptions.
insert into public."KT_teams" (name)
values ('Technik'), ('Aufbau'), ('Catering'), ('Awareness'), ('Booking')
on conflict (name) do nothing;

-- Stable IDs and a title/team check make repeat runs safe.
with actor as (
  select id from public."KT_profiles"
  where lower(username) = lower(current_setting('kt.demo_actor_username'))
), source(title, team_name, priority, status, due_day) as (
  values
    ('Mainstage vorbereiten', 'Technik', 'high', 'todo', 24),
    ('Sanitäranlagen prüfen', 'Aufbau', 'medium', 'todo', 22),
    ('Catering Bereich planen', 'Catering', 'medium', 'todo', 23),
    ('Stromplan finalisieren', 'Technik', 'high', 'doing', 21),
    ('Gelände beschildern', 'Aufbau', 'medium', 'doing', 20),
    ('Awareness Briefing', 'Awareness', 'normal', 'doing', 20),
    ('Security buchen', 'Booking', 'normal', 'done', 18)
)
insert into public."KT_tasks" (id, title, team_id, priority, status, due_at, created_by)
select md5('kt:v017:demo:task:' || s.title)::uuid,
       s.title, team.id, s.priority, s.status,
       make_timestamptz(current_setting('kt.demo_year')::int, 9, s.due_day, 23, 59, 0, 'Europe/Berlin'),
       actor.id
from source s
join public."KT_teams" team on team.name = s.team_name
cross join actor
where not exists (
  select 1 from public."KT_tasks" existing
  where existing.title = s.title and existing.team_id = team.id
)
on conflict (id) do nothing;

-- Chat previews become one message per conversation. Relative labels such as
-- "2m" are interpreted relative to the time of this seed execution.
-- The source's unread counters cannot be reconstructed from one preview message.
with actor as (
  select id from public."KT_profiles"
  where lower(username) = lower(current_setting('kt.demo_actor_username'))
), source(title, kind) as (
  values
    ('Technik', 'group'), ('Aufbau', 'group'), ('Booking', 'group'),
    ('Lisa', 'direct'), ('Awareness', 'group')
)
insert into public."KT_conversations" (id, type, title, created_by)
select md5('kt:v017:demo:conversation:' || s.title)::uuid,
       s.kind, s.title, actor.id
from source s cross join actor
on conflict (id) do nothing;

with actor as (
  select id from public."KT_profiles"
  where lower(username) = lower(current_setting('kt.demo_actor_username'))
), source(title, sender_username) as (
  values
    ('Technik', 'max'), ('Aufbau', 'lena'), ('Booking', 'sarah'),
    ('Lisa', 'lisa'), ('Awareness', 'kim')
), members as (
  select md5('kt:v017:demo:conversation:' || s.title)::uuid as conversation_id,
         actor.id as user_id
  from source s cross join actor
  union
  select md5('kt:v017:demo:conversation:' || s.title)::uuid,
         p.id
  from source s
  join public."KT_profiles" p on lower(p.username) = s.sender_username
)
insert into public."KT_conversation_members" (conversation_id, user_id)
select conversation_id, user_id from members
on conflict (conversation_id, user_id) do nothing;

with source(title, sender_username, body, minutes_ago) as (
  values
    ('Technik', 'max', 'Kabel sind da! 📦', 2),
    ('Aufbau', 'lena', 'Plan aktualisiert', 28),
    ('Booking', 'sarah', 'Artist bestätigt ✓', 60),
    ('Lisa', 'lisa', 'Alles klar 👍', 12),
    ('Awareness', 'kim', 'Treffen um 19 Uhr?', 180)
)
insert into public."KT_messages" (id, conversation_id, sender_id, body, created_at)
select md5('kt:v017:demo:message:' || s.title)::uuid,
       md5('kt:v017:demo:conversation:' || s.title)::uuid,
       p.id, s.body, now() - make_interval(mins => s.minutes_ago)
from source s
join public."KT_profiles" p on lower(p.username) = s.sender_username
on conflict (id) do nothing;

commit;

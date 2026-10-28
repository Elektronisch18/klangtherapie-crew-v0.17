-- Klangtherapie V0.16 – Messenger hardening/features
alter table public."KT_messages" add column if not exists reply_to uuid references public."KT_messages"(id) on delete set null;
alter table public."KT_conversation_members" add column if not exists last_read_at timestamptz;

create unique index if not exists "KT_message_reactions_unique" on public."KT_message_reactions"(message_id,user_id,emoji);
create index if not exists "KT_messages_conversation_created_idx" on public."KT_messages"(conversation_id,created_at);
create index if not exists "KT_messages_reply_idx" on public."KT_messages"(reply_to);

-- Reactions are only allowed for members of the message conversation.
drop policy if exists "KT reactions insert member" on public."KT_message_reactions";
create policy "KT reactions insert member" on public."KT_message_reactions" for insert to authenticated
with check(
 user_id=(select auth.uid()) and exists(
  select 1 from public."KT_messages" m
  join public."KT_conversation_members" cm on cm.conversation_id=m.conversation_id
  where m.id="KT_message_reactions".message_id and cm.user_id=(select auth.uid())
 )
);
drop policy if exists "KT reactions delete own" on public."KT_message_reactions";
create policy "KT reactions delete own" on public."KT_message_reactions" for delete to authenticated
using(user_id=(select auth.uid()));

-- Members may update only their own membership row (e.g. read cursor).
drop policy if exists "KT conversation member update self" on public."KT_conversation_members";
create policy "KT conversation member update self" on public."KT_conversation_members" for update to authenticated
using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

-- Mentions are derived server-side into notifications after message insert.
create or replace function public."KT_notify_mentions"()
returns trigger language plpgsql security definer set search_path=public as $$
declare r record;
begin
 for r in
  select p.id,p.display_name,p.username
  from public."KT_profiles" p
  join public."KT_conversation_members" cm on cm.user_id=p.id and cm.conversation_id=new.conversation_id
  where p.id<>new.sender_id and p.username is not null and new.body ilike '%@'||p.username||'%'
 loop
  insert into public."KT_notifications"(user_id,title,body)
  values(r.id,'Du wurdest erwähnt',left(new.body,180));
 end loop;
 return new;
end $$;
revoke all on function public."KT_notify_mentions"() from public;
drop trigger if exists "KT_message_mentions_notify" on public."KT_messages";
create trigger "KT_message_mentions_notify" after insert on public."KT_messages"
for each row execute function public."KT_notify_mentions"();

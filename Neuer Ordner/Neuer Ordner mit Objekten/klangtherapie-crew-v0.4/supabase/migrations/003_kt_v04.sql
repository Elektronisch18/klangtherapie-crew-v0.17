-- V0.4 conversation helpers
create or replace function public."KT_create_group"(group_title text, member_ids uuid[] default '{}')
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid; uid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public."KT_conversations"(type,title,created_by) values('group',group_title,auth.uid()) returning id into cid;
  insert into public."KT_conversation_members"(conversation_id,user_id) values(cid,auth.uid()) on conflict do nothing;
  foreach uid in array member_ids loop
    insert into public."KT_conversation_members"(conversation_id,user_id) values(cid,uid) on conflict do nothing;
  end loop;
  return cid;
end $$;

create or replace function public."KT_create_direct"(other_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
  if auth.uid() is null or other_user=auth.uid() then raise exception 'invalid user'; end if;
  select c.id into cid from public."KT_conversations" c
  where c.type='direct'
    and exists(select 1 from public."KT_conversation_members" a where a.conversation_id=c.id and a.user_id=auth.uid())
    and exists(select 1 from public."KT_conversation_members" b where b.conversation_id=c.id and b.user_id=other_user)
    and (select count(*) from public."KT_conversation_members" x where x.conversation_id=c.id)=2
  limit 1;
  if cid is null then
    insert into public."KT_conversations"(type,created_by) values('direct',auth.uid()) returning id into cid;
    insert into public."KT_conversation_members"(conversation_id,user_id) values(cid,auth.uid()),(cid,other_user);
  end if;
  return cid;
end $$;

grant execute on function public."KT_create_group"(text,uuid[]) to authenticated;
grant execute on function public."KT_create_direct"(uuid) to authenticated;

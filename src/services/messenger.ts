import { supabase } from '../lib/supabase.ts'
import type { Database } from '../types/database.ts'

export async function listMessengerConversations(uid: string) {
  const res = await supabase
    .from('KT_conversation_members')
    .select(
      'conversation_id,last_read_at,KT_conversations(id,title,type,created_at,KT_conversation_members(user_id,KT_profiles(display_name,username,avatar_url)),KT_messages(id,body,created_at,sender_id))'
    )
    .eq('user_id', uid)
    .order('last_read_at', { ascending: false })

  if (res.error) throw res.error
  return res
}

export async function listMessengerMessages(conversation_id: string) {
  const res = await supabase
    .from('KT_messages')
    .select(
      'id,body,created_at,sender_id,reply_to,KT_profiles(display_name,username,avatar_url),KT_message_reactions(message_id,emoji,user_id),KT_message_attachments(id,file_name,storage_path,mime_type,size_bytes)'
    )
    .eq('conversation_id', conversation_id)
    .order('created_at')

  if (res.error) throw res.error
  return res
}

export async function sendMessengerMessage(
  conversation_id: string,
  sender_id: string,
  body: string,
  reply_to?: string | null
) {
  const res = await supabase
    .from('KT_messages')
    .insert({
      conversation_id,
      sender_id,
      body,
      reply_to: reply_to || null,
    })
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export async function reactMessage(message_id: string, user_id: string, emoji: string) {
  const res = await supabase
    .from('KT_message_reactions')
    .upsert({ message_id, user_id, emoji }, { onConflict: 'message_id,user_id,emoji' })

  if (res.error) throw res.error
  return res
}

export async function markConversationRead(conversation_id: string, user_id: string) {
  const res = await supabase
    .from('KT_conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversation_id)
    .eq('user_id', user_id)

  if (res.error) throw res.error
  return res
}

export async function searchMessages(conversation_id: string, q: string) {
  const res = await supabase
    .from('KT_messages')
    .select('id,body,created_at,sender_id,KT_profiles(display_name,username)')
    .eq('conversation_id', conversation_id)
    .ilike('body', `%${q}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (res.error) throw res.error
  return res
}

export async function addMessageAttachment(
  message_id: string,
  file_name: string,
  storage_path: string,
  mime_type?: string,
  size_bytes?: number
) {
  const res = await supabase
    .from('KT_message_attachments')
    .insert({ message_id, file_name, storage_path, mime_type, size_bytes })
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export function subscribeMessenger(conversation_id: string, cb: (payload: any) => void) {
  const channel = supabase
    .channel(`messenger:${conversation_id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'KT_messages',
        filter: `conversation_id=eq.${conversation_id}`,
      },
      (p) => cb(p.new)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

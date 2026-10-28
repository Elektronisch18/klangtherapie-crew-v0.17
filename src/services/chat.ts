import { supabase } from '../lib/supabase.ts'

export async function listConversations() {
  const res = await supabase
    .from('KT_conversations')
    .select('id,type,title,created_at,KT_conversation_members!inner(user_id)')
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res
}

export async function listMessages(conversationId: string) {
  const res = await supabase
    .from('KT_messages')
    .select('id,body,created_at,sender_id,reply_to')
    .eq('conversation_id', conversationId)
    .order('created_at')
  if (res.error) throw res.error
  return res
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const res = await supabase
    .from('KT_messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
  if (res.error) throw res.error
  return res
}

export function subscribeMessages(conversationId: string, onInsert: (row: any) => void) {
  const channel = supabase
    .channel(`kt-chat-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'KT_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new)
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

export async function createDirect(other_user: string) {
  return supabase.rpc('KT_create_direct', { other_user })
}

export async function createGroup(group_title: string, member_ids: string[]) {
  return supabase.rpc('KT_create_group', { group_title, member_ids })
}

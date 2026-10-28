import { supabase } from '../lib/supabase'
export async function listConversations(){
  return supabase.from('KT_conversations').select('id,type,title,created_at,KT_conversation_members!inner(user_id)').order('created_at',{ascending:false})
}
export async function listMessages(conversationId:string){
  return supabase.from('KT_messages').select('id,body,created_at,sender_id,reply_to').eq('conversation_id',conversationId).order('created_at')
}
export async function sendMessage(conversationId:string,senderId:string,body:string){
  return supabase.from('KT_messages').insert({conversation_id:conversationId,sender_id:senderId,body})
}
export function subscribeMessages(conversationId:string,onInsert:(row:any)=>void){
  const channel=supabase.channel(`kt-chat-${conversationId}`).on('postgres_changes',
    {event:'INSERT',schema:'public',table:'KT_messages',filter:`conversation_id=eq.${conversationId}`},
    payload=>onInsert(payload.new)).subscribe()
  return ()=>{supabase.removeChannel(channel)}
}

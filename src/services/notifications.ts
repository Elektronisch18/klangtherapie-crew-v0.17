import { supabase } from '../lib/supabase.ts'

export async function listNotifications(user_id: string) {
  const res = await supabase
    .from('KT_notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
  if (res.error) throw res.error
  return res
}

export function subscribeNotifications(user_id: string, cb: (row: any) => void) {
  const c = supabase
    .channel(`notify:${user_id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'KT_notifications',
        filter: `user_id=eq.${user_id}`,
      },
      (p) => cb(p.new)
    )
    .subscribe()

  return () => {
    supabase.removeChannel(c)
  }
}

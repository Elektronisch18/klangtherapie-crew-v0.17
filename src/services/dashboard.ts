import { supabase } from '../lib/supabase.ts'

export async function getDashboardData(user_id: string) {
  const now = new Date().toISOString()
  const [tasks, notifications, timetable, contacts, profile] = await Promise.all([
    supabase
      .from('KT_tasks')
      .select('id,title,priority,due_at,status,KT_task_assignees!inner(user_id)')
      .eq('KT_task_assignees.user_id', user_id)
      .neq('status', 'done')
      .order('due_at', { ascending: true })
      .limit(4),
    supabase
      .from('KT_notifications')
      .select('*')
      .eq('user_id', user_id)
      .is('read_at', null)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('KT_timetable')
      .select('id,starts_at,ends_at,KT_artists(name),KT_locations(name)')
      .gte('ends_at', now)
      .order('starts_at')
      .limit(4),
    supabase.from('KT_crew_contacts').select('*').order('sort_order').limit(4),
    supabase
      .from('KT_profiles')
      .select('display_name,username,KT_team_members(KT_teams(name))')
      .eq('id', user_id)
      .single(),
  ])

  if (tasks.error) throw tasks.error
  if (notifications.error) throw notifications.error
  if (timetable.error) throw timetable.error
  if (contacts.error) throw contacts.error

  return {
    tasks: tasks.data || [],
    notifications: notifications.data || [],
    timetable: timetable.data || [],
    contacts: contacts.data || [],
    profile: profile.data,
  }
}

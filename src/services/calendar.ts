import { supabase } from '../lib/supabase.ts'
import type { CalendarEventVisibility } from '../types/database.ts'

export async function getCalendarFeed(from: string, to: string, user_id: string) {
  const [events, shifts, timetable, tasks] = await Promise.all([
    supabase
      .from('KT_calendar_events')
      .select('*,KT_teams(name),KT_locations(name)')
      .gte('ends_at', from)
      .lte('starts_at', to)
      .order('starts_at'),
    supabase
      .from('KT_shift_assignments')
      .select('status,KT_shifts(id,title,starts_at,ends_at,KT_locations(name))')
      .eq('user_id', user_id)
      .eq('status', 'confirmed'),
    supabase
      .from('KT_timetable')
      .select('id,starts_at,ends_at,KT_artists(name),KT_locations(name)')
      .gte('ends_at', from)
      .lte('starts_at', to),
    supabase
      .from('KT_tasks')
      .select('id,title,due_at,status,KT_task_assignees!inner(user_id)')
      .eq('KT_task_assignees.user_id', user_id)
      .gte('due_at', from)
      .lte('due_at', to),
  ])

  if (events.error) throw events.error
  if (shifts.error) throw shifts.error
  if (timetable.error) throw timetable.error
  if (tasks.error) throw tasks.error

  return {
    events: events.data || [],
    shifts: shifts.data || [],
    timetable: timetable.data || [],
    tasks: tasks.data || [],
  }
}

export async function createCalendarEvent(input: {
  title: string
  starts_at: string
  ends_at: string
  location_id?: string | null
  location_text?: string | null
  team_id?: string | null
  visibility?: CalendarEventVisibility
  created_by: string
}) {
  const res = await supabase.from('KT_calendar_events').insert(input).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteCalendarEvent(id: string) {
  const res = await supabase.from('KT_calendar_events').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

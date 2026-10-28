import { supabase } from '../lib/supabase.ts'
import type { IncidentPriority, IncidentStatus } from '../types/database.ts'

export async function loadControlCenter() {
  const now = new Date()
  const later = new Date(Date.now() + 8 * 3600000)
  const twelveHoursAgo = new Date(Date.now() - 12 * 3600000).toISOString()

  const [shiftsRes, issuesRes, checkinsRes, teamsRes] = await Promise.all([
    supabase
      .from('KT_shifts')
      .select(
        'id,title,starts_at,ends_at,needed,KT_locations(name),KT_shift_assignments(status,user_id,KT_profiles(display_name,username))'
      )
      .lte('starts_at', later.toISOString())
      .gte('ends_at', now.toISOString())
      .order('starts_at'),
    supabase
      .from('KT_incidents')
      .select('*,KT_profiles(display_name,username),KT_teams(name),KT_locations(name)')
      .neq('status', 'resolved')
      .order('priority')
      .order('created_at', { ascending: false }),
    supabase
      .from('KT_checkins')
      .select('id,user_id,shift_id,checked_in_at,KT_profiles(display_name,username)')
      .gte('checked_in_at', twelveHoursAgo)
      .order('checked_in_at', { ascending: false }),
    supabase
      .from('KT_teams')
      .select('id,name,KT_team_members(user_id,KT_profiles(display_name,active,last_seen))')
      .order('name'),
  ])

  if (shiftsRes.error) throw shiftsRes.error
  if (issuesRes.error) throw issuesRes.error
  if (checkinsRes.error) throw checkinsRes.error
  if (teamsRes.error) throw teamsRes.error

  const formattedShifts = (shiftsRes.data || []).map((s: any) => ({
    ...s,
    capacity: s.needed,
  }))

  const formattedCheckins = (checkinsRes.data || []).map((c: any) => ({
    ...c,
    created_at: c.checked_in_at,
  }))

  return {
    shifts: formattedShifts,
    issues: issuesRes.data || [],
    checkins: formattedCheckins,
    teams: teamsRes.data || [],
  }
}

export async function createIncident(input: {
  title: string
  description?: string | null
  priority?: IncidentPriority
  status?: IncidentStatus
  reported_by: string
  team_id?: string | null
  location_id?: string | null
}) {
  const res = await supabase.from('KT_incidents').insert(input).select().single()
  if (res.error) throw res.error
  return res
}

export async function updateIncidentStatus(id: string, status: IncidentStatus) {
  const res = await supabase
    .from('KT_incidents')
    .update({
      status,
      resolved_at: status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export function subscribeControlCenter(reload: () => void) {
  const channel = supabase
    .channel('control-center')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'KT_incidents' }, reload)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'KT_checkins' }, reload)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'KT_shift_assignments' }, reload)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

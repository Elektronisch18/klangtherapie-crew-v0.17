import { supabase } from '../lib/supabase.ts'

export async function listProfiles() {
  const res = await supabase
    .from('KT_profiles')
    .select(
      'id,username,display_name,avatar_url,active,last_seen,KT_user_roles(KT_roles(id,name,rank)),KT_team_members(KT_teams(id,name))'
    )
    .order('display_name')
  if (res.error) throw res.error
  return res
}

export async function listRoles() {
  const res = await supabase.from('KT_roles').select('*').order('rank', { ascending: false })
  if (res.error) throw res.error
  return res
}

export async function listTeams() {
  const res = await supabase.from('KT_teams').select('*').order('name')
  if (res.error) throw res.error
  return res
}

export async function assignRole(user_id: string, role_id: string) {
  const res = await supabase.from('KT_user_roles').upsert({ user_id, role_id })
  if (res.error) throw res.error
  return res
}

export async function removeRole(user_id: string, role_id: string) {
  const res = await supabase
    .from('KT_user_roles')
    .delete()
    .eq('user_id', user_id)
    .eq('role_id', role_id)
  if (res.error) throw res.error
  return res
}

export async function addToTeam(user_id: string, team_id: string, is_lead = false) {
  const res = await supabase.from('KT_team_members').upsert({ user_id, team_id, is_lead })
  if (res.error) throw res.error
  return res
}

export async function removeFromTeam(user_id: string, team_id: string) {
  const res = await supabase
    .from('KT_team_members')
    .delete()
    .eq('user_id', user_id)
    .eq('team_id', team_id)
  if (res.error) throw res.error
  return res
}

export async function setUserActive(id: string, active: boolean) {
  const res = await supabase.from('KT_profiles').update({ active }).eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function createInvitation(email: string, role_id?: string, team_id?: string) {
  return supabase.functions.invoke('kt-invite-user', {
    body: {
      email,
      role_id: role_id || null,
      team_id: team_id || null,
      redirectTo: window.location.origin + '/',
    },
  })
}

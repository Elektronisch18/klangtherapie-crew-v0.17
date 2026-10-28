import { supabase } from '../lib/supabase.ts'
import type { Database } from '../types/database.ts'

export async function listCrew() {
  const res = await supabase
    .from('KT_profiles')
    .select(
      'id,username,display_name,avatar_url,phone,active,last_seen,bio,skills,emergency_contact,KT_user_roles(role_id,KT_roles(id,name,rank)),KT_team_members(team_id,is_lead,KT_teams(id,name))'
    )
    .order('display_name')
  if (res.error) throw res.error
  return res
}

export async function getCrewProfile(id: string) {
  const res = await supabase
    .from('KT_profiles')
    .select(
      '*,KT_user_roles(role_id,KT_roles(id,name,rank)),KT_team_members(team_id,is_lead,KT_teams(id,name))'
    )
    .eq('id', id)
    .single()
  if (res.error) throw res.error
  return res
}

export async function updateMyCrewProfile(
  id: string,
  input: Database['public']['Tables']['KT_profiles']['Update']
) {
  const res = await supabase.from('KT_profiles').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function listPermissions() {
  const res = await supabase.from('KT_permissions').select('*').order('key')
  if (res.error) throw res.error
  return res
}

export async function listRolePermissions() {
  const res = await supabase
    .from('KT_role_permissions')
    .select('role_id,permission_id,KT_permissions(id,key,description)')
  if (res.error) throw res.error
  return res
}

export async function setRolePermission(role_id: string, permission_id: string, enabled: boolean) {
  const res = enabled
    ? await supabase.from('KT_role_permissions').upsert({ role_id, permission_id })
    : await supabase
        .from('KT_role_permissions')
        .delete()
        .eq('role_id', role_id)
        .eq('permission_id', permission_id)
  if (res.error) throw res.error
  return res
}

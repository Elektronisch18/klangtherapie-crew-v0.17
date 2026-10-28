import { supabase } from '../lib/supabase'
export async function listProfiles(){
  return supabase.from('KT_profiles').select('id,username,display_name,avatar_url,active,last_seen,KT_user_roles(KT_roles(id,name,rank)),KT_team_members(KT_teams(id,name))').order('display_name')
}
export async function listRoles(){return supabase.from('KT_roles').select('*').order('rank',{ascending:false})}
export async function listTeams(){return supabase.from('KT_teams').select('*').order('name')}
export async function assignRole(user_id:string,role_id:string){return supabase.from('KT_user_roles').upsert({user_id,role_id})}
export async function addToTeam(user_id:string,team_id:string,is_lead=false){return supabase.from('KT_team_members').upsert({user_id,team_id,is_lead})}

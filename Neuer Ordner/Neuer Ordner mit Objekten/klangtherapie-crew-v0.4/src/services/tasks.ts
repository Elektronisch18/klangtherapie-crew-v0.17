import { supabase } from '../lib/supabase'
export async function listTasks(){return supabase.from('KT_tasks').select('*,KT_teams(name),KT_task_assignees(user_id)').order('created_at',{ascending:false})}
export async function createTask(input:{title:string;description?:string;priority?:string;team_id?:string|null;created_by:string}){
  return supabase.from('KT_tasks').insert(input).select().single()
}
export async function updateTaskStatus(id:string,status:'todo'|'doing'|'done'){
  return supabase.from('KT_tasks').update({status,updated_at:new Date().toISOString()}).eq('id',id)
}

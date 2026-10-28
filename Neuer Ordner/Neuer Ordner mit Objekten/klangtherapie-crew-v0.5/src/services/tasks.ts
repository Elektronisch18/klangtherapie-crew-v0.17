import { supabase } from '../lib/supabase'
export async function listTasks(){return supabase.from('KT_tasks').select('*,KT_teams(name),KT_task_assignees(user_id)').order('created_at',{ascending:false})}
export async function createTask(input:{title:string;description?:string;priority?:string;team_id?:string|null;created_by:string;due_at?:string|null}){return supabase.from('KT_tasks').insert(input).select().single()}
export async function updateTask(id:string,input:Record<string,unknown>){return supabase.from('KT_tasks').update({...input,updated_at:new Date().toISOString()}).eq('id',id).select().single()}
export async function updateTaskStatus(id:string,status:'todo'|'doing'|'done'){return updateTask(id,{status})}
export async function deleteTask(id:string){return supabase.from('KT_tasks').delete().eq('id',id)}

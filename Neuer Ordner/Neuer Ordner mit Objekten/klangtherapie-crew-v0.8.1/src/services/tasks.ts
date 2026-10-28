import { supabase } from '../lib/supabase'
export async function listTasks(){return supabase.from('KT_tasks').select('*,KT_teams(name),KT_task_assignees(user_id)').order('created_at',{ascending:false})}
export async function createTask(input:{title:string;description?:string;priority?:string;team_id?:string|null;created_by:string;due_at?:string|null}){return supabase.from('KT_tasks').insert(input).select().single()}
export async function updateTask(id:string,input:Record<string,unknown>){return supabase.from('KT_tasks').update({...input,updated_at:new Date().toISOString()}).eq('id',id).select().single()}
export async function updateTaskStatus(id:string,status:'todo'|'doing'|'done'){return updateTask(id,{status})}
export async function deleteTask(id:string){return supabase.from('KT_tasks').delete().eq('id',id)}

export async function getTaskDetails(id:string){return supabase.from('KT_tasks').select('*,KT_task_assignees(user_id),KT_subtasks(*),KT_task_comments(*)').eq('id',id).single()}
export async function addTaskComment(task_id:string,author_id:string,body:string){return supabase.from('KT_task_comments').insert({task_id,author_id,body}).select().single()}
export async function addSubtask(task_id:string,title:string){return supabase.from('KT_subtasks').insert({task_id,title}).select().single()}
export async function assignTask(task_id:string,user_id:string){return supabase.from('KT_task_assignees').upsert({task_id,user_id})}

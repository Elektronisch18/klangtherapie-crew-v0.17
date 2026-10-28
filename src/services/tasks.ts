import { supabase } from '../lib/supabase.ts'
import type { Database, TaskPriority, TaskStatus } from '../types/database.ts'

const priorityMap: Record<string, TaskPriority> = {
  niedrig: 'low',
  low: 'low',
  normal: 'normal',
  mittel: 'medium',
  medium: 'medium',
  hoch: 'high',
  high: 'high',
}

export function normalizePriority(p?: string): TaskPriority {
  if (!p) return 'normal'
  const key = p.toLowerCase().trim()
  return priorityMap[key] || 'normal'
}

export async function listTasks() {
  const res = await supabase
    .from('KT_tasks')
    .select('*,KT_teams(id,name),KT_task_assignees(user_id,KT_profiles(id,display_name,username,avatar_url))')
    .order('created_at', { ascending: false })

  if (res.error) {
    const fallback = await supabase
      .from('KT_tasks')
      .select('*,KT_teams(id,name),KT_task_assignees(user_id)')
      .order('created_at', { ascending: false })
    if (fallback.error) throw res.error
    return fallback
  }
  return res
}

export async function createTask(input: {
  title: string
  description?: string
  priority?: string
  team_id?: string | null
  created_by: string
  due_at?: string | null
}) {
  const validPriority = normalizePriority(input.priority)
  const res = await supabase
    .from('KT_tasks')
    .insert({
      title: input.title,
      description: input.description || null,
      priority: validPriority,
      team_id: input.team_id || null,
      created_by: input.created_by,
      due_at: input.due_at || null,
    })
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export async function updateTask(
  id: string,
  input: Database['public']['Tables']['KT_tasks']['Update']
) {
  const res = await supabase
    .from('KT_tasks')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return updateTask(id, { status })
}

export async function deleteTask(id: string) {
  const res = await supabase.from('KT_tasks').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function getTaskDetails(id: string) {
  const res = await supabase
    .from('KT_tasks')
    .select('*,KT_task_assignees(user_id),KT_subtasks(*),KT_task_comments(*)')
    .eq('id', id)
    .single()

  if (res.error) throw res.error
  return res
}

export async function addTaskComment(task_id: string, author_id: string, body: string) {
  const res = await supabase
    .from('KT_task_comments')
    .insert({ task_id, author_id, body })
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export async function addSubtask(task_id: string, title: string) {
  const res = await supabase
    .from('KT_subtasks')
    .insert({ task_id, title, done: false })
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export async function assignTask(task_id: string, user_id: string) {
  const res = await supabase.from('KT_task_assignees').upsert({ task_id, user_id })
  if (res.error) throw res.error
  return res
}

export async function unassignTask(task_id: string, user_id: string) {
  const res = await supabase
    .from('KT_task_assignees')
    .delete()
    .eq('task_id', task_id)
    .eq('user_id', user_id)
  if (res.error) throw res.error
  return res
}

export async function assignTaskToCrewAndTeam(
  task_id: string,
  user_id: string | null,
  team_id: string | null
) {
  const res1 = await supabase
    .from('KT_tasks')
    .update({ team_id: team_id || null, updated_at: new Date().toISOString() })
    .eq('id', task_id)
  if (res1.error) throw res1.error

  await supabase.from('KT_task_assignees').delete().eq('task_id', task_id)
  if (user_id) {
    const res2 = await supabase.from('KT_task_assignees').insert({ task_id, user_id })
    if (res2.error) throw res2.error
  }
  return { success: true }
}

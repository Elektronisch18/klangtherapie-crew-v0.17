import { supabase } from '../lib/supabase.ts'

export async function getTaskDetail(id: string) {
  const res = await supabase
    .from('KT_tasks')
    .select(
      '*,KT_task_assignees(user_id,KT_profiles(display_name,username,avatar_url)),KT_subtasks(*),KT_task_comments(*,KT_profiles(display_name,username)),KT_documents(id,name,storage_path,mime_type,size_bytes,created_at)'
    )
    .eq('id', id)
    .single()

  if (res.error) throw res.error
  return res
}

export async function addTaskComment(task_id: string, user_id: string, body: string) {
  const res = await supabase
    .from('KT_task_comments')
    .insert({ task_id, author_id: user_id, body })
    .select('*,KT_profiles(display_name,username)')
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

export async function toggleSubtask(id: string, done: boolean) {
  const res = await supabase
    .from('KT_subtasks')
    .update({ done })
    .eq('id', id)
    .select()
    .single()

  if (res.error) throw res.error
  return res
}

export async function addTaskActivity(
  task_id: string,
  user_id: string,
  event_type: string,
  message: string
) {
  const res = await supabase
    .from('KT_task_activity')
    .insert({ task_id, user_id, event_type, message })

  if (res.error) throw res.error
  return res
}

export async function listTaskActivity(task_id: string) {
  const res = await supabase
    .from('KT_task_activity')
    .select('*,KT_profiles(display_name,username)')
    .eq('task_id', task_id)
    .order('created_at', { ascending: false })

  if (res.error) throw res.error
  return res
}

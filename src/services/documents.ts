import { supabase } from '../lib/supabase.ts'

const bucket = 'kt-crew-files'

export async function listDocuments(folder?: string) {
  let q = supabase
    .from('KT_documents')
    .select('*,KT_profiles(display_name,username),KT_teams(name),KT_tasks(title)')
    .order('created_at', { ascending: false })

  if (folder) q = q.eq('folder', folder)
  const res = await q
  if (res.error) throw res.error
  return res
}

export async function uploadDocument(
  file: File,
  input: {
    folder: string
    category?: string
    team_id?: string | null
    task_id?: string | null
    user_id: string
  }
) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `documents/${input.folder}/${crypto.randomUUID()}.${ext}`

  const up = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })

  if (up.error) return { data: null, error: up.error }

  const row = await supabase
    .from('KT_documents')
    .insert({
      name: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      folder: input.folder,
      category: input.category || null,
      team_id: input.team_id || null,
      task_id: input.task_id || null,
      uploaded_by: input.user_id,
    })
    .select()
    .single()

  if (row.error) {
    await supabase.storage.from(bucket).remove([path])
    throw row.error
  }
  return row
}

export async function documentUrl(path: string) {
  return supabase.storage.from(bucket).createSignedUrl(path, 900)
}

export async function deleteDocument(id: string, path: string) {
  const row = await supabase.from('KT_documents').delete().eq('id', id)
  if (!row.error) {
    await supabase.storage.from(bucket).remove([path])
  } else {
    throw row.error
  }
  return row
}

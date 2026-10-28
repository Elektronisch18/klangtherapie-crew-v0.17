import { supabase } from '../lib/supabase.ts'
import type { AvailabilityStatus, Database } from '../types/database.ts'

export async function listShifts() {
  const res = await supabase
    .from('KT_shifts')
    .select('*,KT_locations(name),KT_shift_assignments(user_id,status)')
    .order('starts_at')
  if (res.error) throw res.error
  return res
}

export async function listArtists() {
  const res = await supabase.from('KT_artists').select('*').order('name')
  if (res.error) throw res.error
  return res
}

export async function listTimetable() {
  const res = await supabase
    .from('KT_timetable')
    .select('*,KT_artists(name),KT_locations(name)')
    .order('starts_at')
  if (res.error) throw res.error
  return res
}

export async function listLocations() {
  const res = await supabase.from('KT_locations').select('*').order('name')
  if (res.error) throw res.error
  return res
}

export async function listCrewContacts() {
  const res = await supabase.from('KT_crew_contacts').select('*').order('sort_order')
  if (res.error) throw res.error
  return res
}

export async function listEmergencyInfo() {
  const res = await supabase.from('KT_emergency_info').select('*').order('sort_order')
  if (res.error) throw res.error
  return res
}

export async function takeShift(shift_id: string, user_id: string) {
  const res = await supabase
    .from('KT_shift_assignments')
    .upsert({ shift_id, user_id, status: 'confirmed' })
  if (res.error) throw res.error
  return res
}

export async function leaveShift(shift_id: string, user_id: string) {
  const res = await supabase
    .from('KT_shift_assignments')
    .delete()
    .eq('shift_id', shift_id)
    .eq('user_id', user_id)
  if (res.error) throw res.error
  return res
}

export async function setAvailability(
  user_id: string,
  date: string,
  status: AvailabilityStatus,
  note?: string
) {
  const res = await supabase
    .from('KT_availability')
    .upsert({ user_id, date, status, note: note || null }, { onConflict: 'user_id,date' })
  if (res.error) throw res.error
  return res
}

export async function createShift(input: {
  title: string
  location_id?: string | null
  starts_at: string
  ends_at: string
  needed?: number
  description?: string | null
  created_by?: string | null
}) {
  const res = await supabase.from('KT_shifts').insert(input).select().single()
  if (res.error) throw res.error
  return res
}

export async function updateShift(
  id: string,
  input: Database['public']['Tables']['KT_shifts']['Update']
) {
  const res = await supabase.from('KT_shifts').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteShift(id: string) {
  const res = await supabase.from('KT_shifts').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function createArtist(input: { name: string; genre?: string; contact?: string; notes?: string }) {
  const res = await supabase.from('KT_artists').insert(input).select().single()
  if (res.error) throw res.error
  return res
}

export async function updateArtist(id: string, input: { name?: string; genre?: string; contact?: string; notes?: string }) {
  const res = await supabase.from('KT_artists').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteArtist(id: string) {
  const res = await supabase.from('KT_artists').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function createTimetableEntry(input: {
  artist_id?: string | null
  location_id?: string | null
  starts_at: string
  ends_at: string
  notes?: string | null
}) {
  const res = await supabase.from('KT_timetable').insert(input).select().single()
  if (res.error) throw res.error
  return res
}

export async function updateTimetableEntry(
  id: string,
  input: {
    artist_id?: string | null
    location_id?: string | null
    starts_at?: string
    ends_at?: string
    notes?: string | null
  }
) {
  const res = await supabase.from('KT_timetable').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteTimetableEntry(id: string) {
  const res = await supabase.from('KT_timetable').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function updateCrewContact(
  id: string,
  input: {
    name?: string
    role?: string | null
    phone?: string | null
    email?: string | null
  }
) {
  const res = await supabase.from('KT_crew_contacts').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteCrewContact(id: string) {
  const res = await supabase.from('KT_crew_contacts').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function updateEmergencyInfo(
  id: string,
  input: {
    title?: string
    body?: string
  }
) {
  const res = await supabase.from('KT_emergency_info').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteEmergencyInfo(id: string) {
  const res = await supabase.from('KT_emergency_info').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function createLocation(input: { name: string; description?: string; map_url?: string }) {
  const res = await supabase.from('KT_locations').insert(input).select().single()
  if (res.error) throw res.error
  return res
}

export async function updateLocation(id: string, input: { name?: string; description?: string; map_url?: string }) {
  const res = await supabase.from('KT_locations').update(input).eq('id', id).select().single()
  if (res.error) throw res.error
  return res
}

export async function deleteLocation(id: string) {
  const res = await supabase.from('KT_locations').delete().eq('id', id)
  if (res.error) throw res.error
  return res
}

export async function listAvailability() {
  const res = await supabase
    .from('KT_availability')
    .select('*,KT_profiles(display_name,username)')
    .order('date')
  if (res.error) throw res.error
  return res
}

export async function checkIn(user_id: string, shift_id?: string) {
  const res = await supabase
    .from('KT_checkins')
    .insert({ user_id, shift_id: shift_id || null })
    .select()
    .single()
  if (res.error) throw res.error
  return res
}

export async function listMyUpcomingShifts(user_id: string) {
  const res = await supabase
    .from('KT_shift_assignments')
    .select('status,KT_shifts(id,title,starts_at,ends_at,needed,KT_locations(name))')
    .eq('user_id', user_id)
    .eq('status', 'confirmed')
    .gte('KT_shifts.starts_at', new Date().toISOString())
    .order('starts_at', { referencedTable: 'KT_shifts', ascending: true })
    .limit(2)

  if (res.error) throw res.error
  return res
}

export async function joinShift(shift_id: string) {
  return supabase.rpc('KT_join_shift', { p_shift_id: shift_id })
}

export async function leaveShiftSafe(shift_id: string) {
  return supabase.rpc('KT_leave_shift', { p_shift_id: shift_id })
}

export async function myShiftConflicts(shift_id: string) {
  return supabase.rpc('KT_shift_conflicts', { p_shift_id: shift_id })
}

export async function shiftRoster(shift_id: string) {
  const res = await supabase
    .from('KT_shift_assignments')
    .select('status,user_id,created_at,KT_profiles(display_name,username)')
    .eq('shift_id', shift_id)
    .order('created_at')

  if (res.error) throw res.error
  return res
}

export async function checkInShift(shift_id: string) {
  return supabase.rpc('KT_check_in_shift', { p_shift_id: shift_id })
}

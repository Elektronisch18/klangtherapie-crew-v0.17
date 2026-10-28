import { supabase } from '../lib/supabase'

export const listShifts = () =>
  supabase.from('KT_shifts').select('*,KT_locations(name),KT_shift_assignments(user_id,status)').order('starts_at')

export const listArtists = () =>
  supabase.from('KT_artists').select('*').order('name')

export const listTimetable = () =>
  supabase.from('KT_timetable').select('*,KT_artists(name),KT_locations(name)').order('starts_at')

export const listLocations = () =>
  supabase.from('KT_locations').select('*').order('name')

export const listCrewContacts = () =>
  supabase.from('KT_crew_contacts').select('*').order('sort_order')

export const listEmergencyInfo = () =>
  supabase.from('KT_emergency_info').select('*').order('sort_order')

export const takeShift = (shift_id:string,user_id:string) =>
  supabase.from('KT_shift_assignments').upsert({shift_id,user_id,status:'confirmed'})

export const leaveShift = (shift_id:string,user_id:string) =>
  supabase.from('KT_shift_assignments').delete().eq('shift_id',shift_id).eq('user_id',user_id)

export const setAvailability = (user_id:string,date:string,status:string,note?:string) =>
  supabase.from('KT_availability').upsert({user_id,date,status,note:note||null},{onConflict:'user_id,date'})

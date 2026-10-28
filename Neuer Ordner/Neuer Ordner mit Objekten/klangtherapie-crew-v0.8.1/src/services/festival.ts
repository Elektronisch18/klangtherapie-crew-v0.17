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

export const createShift=(input:any)=>supabase.from('KT_shifts').insert(input).select().single()
export const updateShift=(id:string,input:any)=>supabase.from('KT_shifts').update(input).eq('id',id).select().single()
export const deleteShift=(id:string)=>supabase.from('KT_shifts').delete().eq('id',id)
export const createArtist=(input:any)=>supabase.from('KT_artists').insert(input).select().single()
export const createTimetableEntry=(input:any)=>supabase.from('KT_timetable').insert(input).select().single()
export const createLocation=(input:any)=>supabase.from('KT_locations').insert(input).select().single()
export const listAvailability=()=>supabase.from('KT_availability').select('*,KT_profiles(display_name,username)').order('date')
export const checkIn=(user_id:string,shift_id?:string)=>supabase.from('KT_checkins').insert({user_id,shift_id:shift_id||null}).select().single()

export const listMyUpcomingShifts=(user_id:string)=>
  supabase.from('KT_shift_assignments')
    .select('status,KT_shifts(id,title,starts_at,ends_at,needed,KT_locations(name))')
    .eq('user_id',user_id).eq('status','confirmed')
    .gte('KT_shifts.starts_at',new Date().toISOString())
    .order('starts_at',{referencedTable:'KT_shifts',ascending:true}).limit(2)

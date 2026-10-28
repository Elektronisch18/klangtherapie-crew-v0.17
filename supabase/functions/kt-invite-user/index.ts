import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
Deno.serve(async(req)=>{try{
 const url=Deno.env.get('SUPABASE_URL')!, anon=Deno.env.get('SUPABASE_ANON_KEY')!, service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 const caller=createClient(url,anon,{global:{headers:{Authorization:req.headers.get('Authorization')||''}}})
 const {data:{user}}=await caller.auth.getUser(); if(!user)throw new Error('Nicht angemeldet')
 const {data:allowed}=await caller.rpc('KT_can_invite'); if(!allowed)throw new Error('Keine Berechtigung')
 const {email,role_id,team_id,redirectTo}=await req.json()
 const admin=createClient(url,service)
 const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo,data:{kt_role_id:role_id||null,kt_team_id:team_id||null}})
 if(error)throw error
 await admin.from('KT_invitations').insert({email:email.toLowerCase().trim(),role_id:role_id||null,team_id:team_id||null,invited_by:user.id,auth_user_id:data.user?.id||null,status:'sent'})
 return new Response(JSON.stringify({ok:true}),{headers:{'Content-Type':'application/json'}})
}catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'Fehler'}),{status:400,headers:{'Content-Type':'application/json'}})}})

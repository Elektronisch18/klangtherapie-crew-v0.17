import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'

type AuthState={
  session:Session|null; user:User|null; loading:boolean; demo:boolean;
  signIn:(login:string,password:string)=>Promise<string|null>; signOut:()=>Promise<void>
}
const C=createContext<AuthState|null>(null)

export function AuthProvider({children}:{children:React.ReactNode}){
  const[session,setSession]=useState<Session|null>(null)
  const[loading,setLoading]=useState(supabaseConfigured)
  const[demo,setDemo]=useState(!supabaseConfigured)

  useEffect(()=>{
    if(!supabaseConfigured)return
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
    return()=>subscription.unsubscribe()
  },[])

  async function signIn(login:string,password:string){
    if(!supabaseConfigured){setDemo(true);return null}
    if(login.includes('@')){
      const{error}=await supabase.auth.signInWithPassword({email:login,password})
      return error?.message||null
    }
    const endpoint=import.meta.env.VITE_USERNAME_LOGIN_URL as string|undefined
    if(!endpoint)return 'Benutzername-Login ist noch nicht serverseitig konfiguriert. Bitte E-Mail verwenden.'
    const res=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({username:login,password})})
    const body=await res.json().catch(()=>({}))
    if(!res.ok)return body.error||'Login fehlgeschlagen.'
    if(body.access_token&&body.refresh_token){
      const{error}=await supabase.auth.setSession({access_token:body.access_token,refresh_token:body.refresh_token})
      return error?.message||null
    }
    return 'Ungültige Login-Antwort.'
  }
  async function signOut(){if(supabaseConfigured)await supabase.auth.signOut();else setDemo(true)}
  return <C.Provider value={{session,user:session?.user??null,loading,demo,signIn,signOut}}>{children}</C.Provider>
}
export const useAuth=()=>{const v=useContext(C);if(!v)throw new Error('AuthProvider fehlt');return v}

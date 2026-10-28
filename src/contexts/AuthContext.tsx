import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'

export type UserRole = 'Super Admin' | 'Admin' | 'Teamleitung' | 'Crew'

type AuthState = {
  session: Session | null
  user: User | null
  loading: boolean
  demo: boolean
  role: UserRole
  isAdmin: boolean
  isCrew: boolean
  canEdit: boolean
  setRole: (role: UserRole) => void
  signIn: (login: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const C = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [demo, setDemo] = useState(!supabaseConfigured)

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem('kt_active_role')
    if (saved === 'Super Admin' || saved === 'Admin' || saved === 'Teamleitung' || saved === 'Crew') {
      return saved
    }
    return 'Crew' // Standard für Crew-Mitglieder: Nur Lesen
  })

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole)
    localStorage.setItem('kt_active_role', newRole)
  }

  useEffect(() => {
    if (!supabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  // Rolle aus Supabase nachladen, sofern kein manueller localStorage-Override gewählt wurde
  useEffect(() => {
    if (!session?.user || localStorage.getItem('kt_active_role')) return
    const metaRole = session.user.user_metadata?.role || session.user.app_metadata?.role
    if (metaRole === 'Admin' || metaRole === 'Super Admin' || metaRole === 'Teamleitung' || metaRole === 'Crew') {
      setRoleState(metaRole as UserRole)
      return
    }
    supabase
      .from('KT_user_roles')
      .select('KT_roles(name)')
      .eq('user_id', session.user.id)
      .then(({ data }) => {
        const roles = (data || []).map((r: any) => r.KT_roles?.name)
        if (roles.includes('Super Admin')) setRoleState('Super Admin')
        else if (roles.includes('Admin')) setRoleState('Admin')
        else if (roles.includes('Teamleitung')) setRoleState('Teamleitung')
        else setRoleState('Crew')
      })
      .then(undefined, () => {})
  }, [session?.user?.id])

  const isAdmin = role === 'Admin' || role === 'Super Admin'
  const isCrew = role === 'Crew'
  const canEdit = !isCrew // Crew hat strikt Nur-Lesen (NICHT bearbeiten oder Löschen)

  async function signIn(login: string, password: string) {
    if (!supabaseConfigured) {
      setDemo(true)
      return null
    }
    if (login.includes('@')) {
      const { error } = await supabase.auth.signInWithPassword({ email: login, password })
      return error?.message || null
    }
    const endpoint = import.meta.env.VITE_USERNAME_LOGIN_URL as string | undefined
    if (!endpoint) return 'Benutzername-Login ist noch nicht serverseitig konfiguriert. Bitte E-Mail verwenden.'
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: login, password }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return body.error || 'Login fehlgeschlagen.'
    if (body.access_token && body.refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      })
      return error?.message || null
    }
    return 'Ungültige Login-Antwort.'
  }

  async function signOut() {
    if (supabaseConfigured) await supabase.auth.signOut()
    else setDemo(true)
  }

  return (
    <C.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        demo,
        role,
        isAdmin,
        isCrew,
        canEdit,
        setRole,
        signIn,
        signOut,
      }}
    >
      {children}
    </C.Provider>
  )
}

export const useAuth = () => {
  const v = useContext(C)
  if (!v) throw new Error('AuthProvider fehlt')
  return v
}

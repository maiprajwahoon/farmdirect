import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export type AppRole = 'farmer' | 'buyer' | null

export type AuthUser = {
  id: string
  email: string
  name: string
  phone?: string
  role: AppRole
  address?: string
  farmName?: string
}

type AuthCtx = {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  role: AppRole
  login: (user: AuthUser, session: Session) => void
  logout: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true,
  role: null, login: () => {}, logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore session + any saved profile
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session
      setSession(s)
      if (s?.user) {
        const saved = localStorage.getItem('fd_profile')
        if (saved) {
          try { setUser(JSON.parse(saved)) } catch {}
        } else {
          setUser(buildUser(s.user, null))
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      if (!s) { setUser(null); localStorage.removeItem('fd_profile') }
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = (u: AuthUser, s: Session) => {
    setUser(u); setSession(s)
    localStorage.setItem('fd_profile', JSON.stringify(u))
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null); setSession(null)
    localStorage.removeItem('fd_profile')
  }

  return (
    <Ctx.Provider value={{ user, session, loading, role: user?.role ?? null, login, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)

function buildUser(u: User, role: AppRole): AuthUser {
  return {
    id: u.id,
    email: u.email ?? '',
    name: u.user_metadata?.name ?? u.email?.split('@')[0] ?? 'User',
    phone: u.user_metadata?.phone,
    role: role ?? (u.user_metadata?.role as AppRole) ?? null,
  }
}

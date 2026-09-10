import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAtivo } from '../lib/supabase.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'rrovos.session'

function lerSessaoLocal() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (supabaseAtivo ? null : lerSessaoLocal()))
  const [carregando, setCarregando] = useState(false)
  const [pronto, setPronto] = useState(!supabaseAtivo)

  // Modo Supabase: hidrata a sessão e escuta mudanças.
  useEffect(() => {
    if (!supabaseAtivo) return
    let vivo = true
    supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return
      setUser(data.session?.user ? mapUser(data.session.user) : null)
      setPronto(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ? mapUser(session.user) : null)
    })
    return () => {
      vivo = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Modo local: espelha a sessão no localStorage.
  useEffect(() => {
    if (supabaseAtivo) return
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const login = async (email, senha) => {
    setCarregando(true)
    try {
      const emailNorm = String(email || '').trim()
      if (supabaseAtivo) {
        const { error } = await supabase.auth.signInWithPassword({ email: emailNorm, password: senha })
        if (error) throw new Error(traduzErro(error.message))
        return
      }
      const okEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@rrovos.com.br'
      const okSenha = import.meta.env.VITE_ADMIN_PASSWORD || 'rrovos123'
      await new Promise((r) => setTimeout(r, 250))
      if (emailNorm.toLowerCase() !== okEmail.toLowerCase() || senha !== okSenha) {
        throw new Error('E-mail ou senha incorretos.')
      }
      setUser({ email: okEmail, role: 'admin', nome: 'Administrador' })
    } finally {
      setCarregando(false)
    }
  }

  const logout = async () => {
    if (supabaseAtivo) await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, carregando, pronto, login, logout, autenticado: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

function mapUser(u) {
  return { id: u.id, email: u.email, role: 'admin', nome: 'Administrador' }
}

function traduzErro(msg = '') {
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.'
  if (/email not confirmed/i.test(msg)) return 'E-mail ainda não confirmado no Supabase.'
  return msg || 'Não foi possível entrar.'
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

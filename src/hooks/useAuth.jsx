import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const SESSION_KEY = 'rrovos.session'

// Fase local: valida contra as variáveis de ambiente e guarda a sessão no
// localStorage. Quando o Supabase for plugado, só o corpo de `login`, `logout`
// e a hidratação inicial mudam — a interface do contexto continua igual.
function lerSessao() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => lerSessao())
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const login = async (email, senha) => {
    setCarregando(true)
    try {
      const okEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@rrovos.com.br'
      const okSenha = import.meta.env.VITE_ADMIN_PASSWORD || 'rrovos123'
      await new Promise((r) => setTimeout(r, 250)) // simula latência de rede
      const emailNorm = String(email || '').trim().toLowerCase()
      if (emailNorm !== okEmail.toLowerCase() || senha !== okSenha) {
        throw new Error('E-mail ou senha incorretos.')
      }
      setUser({ email: okEmail, role: 'admin', nome: 'Administrador' })
    } finally {
      setCarregando(false)
    }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, carregando, login, logout, autenticado: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}

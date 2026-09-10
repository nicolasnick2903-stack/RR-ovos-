import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Login() {
  const { login, carregando, autenticado } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState('')

  if (autenticado) return <Navigate to="/" replace />

  const entrar = async (e) => {
    e.preventDefault()
    setErro('')
    try {
      await login(email, senha)
      navigate('/', { replace: true })
    } catch (err) {
      setErro(err.message || 'Não foi possível entrar.')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-preto px-6 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={108} chip />
          <h1 className="mt-4 text-2xl font-extrabold text-white">R&amp;R Ovos Caipiras</h1>
          <p className="mt-1 text-sm font-medium text-dourado">Qualidade direto do campo</p>
        </div>

        <form onSubmit={entrar} className="rounded-2xl bg-white p-5 shadow-float">
          <h2 className="mb-4 text-base font-bold text-preto">Entrar</h2>

          <div className="mb-3">
            <label className="label">E-mail ou usuário</label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="admin@rrovos.com.br"
            />
          </div>

          <div className="mb-4">
            <label className="label">Senha</label>
            <div className="relative">
              <input
                type={verSenha ? 'text' : 'password'}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field pr-11"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setVerSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-preto/40"
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {erro && <p className="mb-3 text-sm font-medium text-alerta">{erro}</p>}

          <button type="submit" disabled={carregando} className="btn-primary">
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/40">
          Acesso restrito ao administrador da R&amp;R Ovos Caipiras.
        </p>
      </div>
    </div>
  )
}

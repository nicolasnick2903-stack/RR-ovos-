import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Egg, ClipboardList, BarChart3, Settings, LogOut, RefreshCw } from 'lucide-react'
import { forcarAtualizacao } from '../utils/pwaUpdate.js'
import Logo from './Logo.jsx'
import { useAuth } from '../hooks/useAuth.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', Icon: Users },
  { to: '/novo-pedido', label: 'Novo Pedido', Icon: Egg },
  { to: '/pedidos', label: 'Pedidos', Icon: ClipboardList },
  { to: '/relatorios', label: 'Relatórios', Icon: BarChart3 },
  { to: '/configuracoes', label: 'Configurações', Icon: Settings },
]

export default function AppLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const sair = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col md:flex-row">
      {/* Sidebar — desktop/tablet */}
      <aside className="hidden shrink-0 flex-col gap-1 border-r border-black/5 bg-white p-4 md:flex md:w-60">
        <div className="mb-4 flex items-center gap-2.5 px-2">
          <Logo size={40} />
          <div>
            <p className="text-sm font-extrabold leading-tight text-preto">R&amp;R Ovos</p>
            <p className="text-[11px] text-dourado-600">Qualidade direto do campo</p>
          </div>
        </div>
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-preto text-white' : 'text-preto/70 hover:bg-black/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={sair}
          className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-alerta hover:bg-alerta/5"
        >
          <LogOut size={18} />
          Sair
        </button>
      </aside>

      {/* Header — mobile */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/5 bg-preto px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <div>
            <p className="text-sm font-extrabold leading-tight text-white">R&amp;R Ovos Caipiras</p>
            <p className="text-[10px] text-dourado">Qualidade direto do campo</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={forcarAtualizacao} aria-label="Atualizar app" className="p-1.5 text-white/80">
            <RefreshCw size={18} />
          </button>
          <NavLink to="/configuracoes" aria-label="Configurações" className="p-1.5 text-white/80">
            <Settings size={18} />
          </NavLink>
          <button onClick={sair} aria-label="Sair" className="p-1.5 text-white/80">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-10 md:pt-8">
        <Outlet />
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-black/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.filter((n) => n.to !== '/configuracoes').map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-dourado-600' : 'text-preto/45'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

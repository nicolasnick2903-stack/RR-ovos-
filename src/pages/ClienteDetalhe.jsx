import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, CalendarDays, Plus } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { obterCliente } from '../services/clientes.js'
import { rotuloPagamento } from '../services/pedidos.js'
import { formatBRL, formatData, formatTelefone } from '../utils/format.js'

export default function ClienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    obterCliente(id)
      .then((c) => {
        if (!c) navigate('/clientes', { replace: true })
        else setCliente(c)
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <p className="py-10 text-center text-sm text-preto/40">Carregando...</p>
  if (!cliente) return null

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/clientes')} className="flex items-center gap-1.5 text-sm font-semibold text-preto/60">
        <ArrowLeft size={16} /> Clientes
      </button>

      <div className="card">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dourado/15 text-xl font-extrabold text-dourado-600">
            {cliente.nome.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-preto">{cliente.nome}</h1>
            <p className="text-xs text-preto/50">Cliente desde {formatData(cliente.data_cadastro)}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-preto/70">
          <p className="flex items-center gap-2"><Phone size={15} className="text-preto/40" /> {formatTelefone(cliente.telefone)}</p>
          <p className="flex items-center gap-2"><MapPin size={15} className="text-preto/40" /> {cliente.endereco}</p>
          <p className="flex items-center gap-2"><CalendarDays size={15} className="text-preto/40" /> Cadastro em {formatData(cliente.data_cadastro)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🛒" label="Pedidos" valor={cliente.total_pedidos} />
        <StatCard emoji="🥚" label="Ovos" valor={cliente.total_ovos} />
        <StatCard emoji="💰" label="Total gasto" valor={formatBRL(cliente.total_gasto)} cor="text-campo" />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-preto/50">Histórico de pedidos</h2>
        {cliente.pedidos.length === 0 ? (
          <EmptyState
            emoji="📋"
            titulo="Sem pedidos ainda"
            acao={
              <Link to="/novo-pedido" className="btn-primary flex items-center justify-center gap-2">
                <Plus size={18} /> Novo pedido
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {cliente.pedidos.map((p) => (
              <Link key={p.id} to={`/pedidos?pedido=${p.id}`} className="card flex items-center justify-between p-3.5">
                <div>
                  <p className="font-bold text-preto">{p.quantidade_ovos} ovos</p>
                  <p className="text-xs text-preto/50">{formatData(p.data_pedido)} · {rotuloPagamento(p)}</p>
                </div>
                <p className="font-extrabold text-campo">{formatBRL(p.valor_total)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

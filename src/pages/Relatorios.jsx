import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../components/StatCard.jsx'
import PeriodoFiltro from '../components/PeriodoFiltro.jsx'
import { listarPedidos, chavePagamento } from '../services/pedidos.js'
import { formatBRL, formatData, hojeISO } from '../utils/format.js'
import { intervaloPreset, diasEntre } from '../utils/periodo.js'

const PAGAMENTOS = [
  { chave: 'dinheiro', label: 'Dinheiro', cor: '#2e7d32' },
  { chave: 'pix', label: 'PIX', cor: '#f4b91a' },
  { chave: 'cartao_credito', label: 'Cartão Crédito', cor: '#1976d2' },
  { chave: 'cartao_debito', label: 'Cartão Débito', cor: '#d32f2f' },
]

const ORDENS = [
  { id: 'ovos', label: 'Mais ovos' },
  { id: 'valor', label: 'Maior valor' },
  { id: 'pedidos', label: 'Mais pedidos' },
]

export default function Relatorios() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState({ preset: 'mes', de: hojeISO(), ate: hojeISO() })
  const [ordem, setOrdem] = useState('valor')

  useEffect(() => {
    listarPedidos().then(setTodos).finally(() => setLoading(false))
  }, [])

  const { de, ate } = intervaloPreset(periodo.preset, periodo)

  const pedidos = useMemo(
    () => todos.filter((p) => p.data_pedido >= de && p.data_pedido <= ate),
    [todos, de, ate],
  )

  const totalOvos = pedidos.reduce((s, p) => s + Number(p.quantidade_ovos), 0)
  const totalValor = pedidos.reduce((s, p) => s + Number(p.valor_total), 0)

  const porPagamento = PAGAMENTOS.map((f) => {
    const doTipo = pedidos.filter((p) => chavePagamento(p) === f.chave)
    return {
      ...f,
      pedidos: doTipo.length,
      valor: doTipo.reduce((s, p) => s + Number(p.valor_total), 0),
    }
  })

  const porCliente = useMemo(() => {
    const mapa = {}
    pedidos.forEach((p) => {
      const k = p.cliente_id
      if (!mapa[k]) mapa[k] = { nome: p.cliente_nome, pedidos: 0, ovos: 0, valor: 0 }
      mapa[k].pedidos += 1
      mapa[k].ovos += Number(p.quantidade_ovos)
      mapa[k].valor += Number(p.valor_total)
    })
    return Object.values(mapa).sort((a, b) => b[ordem] - a[ordem])
  }, [pedidos, ordem])

  const porDia = useMemo(() => {
    return diasEntre(de, ate).map((dia) => {
      const doDia = pedidos.filter((p) => p.data_pedido === dia)
      return {
        label: dia.slice(8, 10) + '/' + dia.slice(5, 7),
        faturamento: doDia.reduce((s, p) => s + Number(p.valor_total), 0),
        ovos: doDia.reduce((s, p) => s + Number(p.quantidade_ovos), 0),
      }
    })
  }, [pedidos, de, ate])

  const pizza = porPagamento.filter((f) => f.valor > 0)

  if (loading) return <p className="py-10 text-center text-sm text-preto/40">Carregando...</p>

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-preto">Relatórios</h1>
        <p className="text-sm text-preto/50">{formatData(de)} a {formatData(ate)}</p>
      </div>

      <PeriodoFiltro value={periodo} onChange={setPeriodo} />

      <div className="grid grid-cols-3 gap-3">
        <StatCard emoji="🥚" label="Ovos vendidos" valor={totalOvos} />
        <StatCard emoji="💰" label="Total de vendas" valor={formatBRL(totalValor)} cor="text-campo" />
        <StatCard emoji="🛒" label="Pedidos" valor={pedidos.length} />
      </div>

      {/* Vendas por forma de pagamento */}
      <div className="card">
        <h2 className="mb-3 text-sm font-bold text-preto">Vendas por forma de pagamento</h2>
        <div className="space-y-2.5">
          {porPagamento.map((f) => (
            <div key={f.chave} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: f.cor }} />
                <span className="text-sm font-semibold text-preto">{f.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-preto">{formatBRL(f.valor)}</p>
                <p className="text-[11px] text-preto/45">{f.pedidos} pedido(s)</p>
              </div>
            </div>
          ))}
        </div>

        {pizza.length > 0 && (
          <div className="mt-4" style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pizza} dataKey="valor" nameKey="label" innerRadius={45} outerRadius={78} paddingAngle={2}>
                  {pizza.map((f) => <Cell key={f.chave} fill={f.cor} />)}
                </Pie>
                <Tooltip formatter={(v) => formatBRL(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Faturamento por dia */}
      <ChartCard titulo="Faturamento por dia" vazio={porDia.every((d) => d.faturamento === 0)}>
        <BarChart data={porDia} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip formatter={(v) => formatBRL(v)} labelFormatter={(l) => `Dia ${l}`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Bar dataKey="faturamento" fill="#2e7d32" radius={[5, 5, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ChartCard>

      {/* Ovos por dia */}
      <ChartCard titulo="Quantidade de ovos por dia" vazio={porDia.every((d) => d.ovos === 0)}>
        <BarChart data={porDia} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip formatter={(v) => `${v} ovos`} labelFormatter={(l) => `Dia ${l}`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
          <Bar dataKey="ovos" fill="#f4b91a" radius={[5, 5, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ChartCard>

      {/* Por cliente */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-preto">Por cliente</h2>
          <div className="flex rounded-full bg-black/5 p-0.5 text-[11px] font-semibold">
            {ORDENS.map((o) => (
              <button
                key={o.id}
                onClick={() => setOrdem(o.id)}
                className={`rounded-full px-2.5 py-1 ${ordem === o.id ? 'bg-preto text-white' : 'text-preto/60'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {porCliente.length === 0 ? (
          <p className="py-6 text-center text-sm text-preto/40">Sem vendas nesse período.</p>
        ) : (
          <div className="space-y-2">
            {porCliente.map((c, i) => (
              <div key={i} className="flex items-center justify-between border-b border-black/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <p className="font-semibold text-preto">{c.nome}</p>
                  <p className="text-[11px] text-preto/45">{c.pedidos} pedido(s) · {c.ovos} ovos</p>
                </div>
                <p className="font-bold text-campo">{formatBRL(c.valor)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ titulo, vazio, children }) {
  return (
    <div className="card">
      <h2 className="mb-2 text-sm font-bold text-preto">{titulo}</h2>
      {vazio ? (
        <p className="py-10 text-center text-sm text-preto/40">Sem dados nesse período.</p>
      ) : (
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Egg, Plus } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import PeriodoFiltro from '../components/PeriodoFiltro.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { listarPedidos } from '../services/pedidos.js'
import { formatBRL, formatData, hojeISO } from '../utils/format.js'
import { intervaloPreset, diasEntre } from '../utils/periodo.js'

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState({ preset: '7dias', de: hojeISO(), ate: hojeISO() })
  const [metrica, setMetrica] = useState('faturamento') // 'faturamento' | 'ovos'

  useEffect(() => {
    listarPedidos().then(setPedidos).finally(() => setLoading(false))
  }, [])

  const hoje = hojeISO()
  const inicioMes = hoje.slice(0, 7) + '-01'

  const doDia = pedidos.filter((p) => p.data_pedido === hoje)
  const doMes = pedidos.filter((p) => p.data_pedido >= inicioMes && p.data_pedido <= hoje)

  const soma = (arr, campo) => arr.reduce((s, p) => s + Number(p[campo]), 0)

  const { de, ate } = intervaloPreset(periodo.preset, periodo)
  const grafico = useMemo(() => {
    const dias = diasEntre(de, ate)
    return dias.map((dia) => {
      const doDiaX = pedidos.filter((p) => p.data_pedido === dia)
      return {
        dia,
        label: dia.slice(8, 10) + '/' + dia.slice(5, 7),
        faturamento: soma(doDiaX, 'valor_total'),
        ovos: soma(doDiaX, 'quantidade_ovos'),
      }
    })
  }, [pedidos, de, ate])

  const totalPeriodo = grafico.reduce((s, g) => s + g[metrica], 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-extrabold text-preto">Dashboard</h1>
        <p className="text-sm text-preto/50">Resumo das vendas de ovos</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard emoji="🥚" label="Ovos hoje" valor={soma(doDia, 'quantidade_ovos')} />
        <StatCard emoji="💰" label="Vendas de hoje" valor={formatBRL(soma(doDia, 'valor_total'))} cor="text-campo" />
        <StatCard emoji="🛒" label="Pedidos hoje" valor={doDia.length} />
        <StatCard emoji="📅" label="Pedidos no mês" valor={doMes.length} />
        <StatCard emoji="🥚" label="Ovos no mês" valor={soma(doMes, 'quantidade_ovos')} />
        <StatCard emoji="💰" label="Faturamento do mês" valor={formatBRL(soma(doMes, 'valor_total'))} cor="text-campo" />
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-preto">Vendas por dia</h2>
          <div className="flex rounded-full bg-black/5 p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setMetrica('faturamento')}
              className={`rounded-full px-2.5 py-1 ${metrica === 'faturamento' ? 'bg-preto text-white' : 'text-preto/60'}`}
            >
              R$
            </button>
            <button
              onClick={() => setMetrica('ovos')}
              className={`rounded-full px-2.5 py-1 ${metrica === 'ovos' ? 'bg-preto text-white' : 'text-preto/60'}`}
            >
              Ovos
            </button>
          </div>
        </div>

        <PeriodoFiltro value={periodo} onChange={setPeriodo} className="mb-3" />

        <p className="mb-2 text-xs text-preto/50">
          {formatData(de)} a {formatData(ate)} ·{' '}
          <span className="font-bold text-preto">
            {metrica === 'faturamento' ? formatBRL(totalPeriodo) : `${totalPeriodo} ovos`}
          </span>
        </p>

        {loading ? (
          <p className="py-10 text-center text-sm text-preto/40">Carregando...</p>
        ) : grafico.every((g) => g[metrica] === 0) ? (
          <p className="py-10 text-center text-sm text-preto/40">Nenhuma venda nesse período.</p>
        ) : (
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={grafico} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(0,0,0,0.45)' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  formatter={(v) => (metrica === 'faturamento' ? formatBRL(v) : `${v} ovos`)}
                  labelFormatter={(l) => `Dia ${l}`}
                  contentStyle={{ borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Bar
                  dataKey={metrica}
                  fill={metrica === 'faturamento' ? '#2e7d32' : '#f4b91a'}
                  radius={[5, 5, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {!loading && pedidos.length === 0 && (
        <EmptyState
          emoji="🥚"
          titulo="Nenhum pedido ainda"
          descricao="Cadastre um cliente e registre a primeira venda."
          acao={
            <Link to="/novo-pedido" className="btn-primary flex items-center justify-center gap-2">
              <Plus size={18} /> Novo pedido
            </Link>
          }
        />
      )}

      <Link
        to="/novo-pedido"
        className="fixed bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-dourado shadow-float active:scale-95 md:hidden"
        aria-label="Novo pedido"
      >
        <Egg size={26} className="text-preto" />
      </Link>
    </div>
  )
}

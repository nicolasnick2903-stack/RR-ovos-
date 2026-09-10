import { useEffect, useMemo, useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PeriodoFiltro from '../components/PeriodoFiltro.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { saldoEstoque, listarMovimentos, registrarMovimento, excluirMovimento } from '../services/estoque.js'
import { formatData, hojeISO } from '../utils/format.js'
import { intervaloPreset } from '../utils/periodo.js'

export default function Estoque() {
  const toast = useToast()
  const [saldo, setSaldo] = useState(0)
  const [movimentos, setMovimentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState({ preset: 'mes', de: hojeISO(), ate: hojeISO() })
  const [form, setForm] = useState(null) // null | 'entrada' | 'saida'
  const [excluir, setExcluir] = useState(null)
  const [processando, setProcessando] = useState(false)

  const { de, ate } = intervaloPreset(periodo.preset, periodo)

  const carregar = async () => {
    setLoading(true)
    try {
      const [s, m] = await Promise.all([saldoEstoque(), listarMovimentos({ de, ate })])
      setSaldo(s)
      setMovimentos(m)
    } catch (err) {
      toast.erro(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [de, ate]) // eslint-disable-line

  const totais = useMemo(() => ({
    entrada: movimentos.filter((m) => m.tipo === 'entrada').reduce((s, m) => s + Number(m.quantidade), 0),
    saida: movimentos.filter((m) => m.tipo === 'saida').reduce((s, m) => s + Number(m.quantidade), 0),
  }), [movimentos])

  const corSaldo = saldo <= 0 ? 'text-alerta' : saldo < 60 ? 'text-dourado-600' : 'text-campo'

  const confirmarExclusao = async () => {
    setProcessando(true)
    try {
      await excluirMovimento(excluir.id)
      toast.sucesso('Movimento excluído.')
      setExcluir(null)
      carregar()
    } catch (err) {
      toast.erro(err.message)
      setExcluir(null)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-preto">Estoque</h1>
        <p className="text-sm text-preto/50">Controle de ovos disponíveis</p>
      </div>

      <div className="card">
        <p className="text-xs font-medium text-preto/50">🥚 Ovos em estoque</p>
        <p className={`mt-1 text-4xl font-extrabold ${corSaldo}`}>{loading ? '—' : saldo}</p>
        {saldo <= 0 && !loading && (
          <p className="mt-1 text-xs font-semibold text-alerta">Estoque zerado ou negativo — registre uma entrada.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setForm('entrada')} className="btn-primary flex items-center justify-center gap-2">
          <ArrowUpCircle size={18} /> Entrada
        </button>
        <button onClick={() => setForm('saida')} className="btn-ghost flex items-center justify-center gap-2">
          <ArrowDownCircle size={18} /> Saída / perda
        </button>
      </div>

      <PeriodoFiltro value={periodo} onChange={setPeriodo} />

      <p className="text-xs text-preto/50">
        {formatData(de)} a {formatData(ate)} · entradas <span className="font-bold text-campo">+{totais.entrada}</span> · saídas{' '}
        <span className="font-bold text-alerta">−{totais.saida}</span>
      </p>

      {loading ? (
        <p className="py-10 text-center text-sm text-preto/40">Carregando...</p>
      ) : movimentos.length === 0 ? (
        <EmptyState emoji="📦" titulo="Sem movimentos nesse período" descricao="Registre uma entrada ou mude o filtro." />
      ) : (
        <div className="space-y-2">
          {movimentos.map((m) => (
            <div key={m.id} className="card flex items-center gap-3 p-3.5">
              {m.tipo === 'entrada' ? (
                <ArrowUpCircle size={22} className="shrink-0 text-campo" />
              ) : (
                <ArrowDownCircle size={22} className="shrink-0 text-alerta" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-preto">
                  {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  {m.pedido_id && m.cliente_nome ? ` · ${m.cliente_nome}` : ''}
                </p>
                <p className="truncate text-xs text-preto/50">
                  {formatData(m.data)}{m.motivo ? ` · ${m.motivo}` : ''}
                </p>
              </div>
              <p className={`shrink-0 font-extrabold ${m.tipo === 'entrada' ? 'text-campo' : 'text-alerta'}`}>
                {m.tipo === 'entrada' ? '+' : '−'}{m.quantidade}
              </p>
              {!m.pedido_id && (
                <button onClick={() => setExcluir(m)} aria-label="Excluir" className="p-1.5 text-alerta">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal aberto={!!form} titulo={form === 'entrada' ? 'Registrar entrada' : 'Registrar saída / perda'} onFechar={() => setForm(null)}>
        {form && (
          <MovimentoForm
            tipo={form}
            onSalvar={async (dados) => {
              await registrarMovimento({ ...dados, tipo: form })
              toast.sucesso(form === 'entrada' ? 'Entrada registrada!' : 'Saída registrada!')
              setForm(null)
              carregar()
            }}
            onCancelar={() => setForm(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir movimento"
        mensagem="Tem certeza que deseja excluir este movimento de estoque?"
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
        processando={processando}
      />
    </div>
  )
}

function MovimentoForm({ tipo, onSalvar, onCancelar }) {
  const [quantidade, setQuantidade] = useState('')
  const [data, setData] = useState(hojeISO())
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onSalvar({ quantidade, data, motivo })
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="label">Quantidade de ovos *</label>
          <input
            type="number" min="1" step="1" inputMode="numeric" autoFocus
            value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
            className="input-field" placeholder="60"
          />
        </div>
        <div className="w-40">
          <label className="label">Data *</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input-field" />
        </div>
      </div>
      <div>
        <label className="label">Motivo (opcional)</label>
        <input
          value={motivo} onChange={(e) => setMotivo(e.target.value)} className="input-field"
          placeholder={tipo === 'entrada' ? 'Ex: coleta do dia, compra' : 'Ex: quebra, consumo próprio'}
        />
      </div>
      {erro && <p className="text-sm font-medium text-alerta">{erro}</p>}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancelar} className="btn-ghost">Cancelar</button>
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

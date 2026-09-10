import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import PedidoForm from '../components/PedidoForm.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../hooks/useToast.jsx'
import {
  listarPedidos, atualizarPedido, excluirPedido, rotuloPagamento,
} from '../services/pedidos.js'
import { listarClientes } from '../services/clientes.js'
import { formatBRL, formatData } from '../utils/format.js'

const OPCOES_PAGAMENTO = [
  { id: 'todos', label: 'Todos' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'pix', label: 'PIX' },
  { id: 'cartao_credito', label: 'Cartão Crédito' },
  { id: 'cartao_debito', label: 'Cartão Débito' },
]

const FILTRO_VAZIO = { de: '', ate: '', clienteId: '', pagamento: 'todos' }

export default function Pedidos() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [pedidos, setPedidos] = useState([])
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [rascunho, setRascunho] = useState(FILTRO_VAZIO)
  const [filtros, setFiltros] = useState(FILTRO_VAZIO)
  const [detalhe, setDetalhe] = useState(null)
  const [editar, setEditar] = useState(null)
  const [excluir, setExcluir] = useState(null)
  const [processando, setProcessando] = useState(false)

  const carregar = () => {
    setLoading(true)
    listarPedidos(filtros).then(setPedidos).finally(() => setLoading(false))
  }

  useEffect(() => { listarClientes().then(setClientes) }, [])
  useEffect(carregar, [filtros])

  // Abre direto um pedido se veio ?pedido=<id> (link do histórico do cliente).
  useEffect(() => {
    const id = searchParams.get('pedido')
    if (!id) return
    listarPedidos().then((todos) => {
      const p = todos.find((x) => x.id === id)
      if (p) setDetalhe(p)
      searchParams.delete('pedido')
      setSearchParams(searchParams, { replace: true })
    })
  }, []) // eslint-disable-line

  const filtroAtivo = useMemo(
    () => JSON.stringify(filtros) !== JSON.stringify(FILTRO_VAZIO),
    [filtros],
  )

  const totais = useMemo(() => ({
    pedidos: pedidos.length,
    ovos: pedidos.reduce((s, p) => s + Number(p.quantidade_ovos), 0),
    valor: pedidos.reduce((s, p) => s + Number(p.valor_total), 0),
  }), [pedidos])

  const aplicar = () => {
    setFiltros(rascunho)
    setMostrarFiltros(false)
  }
  const limpar = () => {
    setRascunho(FILTRO_VAZIO)
    setFiltros(FILTRO_VAZIO)
  }

  const salvarEdicao = async (dados) => {
    await atualizarPedido(editar.id, dados)
    toast.sucesso('Pedido atualizado!')
    setEditar(null)
    carregar()
  }

  const confirmarExclusao = async () => {
    setProcessando(true)
    try {
      await excluirPedido(excluir.id)
      toast.sucesso('Pedido excluído.')
      setExcluir(null)
      carregar()
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-preto">Pedidos</h1>
          <p className="text-sm text-preto/50">
            {totais.pedidos} pedido(s) · {totais.ovos} ovos · {formatBRL(totais.valor)}
          </p>
        </div>
        <button
          onClick={() => { setRascunho(filtros); setMostrarFiltros((v) => !v) }}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold active:scale-95 ${
            filtroAtivo ? 'border-preto bg-preto text-white' : 'border-black/10 bg-white text-preto'
          }`}
        >
          <Filter size={16} /> Filtros
        </button>
      </div>

      {mostrarFiltros && (
        <div className="card space-y-3 animate-fadeInUp">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Data inicial</label>
              <input type="date" value={rascunho.de} onChange={(e) => setRascunho({ ...rascunho, de: e.target.value })} className="input-field" />
            </div>
            <div className="flex-1">
              <label className="label">Data final</label>
              <input type="date" value={rascunho.ate} onChange={(e) => setRascunho({ ...rascunho, ate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Cliente</label>
            <select value={rascunho.clienteId} onChange={(e) => setRascunho({ ...rascunho, clienteId: e.target.value })} className="input-field">
              <option value="">Todos</option>
              {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Forma de pagamento</label>
            <select value={rascunho.pagamento} onChange={(e) => setRascunho({ ...rascunho, pagamento: e.target.value })} className="input-field">
              {OPCOES_PAGAMENTO.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={limpar} className="btn-ghost">Limpar filtros</button>
            <button onClick={aplicar} className="btn-primary">Filtrar</button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-preto/40">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <EmptyState emoji="📋" titulo="Nenhum pedido" descricao={filtroAtivo ? 'Ajuste os filtros.' : 'Registre a primeira venda em "Novo Pedido".'} />
      ) : (
        <div className="space-y-2.5">
          {pedidos.map((p) => (
            <div key={p.id} className="card flex items-center gap-3 p-3.5">
              <button onClick={() => setDetalhe(p)} className="flex-1 text-left">
                <p className="font-bold text-preto">{p.cliente_nome}</p>
                <p className="text-xs text-preto/50">
                  {formatData(p.data_pedido)} · {p.quantidade_ovos} ovos · {rotuloPagamento(p)}
                </p>
              </button>
              <p className="shrink-0 font-extrabold text-campo">{formatBRL(p.valor_total)}</p>
              <button onClick={() => setEditar(p)} aria-label="Editar" className="p-1.5 text-preto/40"><Pencil size={16} /></button>
              <button onClick={() => setExcluir(p)} aria-label="Excluir" className="p-1.5 text-alerta"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      {/* Detalhe */}
      <Modal aberto={!!detalhe} titulo="Detalhes do pedido" onFechar={() => setDetalhe(null)}>
        {detalhe && (
          <div className="space-y-3">
            <dl className="space-y-2 text-sm">
              <Linha rotulo="Cliente" valor={detalhe.cliente_nome} />
              <Linha rotulo="Data" valor={formatData(detalhe.data_pedido)} />
              <Linha rotulo="Quantidade" valor={`${detalhe.quantidade_ovos} ovos`} />
              <Linha rotulo="Valor unitário" valor={formatBRL(detalhe.valor_unitario)} />
              <Linha rotulo="Pagamento" valor={rotuloPagamento(detalhe)} />
              <div className="flex justify-between border-t border-black/5 pt-2">
                <dt className="font-bold text-preto">Total</dt>
                <dd className="font-extrabold text-campo">{formatBRL(detalhe.valor_total)}</dd>
              </div>
            </dl>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setEditar(detalhe); setDetalhe(null) }} className="btn-ghost flex items-center justify-center gap-1.5">
                <Pencil size={15} /> Editar
              </button>
              <button onClick={() => { setExcluir(detalhe); setDetalhe(null) }} className="btn-danger flex items-center justify-center gap-1.5">
                <Trash2 size={15} /> Excluir
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Editar */}
      <Modal aberto={!!editar} titulo="Editar pedido" onFechar={() => setEditar(null)}>
        {editar && (
          <PedidoForm inicial={editar} onSubmit={salvarEdicao} onCancelar={() => setEditar(null)} textoBotao="Salvar alterações" />
        )}
      </Modal>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir pedido"
        mensagem="Tem certeza que deseja excluir este pedido?"
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
        processando={processando}
      />
    </div>
  )
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-preto/55">{rotulo}</dt>
      <dd className="text-right font-semibold text-preto">{valor}</dd>
    </div>
  )
}

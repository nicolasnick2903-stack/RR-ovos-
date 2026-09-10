import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ClienteForm from '../components/ClienteForm.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { listarClientes, criarCliente, atualizarCliente, excluirCliente } from '../services/clientes.js'
import { formatTelefone } from '../utils/format.js'

export default function Clientes() {
  const navigate = useNavigate()
  const toast = useToast()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState(null) // null | { modo:'novo' } | { modo:'editar', cliente }
  const [excluir, setExcluir] = useState(null)
  const [processando, setProcessando] = useState(false)

  const carregar = () => {
    setLoading(true)
    listarClientes({ busca }).then(setClientes).finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(carregar, 150)
    return () => clearTimeout(t)
  }, [busca])

  const salvar = async (dados) => {
    if (form.modo === 'novo') {
      await criarCliente(dados)
      toast.sucesso('Cliente cadastrado!')
    } else {
      await atualizarCliente(form.cliente.id, dados)
      toast.sucesso('Cliente atualizado!')
    }
    setForm(null)
    carregar()
  }

  const confirmarExclusao = async () => {
    setProcessando(true)
    try {
      await excluirCliente(excluir.id)
      toast.sucesso('Cliente excluído.')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-preto">Clientes</h1>
          <p className="text-sm text-preto/50">{clientes.length} cadastrado(s)</p>
        </div>
        <button
          onClick={() => setForm({ modo: 'novo' })}
          className="flex items-center gap-1.5 rounded-xl bg-dourado px-3 py-2 text-sm font-bold text-preto shadow-card active:scale-95"
        >
          <Plus size={16} /> Novo
        </button>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-preto/35" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por nome ou telefone"
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-preto/40">Carregando...</p>
      ) : clientes.length === 0 ? (
        <EmptyState
          emoji="👥"
          titulo={busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          descricao={busca ? 'Tente outro nome ou telefone.' : 'Toque em "Novo" para cadastrar o primeiro.'}
        />
      ) : (
        <div className="space-y-2.5">
          {clientes.map((c) => (
            <div key={c.id} className="card flex items-center gap-3 p-3.5">
              <button
                onClick={() => navigate(`/clientes/${c.id}`)}
                className="flex flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dourado/15 text-base font-extrabold text-dourado-600">
                  {c.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-preto">{c.nome}</p>
                  <p className="truncate text-xs text-preto/50">
                    {formatTelefone(c.telefone)} · {c.total_pedidos} pedido(s)
                  </p>
                </div>
              </button>
              <button onClick={() => setForm({ modo: 'editar', cliente: c })} aria-label="Editar" className="p-1.5 text-preto/40">
                <Pencil size={16} />
              </button>
              <button onClick={() => setExcluir(c)} aria-label="Excluir" className="p-1.5 text-alerta">
                <Trash2 size={16} />
              </button>
              <ChevronRight size={16} className="text-preto/25" />
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={!!form}
        titulo={form?.modo === 'editar' ? 'Editar cliente' : 'Novo cliente'}
        onFechar={() => setForm(null)}
      >
        {form && (
          <ClienteForm inicial={form.cliente} onSalvar={salvar} onCancelar={() => setForm(null)} />
        )}
      </Modal>

      <ConfirmDialog
        aberto={!!excluir}
        titulo="Excluir cliente"
        mensagem={`Tem certeza que deseja excluir "${excluir?.nome}"?`}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluir(null)}
        processando={processando}
      />
    </div>
  )
}

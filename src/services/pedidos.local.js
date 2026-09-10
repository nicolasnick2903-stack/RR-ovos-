import { readAll, writeAll, novoId, agora } from './localStore.js'
import { normalizarPedido, chavePagamento } from './pedidos.shared.js'

const COL = 'pedidos'

export async function listarPedidos(filtros = {}) {
  const clientes = readAll('clientes')
  let arr = readAll(COL).map((p) => ({
    ...p,
    cliente_nome: clientes.find((c) => c.id === p.cliente_id)?.nome || 'Cliente removido',
  }))

  const { de, ate, clienteId, pagamento } = filtros
  if (de) arr = arr.filter((p) => p.data_pedido >= de)
  if (ate) arr = arr.filter((p) => p.data_pedido <= ate)
  if (clienteId) arr = arr.filter((p) => p.cliente_id === clienteId)
  if (pagamento && pagamento !== 'todos') arr = arr.filter((p) => chavePagamento(p) === pagamento)

  return arr.sort((a, b) => {
    if (b.data_pedido !== a.data_pedido) return b.data_pedido.localeCompare(a.data_pedido)
    return (b.created_at || '').localeCompare(a.created_at || '')
  })
}

export async function obterPedido(id) {
  const clientes = readAll('clientes')
  const p = readAll(COL).find((x) => x.id === id)
  if (!p) return null
  return { ...p, cliente_nome: clientes.find((c) => c.id === p.cliente_id)?.nome || 'Cliente removido' }
}

export async function criarPedido(dados) {
  const limpo = normalizarPedido(dados)
  const arr = readAll(COL)
  const novo = { id: novoId(), created_at: agora(), updated_at: agora(), ...limpo }
  writeAll(COL, [...arr, novo])
  return novo
}

export async function atualizarPedido(id, dados) {
  const limpo = normalizarPedido(dados)
  const arr = readAll(COL)
  const idx = arr.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error('Pedido não encontrado.')
  arr[idx] = { ...arr[idx], ...limpo, updated_at: agora() }
  writeAll(COL, arr)
  return arr[idx]
}

export async function excluirPedido(id) {
  writeAll(COL, readAll(COL).filter((p) => p.id !== id))
}

import { readAll, writeAll, novoId, agora } from './localStore.js'
import { normalizarMovimento, saldoDeMovimentos } from './estoque.shared.js'

const COL = 'estoque_movimentos'

const comNome = (m) => {
  if (!m.pedido_id) return { ...m }
  const clientes = readAll('clientes')
  const pedido = readAll('pedidos').find((p) => p.id === m.pedido_id)
  const nome = pedido ? clientes.find((c) => c.id === pedido.cliente_id)?.nome : null
  return { ...m, cliente_nome: nome || 'Pedido' }
}

export async function saldoEstoque() {
  return saldoDeMovimentos(readAll(COL))
}

export async function listarMovimentos({ de, ate } = {}) {
  let arr = readAll(COL).map(comNome)
  if (de) arr = arr.filter((m) => m.data >= de)
  if (ate) arr = arr.filter((m) => m.data <= ate)
  return arr.sort((a, b) => {
    if (b.data !== a.data) return b.data.localeCompare(a.data)
    return (b.created_at || '').localeCompare(a.created_at || '')
  })
}

export async function registrarMovimento(dados) {
  const limpo = normalizarMovimento(dados)
  const arr = readAll(COL)
  const novo = { id: novoId(), pedido_id: null, created_at: agora(), ...limpo }
  writeAll(COL, [...arr, novo])
  return novo
}

export async function excluirMovimento(id) {
  const arr = readAll(COL)
  const m = arr.find((x) => x.id === id)
  if (m?.pedido_id) throw new Error('Movimento de pedido — edite ou exclua o pedido.')
  writeAll(COL, arr.filter((x) => x.id !== id))
}

// Usado pelo pedidos.local.js para espelhar o gatilho do banco.
export function sincronizarPedidoLocal(op, pedido, anterior) {
  const arr = readAll(COL)
  if (op === 'delete') {
    writeAll(COL, arr.filter((m) => m.pedido_id !== pedido.id))
    return
  }
  const idx = arr.findIndex((m) => m.pedido_id === pedido.id)
  const mov = {
    tipo: 'saida',
    quantidade: pedido.quantidade_ovos,
    motivo: 'Pedido',
    pedido_id: pedido.id,
    data: pedido.data_pedido,
  }
  if (idx === -1) writeAll(COL, [...arr, { id: novoId(), created_at: agora(), ...mov }])
  else {
    arr[idx] = { ...arr[idx], ...mov }
    writeAll(COL, arr)
  }
}

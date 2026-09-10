import { readAll, writeAll, novoId, agora } from './localStore.js'

const COL = 'pedidos'

export const FORMAS = [
  { id: 'dinheiro', label: 'Dinheiro', emoji: '💵' },
  { id: 'pix', label: 'PIX', emoji: '📱' },
  { id: 'cartao', label: 'Cartão', emoji: '💳' },
]

export const TIPOS_CARTAO = [
  { id: 'credito', label: 'Crédito' },
  { id: 'debito', label: 'Débito' },
]

// Rótulo unificado usado em relatórios e listagens.
export function rotuloPagamento(p) {
  if (p.forma_pagamento === 'dinheiro') return 'Dinheiro'
  if (p.forma_pagamento === 'pix') return 'PIX'
  if (p.forma_pagamento === 'cartao') {
    return p.tipo_cartao === 'debito' ? 'Cartão Débito' : 'Cartão Crédito'
  }
  return '—'
}

export function chavePagamento(p) {
  if (p.forma_pagamento === 'cartao') return `cartao_${p.tipo_cartao || 'credito'}`
  return p.forma_pagamento
}

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
  const limpo = validarEnormalizar(dados)
  const arr = readAll(COL)
  const novo = { id: novoId(), created_at: agora(), updated_at: agora(), ...limpo }
  writeAll(COL, [...arr, novo])
  return novo
}

export async function atualizarPedido(id, dados) {
  const limpo = validarEnormalizar(dados)
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

function validarEnormalizar({
  cliente_id,
  data_pedido,
  quantidade_ovos,
  valor_unitario,
  forma_pagamento,
  tipo_cartao,
}) {
  if (!cliente_id) throw new Error('Selecione um cliente.')
  if (!data_pedido) throw new Error('Informe a data do pedido.')

  const qtd = Number(quantidade_ovos)
  if (!Number.isFinite(qtd) || qtd <= 0 || !Number.isInteger(qtd)) {
    throw new Error('A quantidade de ovos deve ser um número inteiro maior que zero.')
  }

  const unit = Number(valor_unitario)
  if (!Number.isFinite(unit) || unit < 0) {
    throw new Error('O valor unitário não pode ser negativo.')
  }

  if (!['dinheiro', 'pix', 'cartao'].includes(forma_pagamento)) {
    throw new Error('Selecione a forma de pagamento.')
  }

  let tipo = null
  if (forma_pagamento === 'cartao') {
    if (!['credito', 'debito'].includes(tipo_cartao)) {
      throw new Error('Selecione o tipo do cartão (Crédito ou Débito).')
    }
    tipo = tipo_cartao
  }

  return {
    cliente_id,
    data_pedido: String(data_pedido).slice(0, 10),
    quantidade_ovos: qtd,
    valor_unitario: Math.round(unit * 100) / 100,
    valor_total: Math.round(qtd * unit * 100) / 100,
    forma_pagamento,
    tipo_cartao: tipo,
  }
}

export const FORMAS = [
  { id: 'dinheiro', label: 'Dinheiro', emoji: '💵' },
  { id: 'pix', label: 'PIX', emoji: '📱' },
  { id: 'cartao', label: 'Cartão', emoji: '💳' },
]

export const TIPOS_CARTAO = [
  { id: 'credito', label: 'Crédito' },
  { id: 'debito', label: 'Débito' },
]

export function rotuloPagamento(p) {
  if (p.forma_pagamento === 'dinheiro') return 'Dinheiro'
  if (p.forma_pagamento === 'pix') return 'PIX'
  if (p.forma_pagamento === 'cartao') return p.tipo_cartao === 'debito' ? 'Cartão Débito' : 'Cartão Crédito'
  return '—'
}

export function chavePagamento(p) {
  if (p.forma_pagamento === 'cartao') return `cartao_${p.tipo_cartao || 'credito'}`
  return p.forma_pagamento
}

// Valida e devolve o objeto pronto pra persistir (ou lança Error).
export function normalizarPedido({
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
  if (!Number.isFinite(unit) || unit < 0) throw new Error('O valor unitário não pode ser negativo.')

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

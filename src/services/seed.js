import { readAll, writeAll, novoId, agora, limparTudo } from './localStore.js'

const NOMES = [
  ['Maria Aparecida', '(11) 98877-1122', 'Rua das Palmeiras, 45 - Centro'],
  ['João Batista', '(11) 99123-4567', 'Sítio Boa Vista, s/n - Zona Rural'],
  ['Ana Clara Souza', '(11) 98456-7890', 'Av. Brasil, 1200 - Jardim América'],
  ['Pedro Henrique', '(11) 97654-3210', 'Rua 7 de Setembro, 88 - Vila Nova'],
  ['Rita de Cássia', '(11) 96543-2109', 'Rua do Campo, 15 - Bairro Alto'],
  ['Padaria Pão Quente', '(11) 3344-5566', 'Av. Central, 500 - Centro'],
]

const FORMAS = ['dinheiro', 'pix', 'pix', 'cartao', 'cartao', 'dinheiro']
const QTDS = [6, 10, 12, 20, 30, 30, 60, 120]

export function temDados() {
  return readAll('clientes').length > 0 || readAll('pedidos').length > 0
}

export function carregarExemplos() {
  const clientes = NOMES.map(([nome, telefone, endereco]) => ({
    id: novoId(),
    nome,
    telefone,
    endereco,
    data_cadastro: agora().slice(0, 10),
    created_at: agora(),
    updated_at: agora(),
  }))

  const pedidos = []
  const hoje = new Date()
  for (let i = 0; i < 55; i++) {
    const dia = new Date(hoje)
    dia.setDate(dia.getDate() - Math.floor(Math.random() * 40))
    const cliente = clientes[Math.floor(Math.random() * clientes.length)]
    const qtd = QTDS[Math.floor(Math.random() * QTDS.length)]
    const unit = [0.8, 1, 1, 1.2, 1.5][Math.floor(Math.random() * 5)]
    const forma = FORMAS[Math.floor(Math.random() * FORMAS.length)]
    const tipo = forma === 'cartao' ? (Math.random() > 0.5 ? 'credito' : 'debito') : null
    pedidos.push({
      id: novoId(),
      cliente_id: cliente.id,
      data_pedido: dia.toISOString().slice(0, 10),
      quantidade_ovos: qtd,
      valor_unitario: unit,
      valor_total: Math.round(qtd * unit * 100) / 100,
      forma_pagamento: forma,
      tipo_cartao: tipo,
      created_at: dia.toISOString(),
      updated_at: dia.toISOString(),
    })
  }

  writeAll('clientes', clientes)
  writeAll('pedidos', pedidos)
}

export function apagarTudo() {
  limparTudo()
}

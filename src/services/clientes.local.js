import { readAll, writeAll, novoId, agora } from './localStore.js'
import { listarPedidos } from './pedidos.js'
import { normalizarCliente, filtrarClientes } from './clientes.shared.js'

const COL = 'clientes'

export async function listarClientes({ busca = '' } = {}) {
  const arr = filtrarClientes(
    readAll(COL).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    busca,
  )
  const pedidos = await listarPedidos()
  return arr.map((c) => ({
    ...c,
    total_pedidos: pedidos.filter((p) => p.cliente_id === c.id).length,
  }))
}

export async function obterCliente(id) {
  const c = readAll(COL).find((x) => x.id === id)
  if (!c) return null
  const pedidos = (await listarPedidos()).filter((p) => p.cliente_id === id)
  return {
    ...c,
    pedidos: pedidos.sort((a, b) => b.data_pedido.localeCompare(a.data_pedido)),
    total_pedidos: pedidos.length,
    total_ovos: pedidos.reduce((s, p) => s + Number(p.quantidade_ovos), 0),
    total_gasto: pedidos.reduce((s, p) => s + Number(p.valor_total), 0),
  }
}

export async function criarCliente(dados) {
  const limpo = normalizarCliente(dados)
  const arr = readAll(COL)
  const novo = {
    id: novoId(),
    ...limpo,
    data_cadastro: agora().slice(0, 10),
    created_at: agora(),
    updated_at: agora(),
  }
  writeAll(COL, [...arr, novo])
  return novo
}

export async function atualizarCliente(id, dados) {
  const limpo = normalizarCliente(dados)
  const arr = readAll(COL)
  const idx = arr.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Cliente não encontrado.')
  arr[idx] = { ...arr[idx], ...limpo, updated_at: agora() }
  writeAll(COL, arr)
  return arr[idx]
}

export async function excluirCliente(id) {
  const pedidos = (await listarPedidos()).filter((p) => p.cliente_id === id)
  if (pedidos.length > 0) {
    throw new Error(`Este cliente tem ${pedidos.length} pedido(s). Exclua os pedidos antes.`)
  }
  writeAll(COL, readAll(COL).filter((c) => c.id !== id))
}

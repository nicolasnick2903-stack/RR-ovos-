import { readAll, writeAll, novoId, agora } from './localStore.js'
import { listarPedidos } from './pedidos.js'
import { soDigitos } from '../utils/format.js'

const COL = 'clientes'

export async function listarClientes({ busca = '' } = {}) {
  let arr = readAll(COL).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const termo = busca.trim().toLowerCase()
  if (termo) {
    const digitos = soDigitos(termo)
    arr = arr.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (digitos && soDigitos(c.telefone).includes(digitos)),
    )
  }
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
  const total_ovos = pedidos.reduce((s, p) => s + Number(p.quantidade_ovos), 0)
  const total_gasto = pedidos.reduce((s, p) => s + Number(p.valor_total), 0)
  return {
    ...c,
    pedidos: pedidos.sort((a, b) => b.data_pedido.localeCompare(a.data_pedido)),
    total_pedidos: pedidos.length,
    total_ovos,
    total_gasto,
  }
}

export async function criarCliente({ nome, endereco, telefone }) {
  validar({ nome, endereco, telefone })
  const arr = readAll(COL)
  const novo = {
    id: novoId(),
    nome: nome.trim(),
    endereco: endereco.trim(),
    telefone: telefone.trim(),
    data_cadastro: agora().slice(0, 10),
    created_at: agora(),
    updated_at: agora(),
  }
  writeAll(COL, [...arr, novo])
  return novo
}

export async function atualizarCliente(id, { nome, endereco, telefone }) {
  validar({ nome, endereco, telefone })
  const arr = readAll(COL)
  const idx = arr.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('Cliente não encontrado.')
  arr[idx] = {
    ...arr[idx],
    nome: nome.trim(),
    endereco: endereco.trim(),
    telefone: telefone.trim(),
    updated_at: agora(),
  }
  writeAll(COL, arr)
  return arr[idx]
}

export async function excluirCliente(id) {
  const pedidos = (await listarPedidos()).filter((p) => p.cliente_id === id)
  if (pedidos.length > 0) {
    throw new Error(
      `Este cliente tem ${pedidos.length} pedido(s). Exclua os pedidos antes de remover o cliente.`,
    )
  }
  writeAll(COL, readAll(COL).filter((c) => c.id !== id))
}

function validar({ nome, endereco, telefone }) {
  if (!nome || !nome.trim()) throw new Error('Informe o nome do cliente.')
  if (!endereco || !endereco.trim()) throw new Error('Informe o endereço.')
  const dig = soDigitos(telefone)
  if (dig.length < 10) throw new Error('Informe um telefone válido com DDD.')
}

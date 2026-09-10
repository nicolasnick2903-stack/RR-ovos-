import { supabase } from '../lib/supabase.js'
import { normalizarCliente, filtrarClientes } from './clientes.shared.js'

const COL = 'clientes'

async function pedidosPorCliente() {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id, cliente_id, quantidade_ovos, valor_total, data_pedido, valor_unitario, forma_pagamento, tipo_cartao, created_at')
  if (error) throw new Error(error.message)
  const mapa = {}
  for (const p of data || []) {
    ;(mapa[p.cliente_id] ||= []).push(p)
  }
  return mapa
}

export async function listarClientes({ busca = '' } = {}) {
  const { data, error } = await supabase.from(COL).select('*').order('nome', { ascending: true })
  if (error) throw new Error(error.message)
  const mapa = await pedidosPorCliente()
  return filtrarClientes(data || [], busca).map((c) => ({
    ...c,
    total_pedidos: (mapa[c.id] || []).length,
  }))
}

export async function obterCliente(id) {
  const { data: c, error } = await supabase.from(COL).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!c) return null
  const { data: pedidos, error: e2 } = await supabase
    .from('pedidos')
    .select('*')
    .eq('cliente_id', id)
    .order('data_pedido', { ascending: false })
  if (e2) throw new Error(e2.message)
  const lista = pedidos || []
  return {
    ...c,
    pedidos: lista,
    total_pedidos: lista.length,
    total_ovos: lista.reduce((s, p) => s + Number(p.quantidade_ovos), 0),
    total_gasto: lista.reduce((s, p) => s + Number(p.valor_total), 0),
  }
}

export async function criarCliente(dados) {
  const limpo = normalizarCliente(dados)
  const { data, error } = await supabase.from(COL).insert(limpo).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function atualizarCliente(id, dados) {
  const limpo = normalizarCliente(dados)
  const { data, error } = await supabase.from(COL).update(limpo).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function excluirCliente(id) {
  const { count, error: e1 } = await supabase
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('cliente_id', id)
  if (e1) throw new Error(e1.message)
  if (count > 0) throw new Error(`Este cliente tem ${count} pedido(s). Exclua os pedidos antes.`)
  const { error } = await supabase.from(COL).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

import { supabase } from '../lib/supabase.js'
import { normalizarPedido, chavePagamento } from './pedidos.shared.js'

const SELECT = '*, cliente:cliente_id ( nome )'

const anexaNome = (p) => ({ ...p, cliente_nome: p.cliente?.nome || 'Cliente removido' })

export async function listarPedidos(filtros = {}) {
  let q = supabase.from('pedidos').select(SELECT)
  const { de, ate, clienteId, pagamento } = filtros
  if (de) q = q.gte('data_pedido', de)
  if (ate) q = q.lte('data_pedido', ate)
  if (clienteId) q = q.eq('cliente_id', clienteId)

  q = q.order('data_pedido', { ascending: false }).order('created_at', { ascending: false })

  const { data, error } = await q
  if (error) throw new Error(error.message)

  let arr = (data || []).map(anexaNome)
  if (pagamento && pagamento !== 'todos') {
    arr = arr.filter((p) => chavePagamento(p) === pagamento)
  }
  return arr
}

export async function obterPedido(id) {
  const { data, error } = await supabase.from('pedidos').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? anexaNome(data) : null
}

export async function criarPedido(dados) {
  const limpo = normalizarPedido(dados)
  const { data, error } = await supabase.from('pedidos').insert(limpo).select(SELECT).single()
  if (error) throw new Error(error.message)
  return anexaNome(data)
}

export async function atualizarPedido(id, dados) {
  const limpo = normalizarPedido(dados)
  const { data, error } = await supabase.from('pedidos').update(limpo).eq('id', id).select(SELECT).single()
  if (error) throw new Error(error.message)
  return anexaNome(data)
}

export async function excluirPedido(id) {
  const { error } = await supabase.from('pedidos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

import { supabase } from '../lib/supabase.js'
import { normalizarMovimento, saldoDeMovimentos } from './estoque.shared.js'

const COL = 'estoque_movimentos'
const SELECT = '*, pedido:pedido_id ( id, cliente:cliente_id ( nome ) )'

const comNome = (m) => ({
  ...m,
  cliente_nome: m.pedido?.cliente?.nome || (m.pedido_id ? 'Pedido' : null),
})

export async function saldoEstoque() {
  const { data, error } = await supabase.from(COL).select('tipo, quantidade')
  if (error) throw new Error(error.message)
  return saldoDeMovimentos(data || [])
}

export async function listarMovimentos({ de, ate } = {}) {
  let q = supabase.from(COL).select(SELECT)
  if (de) q = q.gte('data', de)
  if (ate) q = q.lte('data', ate)
  q = q.order('data', { ascending: false }).order('created_at', { ascending: false })
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data || []).map(comNome)
}

export async function registrarMovimento(dados) {
  const limpo = normalizarMovimento(dados)
  const { data, error } = await supabase.from(COL).insert(limpo).select(SELECT).single()
  if (error) throw new Error(error.message)
  return comNome(data)
}

export async function excluirMovimento(id) {
  const { data: m, error: e1 } = await supabase.from(COL).select('pedido_id').eq('id', id).maybeSingle()
  if (e1) throw new Error(e1.message)
  if (m?.pedido_id) throw new Error('Movimento de pedido — edite ou exclua o pedido.')
  const { error } = await supabase.from(COL).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

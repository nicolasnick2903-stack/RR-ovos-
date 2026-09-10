// Router: expõe a API de pedidos apontando pro backend ativo (Supabase ou local).
import { supabaseAtivo } from '../lib/supabase.js'
import * as local from './pedidos.local.js'
import * as remote from './pedidos.remote.js'

export * from './pedidos.shared.js'

const impl = supabaseAtivo ? remote : local

export const listarPedidos = impl.listarPedidos
export const obterPedido = impl.obterPedido
export const criarPedido = impl.criarPedido
export const atualizarPedido = impl.atualizarPedido
export const excluirPedido = impl.excluirPedido

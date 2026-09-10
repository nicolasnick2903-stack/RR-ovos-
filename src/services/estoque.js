// Router: expõe a API de estoque apontando pro backend ativo (Supabase ou local).
import { supabaseAtivo } from '../lib/supabase.js'
import * as local from './estoque.local.js'
import * as remote from './estoque.remote.js'

export * from './estoque.shared.js'

const impl = supabaseAtivo ? remote : local

export const saldoEstoque = impl.saldoEstoque
export const listarMovimentos = impl.listarMovimentos
export const registrarMovimento = impl.registrarMovimento
export const excluirMovimento = impl.excluirMovimento

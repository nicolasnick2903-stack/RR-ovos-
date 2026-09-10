// Router: expõe a API de clientes apontando pro backend ativo (Supabase ou local).
import { supabaseAtivo } from '../lib/supabase.js'
import * as local from './clientes.local.js'
import * as remote from './clientes.remote.js'

export * from './clientes.shared.js'

const impl = supabaseAtivo ? remote : local

export const listarClientes = impl.listarClientes
export const obterCliente = impl.obterCliente
export const criarCliente = impl.criarCliente
export const atualizarCliente = impl.atualizarCliente
export const excluirCliente = impl.excluirCliente

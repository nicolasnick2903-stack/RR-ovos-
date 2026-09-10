import { soDigitos } from '../utils/format.js'

export function normalizarCliente({ nome, endereco, telefone }) {
  if (!nome || !nome.trim()) throw new Error('Informe o nome do cliente.')
  if (!endereco || !endereco.trim()) throw new Error('Informe o endereço.')
  if (soDigitos(telefone).length < 10) throw new Error('Informe um telefone válido com DDD.')
  return { nome: nome.trim(), endereco: endereco.trim(), telefone: telefone.trim() }
}

export function filtrarClientes(arr, busca = '') {
  const termo = busca.trim().toLowerCase()
  if (!termo) return arr
  const digitos = soDigitos(termo)
  return arr.filter(
    (c) =>
      c.nome.toLowerCase().includes(termo) ||
      (digitos && soDigitos(c.telefone).includes(digitos)),
  )
}

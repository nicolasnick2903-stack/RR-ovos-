// Camada de persistência local (localStorage) com API assíncrona, no mesmo
// formato que a versão Supabase vai ter — assim as páginas não mudam quando
// o banco real for plugado.

const PREFIX = 'rrovos.'

export function readAll(colecao) {
  try {
    const raw = localStorage.getItem(PREFIX + colecao)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function writeAll(colecao, arr) {
  localStorage.setItem(PREFIX + colecao, JSON.stringify(arr))
}

export function novoId() {
  return (crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`)
}

export function agora() {
  return new Date().toISOString()
}

export function limparTudo() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX) && k !== 'rrovos.session')
    .forEach((k) => localStorage.removeItem(k))
}

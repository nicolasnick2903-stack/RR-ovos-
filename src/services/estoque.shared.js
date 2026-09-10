export const saldoDeMovimentos = (movimentos) =>
  movimentos.reduce((s, m) => s + (m.tipo === 'entrada' ? Number(m.quantidade) : -Number(m.quantidade)), 0)

export function normalizarMovimento({ tipo, quantidade, motivo, data }) {
  if (!['entrada', 'saida'].includes(tipo)) throw new Error('Tipo de movimento inválido.')
  const qtd = Math.floor(Number(quantidade))
  if (!Number.isFinite(qtd) || qtd <= 0) {
    throw new Error('A quantidade deve ser um número inteiro maior que zero.')
  }
  if (!data) throw new Error('Informe a data.')
  return {
    tipo,
    quantidade: qtd,
    motivo: (motivo || '').trim() || null,
    data: String(data).slice(0, 10),
  }
}

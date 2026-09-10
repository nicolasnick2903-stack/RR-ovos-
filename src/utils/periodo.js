import { hojeISO } from './format.js'

const isoDe = (d) => {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

// Retorna { de, ate } em ISO (yyyy-mm-dd) para cada preset.
export function intervaloPreset(preset, custom = {}) {
  const hoje = new Date()
  const y = hoje.getFullYear()
  const m = hoje.getMonth()

  switch (preset) {
    case 'hoje': {
      const h = hojeISO()
      return { de: h, ate: h }
    }
    case 'ontem': {
      const o = new Date(hoje)
      o.setDate(o.getDate() - 1)
      return { de: isoDe(o), ate: isoDe(o) }
    }
    case '7dias': {
      const ini = new Date(hoje)
      ini.setDate(ini.getDate() - 6)
      return { de: isoDe(ini), ate: hojeISO() }
    }
    case 'mes':
      return { de: isoDe(new Date(y, m, 1)), ate: isoDe(new Date(y, m + 1, 0)) }
    case 'mesAnterior':
      return { de: isoDe(new Date(y, m - 1, 1)), ate: isoDe(new Date(y, m, 0)) }
    case 'personalizado':
      return { de: custom.de || hojeISO(), ate: custom.ate || hojeISO() }
    default:
      return { de: isoDe(new Date(y, m, 1)), ate: isoDe(new Date(y, m + 1, 0)) }
  }
}

export const PRESETS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'ontem', label: 'Ontem' },
  { id: '7dias', label: '7 dias' },
  { id: 'mes', label: 'Este mês' },
  { id: 'mesAnterior', label: 'Mês anterior' },
  { id: 'personalizado', label: 'Período' },
]

// Lista de dias (ISO) entre de..ate, inclusivo — para eixos de gráfico.
export function diasEntre(de, ate) {
  const out = []
  const d = new Date(de + 'T00:00:00')
  const fim = new Date(ate + 'T00:00:00')
  while (d <= fim) {
    out.push(isoDe(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

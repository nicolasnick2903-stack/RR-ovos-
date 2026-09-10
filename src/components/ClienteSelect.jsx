import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Check, ChevronDown } from 'lucide-react'
import { listarClientes } from '../services/clientes.js'
import { formatTelefone } from '../utils/format.js'

export default function ClienteSelect({ value, onChange }) {
  const [clientes, setClientes] = useState([])
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    listarClientes().then(setClientes)
  }, [])

  useEffect(() => {
    const fora = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [])

  const selecionado = clientes.find((c) => c.id === value)
  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    if (!t) return clientes
    return clientes.filter(
      (c) => c.nome.toLowerCase().includes(t) || formatTelefone(c.telefone).includes(t),
    )
  }, [clientes, busca])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="input-field flex items-center justify-between text-left"
      >
        <span className={selecionado ? 'text-preto' : 'text-preto/30'}>
          {selecionado ? selecionado.nome : 'Selecione o cliente'}
        </span>
        <ChevronDown size={18} className="text-preto/40" />
      </button>

      {aberto && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-float">
          <div className="relative border-b border-black/5 p-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-preto/35" />
            <input
              autoFocus
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full rounded-lg bg-black/5 py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtrados.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-preto/40">Nenhum cliente. Cadastre em "Clientes".</p>
            ) : (
              filtrados.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c.id, c)
                    setAberto(false)
                    setBusca('')
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-black/5"
                >
                  <span>
                    <span className="font-semibold text-preto">{c.nome}</span>
                    <span className="block text-xs text-preto/45">{formatTelefone(c.telefone)}</span>
                  </span>
                  {c.id === value && <Check size={16} className="text-campo" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

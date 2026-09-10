import { useState } from 'react'
import { formatTelefone } from '../utils/format.js'

export default function ClienteForm({ inicial, onSalvar, onCancelar }) {
  const [nome, setNome] = useState(inicial?.nome || '')
  const [telefone, setTelefone] = useState(inicial?.telefone || '')
  const [endereco, setEndereco] = useState(inicial?.endereco || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onSalvar({ nome, telefone, endereco })
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-3">
      <div>
        <label className="label">Nome *</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} className="input-field" placeholder="Nome do cliente" autoFocus />
      </div>
      <div>
        <label className="label">Telefone *</label>
        <input
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          className="input-field"
          placeholder="(11) 99999-9999"
          inputMode="tel"
        />
      </div>
      <div>
        <label className="label">Endereço *</label>
        <input value={endereco} onChange={(e) => setEndereco(e.target.value)} className="input-field" placeholder="Rua, número, bairro" />
      </div>

      {erro && <p className="text-sm font-medium text-alerta">{erro}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancelar} className="btn-ghost">
          Cancelar
        </button>
        <button type="submit" disabled={salvando} className="btn-primary">
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}

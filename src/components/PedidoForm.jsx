import { useMemo, useState } from 'react'
import ClienteSelect from './ClienteSelect.jsx'
import { FORMAS, TIPOS_CARTAO } from '../services/pedidos.js'
import { formatBRL, parseValor, hojeISO } from '../utils/format.js'

const rotuloForma = (forma, tipo) => {
  if (forma === 'dinheiro') return 'Dinheiro'
  if (forma === 'pix') return 'PIX'
  if (forma === 'cartao') return tipo === 'debito' ? 'Cartão Débito' : 'Cartão Crédito'
  return '—'
}

export default function PedidoForm({ inicial, onSubmit, onCancelar, textoBotao = 'Salvar Pedido' }) {
  const [clienteId, setClienteId] = useState(inicial?.cliente_id || '')
  const [clienteNome, setClienteNome] = useState(inicial?.cliente_nome || '')
  const [data, setData] = useState(inicial?.data_pedido || hojeISO())
  const [qtd, setQtd] = useState(inicial ? String(inicial.quantidade_ovos) : '')
  const [unit, setUnit] = useState(inicial ? String(inicial.valor_unitario).replace('.', ',') : '')
  const [forma, setForma] = useState(inicial?.forma_pagamento || '')
  const [tipoCartao, setTipoCartao] = useState(inicial?.tipo_cartao || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const qtdNum = Math.floor(Number(qtd)) || 0
  const unitNum = parseValor(unit)
  const total = useMemo(() => Math.round(qtdNum * unitNum * 100) / 100, [qtdNum, unitNum])

  const clienteOk = !!clienteId
  const qtdOk = qtdNum > 0
  const unitOk = unitNum >= 0 && unit !== ''
  const formaOk = !!forma && (forma !== 'cartao' || !!tipoCartao)
  const podeConfirmar = clienteOk && qtdOk && unitOk && formaOk

  const escolherForma = (f) => {
    setForma(f)
    if (f !== 'cartao') setTipoCartao('')
  }

  const enviar = async (e) => {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await onSubmit({
        cliente_id: clienteId,
        data_pedido: data,
        quantidade_ovos: qtdNum,
        valor_unitario: unitNum,
        forma_pagamento: forma,
        tipo_cartao: forma === 'cartao' ? tipoCartao : null,
      })
    } catch (err) {
      setErro(err.message || 'Não foi possível salvar o pedido.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label className="label">Cliente *</label>
        <ClienteSelect
          value={clienteId}
          onChange={(id, c) => {
            setClienteId(id)
            setClienteNome(c?.nome || '')
          }}
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="label">Data do pedido *</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="input-field" />
        </div>
        <div className="w-32">
          <label className="label">Qtd. de ovos *</label>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            className="input-field"
            placeholder="30"
          />
        </div>
      </div>

      <div>
        <label className="label">Valor unitário (por ovo) *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-preto/40">R$</span>
          <input
            type="text"
            inputMode="decimal"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="input-field pl-10"
            placeholder="1,00"
          />
        </div>
      </div>

      <div className="rounded-xl bg-preto p-4 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Total do pedido</p>
        <p className="text-2xl font-extrabold text-dourado">{formatBRL(total)}</p>
        <p className="mt-0.5 text-xs text-white/50">
          {qtdNum} ovos × {formatBRL(unitNum)}
        </p>
      </div>

      <div>
        <label className="label">Forma de pagamento *</label>
        <div className="grid grid-cols-3 gap-2">
          {FORMAS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => escolherForma(f.id)}
              className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                forma === f.id ? 'border-preto bg-preto text-white' : 'border-black/10 bg-white text-preto/70'
              }`}
            >
              <span className="block text-base">{f.emoji}</span>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {forma === 'cartao' && (
        <div className="animate-fadeInUp">
          <label className="label">Tipo de cartão *</label>
          <div className="grid grid-cols-2 gap-2">
            {TIPOS_CARTAO.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTipoCartao(t.id)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  tipoCartao === t.id ? 'border-dourado bg-dourado text-preto' : 'border-black/10 bg-white text-preto/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {podeConfirmar && (
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-preto/45">Resumo do pedido</p>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-preto/55">Cliente</dt>
              <dd className="text-right font-semibold text-preto">{clienteNome || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-preto/55">Quantidade</dt>
              <dd className="font-semibold text-preto">{qtdNum} ovos</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-preto/55">Valor unitário</dt>
              <dd className="font-semibold text-preto">{formatBRL(unitNum)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-preto/55">Pagamento</dt>
              <dd className="font-semibold text-preto">{rotuloForma(forma, tipoCartao)}</dd>
            </div>
            <div className="mt-1 flex justify-between gap-4 border-t border-black/5 pt-1.5">
              <dt className="font-bold text-preto">Total</dt>
              <dd className="font-extrabold text-campo">{formatBRL(total)}</dd>
            </div>
          </dl>
        </div>
      )}

      {erro && <p className="text-sm font-medium text-alerta">{erro}</p>}

      <div className="flex gap-2">
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="btn-ghost">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={!podeConfirmar || salvando} className="btn-primary">
          {salvando ? 'Salvando...' : textoBotao}
        </button>
      </div>
    </form>
  )
}

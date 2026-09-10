import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({
  aberto,
  titulo = 'Confirmar',
  mensagem,
  textoConfirmar = 'Excluir',
  onConfirmar,
  onCancelar,
  processando = false,
}) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-float animate-fadeInUp">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-alerta/10">
          <AlertTriangle size={22} className="text-alerta" />
        </div>
        <h3 className="text-base font-bold text-preto">{titulo}</h3>
        <p className="mt-1 text-sm text-preto/60">{mensagem}</p>
        <div className="mt-5 flex gap-2">
          <button onClick={onCancelar} disabled={processando} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={onConfirmar} disabled={processando} className="btn-danger">
            {processando ? 'Aguarde...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}

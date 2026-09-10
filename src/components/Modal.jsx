import { X } from 'lucide-react'

export default function Modal({ aberto, titulo, onFechar, children }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-float animate-fadeInUp sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-preto">{titulo}</h3>
          <button onClick={onFechar} aria-label="Fechar" className="text-preto/40">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

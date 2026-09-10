import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remover = useCallback((id) => {
    setToasts((ts) => ts.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (mensagem, tipo = 'sucesso') => {
      const id = Math.random().toString(16).slice(2)
      setToasts((ts) => [...ts, { id, mensagem, tipo }])
      setTimeout(() => remover(id), 3500)
    },
    [remover],
  )

  const toast = {
    sucesso: (m) => push(m, 'sucesso'),
    erro: (m) => push(m, 'erro'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-float animate-fadeInUp ${
              t.tipo === 'erro' ? 'bg-alerta text-white' : 'bg-preto text-white'
            }`}
          >
            {t.tipo === 'erro' ? (
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-campo-300" />
            )}
            <span className="flex-1">{t.mensagem}</span>
            <button onClick={() => remover(t.id)} aria-label="Fechar">
              <X size={16} className="opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}

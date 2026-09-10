export default function EmptyState({ emoji = '🥚', titulo, descricao, acao }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/50 px-6 py-12 text-center">
      <div className="text-4xl">{emoji}</div>
      <p className="mt-3 font-bold text-preto">{titulo}</p>
      {descricao && <p className="mt-1 text-sm text-preto/50">{descricao}</p>}
      {acao && <div className="mt-4 w-full max-w-xs">{acao}</div>}
    </div>
  )
}

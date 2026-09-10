import { useState } from 'react'

// Usa a logo oficial em public/logo.png. Enquanto o arquivo não estiver lá,
// mostra um selo provisório com as iniciais — nunca uma logo inventada.
// `chip`: envolve num círculo branco, para uso sobre fundos escuros
// (a arte da logo é sobre fundo branco).
export default function Logo({ size = 48, chip = false, className = '' }) {
  const [erro, setErro] = useState(false)

  const inner = erro ? (
    <div
      className="flex h-full w-full items-center justify-center rounded-full bg-dourado font-extrabold text-preto"
      style={{ fontSize: size * 0.3 }}
      aria-label="R&R Ovos Caipiras"
    >
      R&amp;R
    </div>
  ) : (
    <img
      src="/logo.png"
      alt="R&R Ovos Caipiras"
      onError={() => setErro(true)}
      className="h-full w-full object-contain"
    />
  )

  if (chip) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-card ${className}`}
        style={{ width: size, height: size }}
      >
        {inner}
      </div>
    )
  }

  return (
    <div className={`shrink-0 ${className}`} style={{ width: size, height: size }}>
      {inner}
    </div>
  )
}

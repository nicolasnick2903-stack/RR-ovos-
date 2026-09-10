import { useState } from 'react'

// Usa a logo oficial em public/logo.png. Enquanto o arquivo não estiver lá,
// mostra um selo provisório com as iniciais — nunca uma logo inventada.
export default function Logo({ size = 48, className = '' }) {
  const [erro, setErro] = useState(false)

  if (erro) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-dourado font-extrabold text-preto ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.34 }}
        aria-label="R&R Ovos Caipiras"
      >
        R&amp;R
      </div>
    )
  }

  return (
    <img
      src="/logo.png"
      alt="R&R Ovos Caipiras"
      width={size}
      height={size}
      onError={() => setErro(true)}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}

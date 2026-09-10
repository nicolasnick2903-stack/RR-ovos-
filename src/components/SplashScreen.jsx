import Logo from './Logo.jsx'

export default function SplashScreen() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-preto px-6 text-center">
      <Logo size={132} chip className="animate-fadeInUp" />
      <div>
        <h1 className="text-2xl font-extrabold text-white">R&amp;R Ovos Caipiras</h1>
        <p className="mt-1 text-sm font-medium text-dourado">Qualidade direto do campo</p>
      </div>
      <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-[fadeInUp_1s_ease-in-out_infinite_alternate] rounded-full bg-dourado" />
      </div>
    </div>
  )
}

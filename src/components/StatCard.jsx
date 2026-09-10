export default function StatCard({ emoji, label, valor, cor = 'text-preto' }) {
  return (
    <div className="card">
      <p className="text-xs font-medium text-preto/50">
        {emoji} {label}
      </p>
      <p className={`mt-1 text-xl font-extrabold ${cor}`}>{valor}</p>
    </div>
  )
}

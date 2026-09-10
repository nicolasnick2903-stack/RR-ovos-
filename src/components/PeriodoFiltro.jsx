import { PRESETS } from '../utils/periodo.js'

// value: { preset, de, ate } | onChange recebe o mesmo shape.
export default function PeriodoFiltro({ value, onChange, className = '' }) {
  const { preset, de, ate } = value

  return (
    <div className={className}>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange({ ...value, preset: p.id })}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              preset === p.id
                ? 'border-preto bg-preto text-white'
                : 'border-black/10 bg-white text-preto/70'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'personalizado' && (
        <div className="mt-2 flex gap-2">
          <div className="flex-1">
            <label className="label">De</label>
            <input
              type="date"
              value={de || ''}
              onChange={(e) => onChange({ ...value, de: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="label">Até</label>
            <input
              type="date"
              value={ate || ''}
              onChange={(e) => onChange({ ...value, ate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      )}
    </div>
  )
}

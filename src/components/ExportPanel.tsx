import { useState } from 'react'
import {
  Check,
  Download,
  FileImage,
  Gauge,
  Info,
  Layers as LayersIcon,
  Monitor,
  Sparkles,
} from 'lucide-react'
import type { DocSettings } from '../lib/types'
import { cx } from '../lib/utils'

interface ExportPanelProps {
  doc: DocSettings
  layerCount: number
  onExport: (format: 'png' | 'jpeg' | 'webp', quality: number, scale: number) => void
}

const formats = [
  {
    id: 'png' as const,
    name: 'PNG',
    description: 'Sans perte · transparence',
    badge: 'Recommandé',
  },
  {
    id: 'jpeg' as const,
    name: 'JPEG',
    description: 'Léger · universel',
    badge: 'Compatible',
  },
  {
    id: 'webp' as const,
    name: 'WebP',
    description: 'Moderne · compressé',
    badge: 'Moderne',
  },
]

export default function ExportPanel({ doc, layerCount, onExport }: ExportPanelProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
  const [quality, setQuality] = useState(92)
  const [scale, setScale] = useState(1)

  return (
    <div className="scroll-slim flex-1 overflow-y-auto p-3.5">
      {/* Résumé */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-azure-500/[0.16] via-white/[0.03] to-violet-royal/[0.12] p-3.5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-azure-500 to-violet-royal shadow-lg shadow-azure-600/25">
            <Monitor size={19} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-display text-[13px] font-bold text-white">
              Votre fond d'écran est prêt
            </p>
            <p className="mt-0.5 text-[9.5px] leading-relaxed text-ink-300">
              {doc.width} × {doc.height} px · {layerCount} calque{layerCount > 1 ? 's' : ''} ·
              rendu haute définition
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: FileImage, label: 'Résolution', value: `${doc.width}×${doc.height}` },
            { icon: LayersIcon, label: 'Calques', value: `${layerCount}` },
            {
              icon: Gauge,
              label: 'Sortie',
              value: `${Math.round((doc.width * scale * doc.height * scale) / 1_000_000)} MP`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.09] bg-white/[0.05] px-2 py-2 text-center"
            >
              <Icon size={13} className="mx-auto mb-1 text-azure-300" />
              <p className="text-[8px] font-semibold uppercase tracking-wider text-ink-400">
                {label}
              </p>
              <p className="text-[10px] font-bold tabular-nums text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="mb-2.5 flex items-center gap-2">
        <FileImage size={12} className="text-azure-300" />
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Format de sortie
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="mb-4 space-y-1.5">
        {formats.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFormat(item.id)}
            className={cx(
              'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all',
              format === item.id
                ? 'border-azure-400/55 bg-azure-500/16'
                : 'border-white/[0.08] bg-white/[0.028] hover:border-white/18 hover:bg-white/[0.06]',
            )}
          >
            <div
              className={cx(
                'grid h-4 w-4 place-items-center rounded-full border-2 transition-colors',
                format === item.id ? 'border-azure-400' : 'border-white/25',
              )}
            >
              {format === item.id && <span className="h-2 w-2 rounded-full bg-azure-400" />}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-semibold text-white">{item.name}</p>
              <p className="text-[8.5px] text-ink-400">{item.description}</p>
            </div>
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[7.5px] font-semibold uppercase tracking-wider text-ink-300">
              {item.badge}
            </span>
            {format === item.id && <Check size={14} className="text-mint" />}
          </button>
        ))}
      </div>

      {/* Qualité */}
      {format !== 'png' && (
        <>
          <div className="mb-2.5 flex items-center gap-2">
            <Gauge size={12} className="text-mint" />
            <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
              Qualité
            </span>
            <div className="h-px flex-1 bg-white/[0.07]" />
          </div>
          <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.028] p-3">
            <input
              type="range"
              min={40}
              max={100}
              value={quality}
              onChange={(event) => setQuality(Number(event.target.value))}
            />
            <span className="w-[42px] text-right text-[11px] font-bold tabular-nums text-white">
              {quality} %
            </span>
          </div>
        </>
      )}

      {/* Échelle */}
      <div className="mb-2.5 flex items-center gap-2">
        <Sparkles size={12} className="text-gold" />
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Échelle de rendu
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-1.5">
        {[
          { value: 1, label: '1×', sub: `${doc.width}×${doc.height}` },
          { value: 1.5, label: '1,5×', sub: `${Math.round(doc.width * 1.5)}×${Math.round(doc.height * 1.5)}` },
          { value: 2, label: '2×', sub: `${doc.width * 2}×${doc.height * 2}` },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setScale(option.value)}
            className={cx(
              'flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 transition-all',
              scale === option.value
                ? 'border-violet-soft/60 bg-violet-royal/22 text-white'
                : 'border-white/[0.08] bg-white/[0.028] text-ink-300 hover:bg-white/[0.07]',
            )}
          >
            <span className="text-[11px] font-bold">{option.label}</span>
            <span className="text-[7.5px] tabular-nums text-ink-500">{option.sub}</span>
          </button>
        ))}
      </div>

      {/* Export */}
      <button
        type="button"
        onClick={() => onExport(format, quality / 100, scale)}
        className="btn-primary flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[13px] font-bold"
      >
        <Download size={17} />
        Exporter le fond d'écran
      </button>

      <button
        type="button"
        onClick={() => onExport('png', 1, 1)}
        className="btn-ghost mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-2.5 text-[10.5px] font-semibold"
      >
        Export rapide PNG · {doc.width} × {doc.height}
      </button>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-azure-500/20 bg-azure-500/[0.08] p-3">
        <Info size={13} className="mt-[2px] shrink-0 text-azure-300" />
        <p className="text-[8.5px] leading-relaxed text-ink-300">
          Astuce : pour un fond d'écran Windows impeccable, exportez en PNG à 1× (résolution
          native de votre écran). Les logos vectoriels restent nets à toutes les échelles.
        </p>
      </div>
    </div>
  )
}

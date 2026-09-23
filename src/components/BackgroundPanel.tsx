import { useRef } from 'react'
import { Grid3x3, Image as ImageIcon, Magnet, Palette, Ruler, Upload, Wand2 } from 'lucide-react'
import type { DocSettings } from '../lib/types'
import {
  canvasPresets,
  gradientPresets,
  sampleBackgrounds,
  type BackgroundAsset,
} from '../lib/backgrounds'
import { cx } from '../lib/utils'

interface BackgroundPanelProps {
  doc: DocSettings
  onDocChange: (patch: Partial<DocSettings>) => void
  onAddBackground: (asset: BackgroundAsset) => void
  onGradientPreset: (preset: { name: string; from: string; to: string }) => void
  onImportClick: () => void
}

export default function BackgroundPanel({
  doc,
  onDocChange,
  onAddBackground,
  onGradientPreset,
  onImportClick,
}: BackgroundPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="scroll-slim flex-1 overflow-y-auto p-3.5">
      {/* Format du canevas */}
      <div className="mb-2.5 flex items-center gap-2">
        <Ruler size={12} className="text-azure-300" />
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Format du canevas
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {canvasPresets.map((preset) => {
          const active = doc.width === preset.width && doc.height === preset.height
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onDocChange({ width: preset.width, height: preset.height })}
              className={cx(
                'flex flex-col items-start gap-0.5 rounded-xl border px-2.5 py-2 text-left transition-all',
                active
                  ? 'border-azure-400/60 bg-azure-500/18 text-white'
                  : 'border-white/[0.08] bg-white/[0.028] text-ink-200 hover:border-white/20 hover:bg-white/[0.07]',
              )}
            >
              <span className="text-[9.5px] font-semibold">{preset.label}</span>
              <span className="text-[8px] tabular-nums text-ink-500">
                {preset.width} × {preset.height} · {preset.hint}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-2.5 py-2">
          <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
            Largeur
          </span>
          <input
            type="number"
            value={doc.width}
            min={320}
            max={7680}
            onChange={(event) =>
              onDocChange({ width: Math.max(320, Math.min(7680, Number(event.target.value))) })
            }
            className="w-full bg-transparent text-[11px] font-semibold tabular-nums text-ink-100 outline-none"
          />
          <span className="text-[8px] text-ink-500">px</span>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-2.5 py-2">
          <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
            Hauteur
          </span>
          <input
            type="number"
            value={doc.height}
            min={320}
            max={4320}
            onChange={(event) =>
              onDocChange({ height: Math.max(320, Math.min(4320, Number(event.target.value))) })
            }
            className="w-full bg-transparent text-[11px] font-semibold tabular-nums text-ink-100 outline-none"
          />
          <span className="text-[8px] text-ink-500">px</span>
        </label>
      </div>

      {/* Couleur de fond */}
      <div className="mb-2.5 flex items-center gap-2">
        <Palette size={12} className="text-violet-soft" />
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Couleur de fond du canevas
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <label className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.03] p-3">
        <input
          type="color"
          value={doc.background}
          onChange={(event) => onDocChange({ background: event.target.value })}
          className="h-11 w-16"
        />
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-ink-100">
            {doc.background.toUpperCase()}
          </p>
          <p className="text-[8.5px] text-ink-500">
            Visible derrière tous les calques et à l'export.
          </p>
        </div>
      </label>

      {/* Dégradés */}
      <div className="mb-2.5 flex items-center gap-2">
        <Wand2 size={12} className="text-mint" />
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Dégradés instantanés
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="mb-4 grid grid-cols-4 gap-1.5">
        {gradientPresets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onGradientPreset(preset)}
            className="logo-tile h-11 rounded-xl border border-white/10"
            style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
            title={`Ajouter le dégradé « ${preset.name} »`}
          />
        ))}
      </div>

      {/* Fonds d'exemple */}
      <div className="mb-2.5 flex items-center gap-2">
        <ImageIcon size={12} className="text-gold" />
        <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
          Fonds d'exemple
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        {sampleBackgrounds.map((bg) => (
          <button
            key={bg.id}
            type="button"
            onClick={() => onAddBackground(bg)}
            className="logo-tile group relative overflow-hidden rounded-2xl border border-white/[0.09]"
          >
            <img
              src={bg.thumb}
              alt={bg.name}
              className="h-[74px] w-full object-cover transition-transform duration-500 group-hover:scale-110"
              draggable={false}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-2 pt-4 pb-1.5 text-left">
              <p className="truncate text-[8.5px] font-semibold text-white">{bg.name}</p>
              <p className="text-[7px] font-medium uppercase tracking-wider text-white/70">
                {bg.mood}
              </p>
            </div>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            window.dispatchEvent(new CustomEvent('pane:import-file', { detail: file }))
          }
          event.target.value = ''
        }}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[11.5px] font-semibold"
      >
        <Upload size={15} />
        Importer une image depuis mon PC
      </button>

      {/* Options d'affichage */}
      <div className="mt-4 space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.028] p-3">
        <button
          type="button"
          onClick={() => onDocChange({ showGrid: !doc.showGrid })}
          className="flex w-full items-center justify-between rounded-xl px-1.5 py-1.5 transition-colors hover:bg-white/[0.05]"
        >
          <span className="flex items-center gap-2 text-[10px] font-medium text-ink-200">
            <Grid3x3 size={13} className="text-ink-400" />
            Grille d'alignement
          </span>
          <span
            className={cx(
              'relative h-[19px] w-[34px] rounded-full transition-colors',
              doc.showGrid ? 'bg-azure-500' : 'bg-white/12',
            )}
          >
            <span
              className={cx(
                'absolute top-[2.5px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all',
                doc.showGrid ? 'left-[17px]' : 'left-[2.5px]',
              )}
            />
          </span>
        </button>

        <button
          type="button"
          onClick={() => onDocChange({ snapToGrid: !doc.snapToGrid })}
          className="flex w-full items-center justify-between rounded-xl px-1.5 py-1.5 transition-colors hover:bg-white/[0.05]"
        >
          <span className="flex items-center gap-2 text-[10px] font-medium text-ink-200">
            <Magnet size={13} className="text-ink-400" />
            Aimantation au canevas
          </span>
          <span
            className={cx(
              'relative h-[19px] w-[34px] rounded-full transition-colors',
              doc.snapToGrid ? 'bg-azure-500' : 'bg-white/12',
            )}
          >
            <span
              className={cx(
                'absolute top-[2.5px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all',
                doc.snapToGrid ? 'left-[17px]' : 'left-[2.5px]',
              )}
            />
          </span>
        </button>
      </div>
    </div>
  )
}

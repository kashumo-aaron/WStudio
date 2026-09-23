import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Plus,
  Shapes,
  Trash2,
  Type,
  Unlock,
} from 'lucide-react'
import type { Layer } from '../lib/types'
import { blendModes } from '../lib/backgrounds'
import { cx } from '../lib/utils'

interface LayersPanelProps {
  layers: Layer[]
  selectedId: string | null
  onSelect: (id: string) => void
  onUpdate: (id: string, patch: Partial<Layer>) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove: (id: string, direction: -1 | 1) => void
  onToggleVisible: (id: string) => void
  onToggleLock: (id: string) => void
  onAddText: () => void
  onAddShape: () => void
  onAddSolid: () => void
}

function LayerThumb({ layer }: { layer: Layer }) {
  if (layer.type === 'image') {
    return (
      <div className="checker h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10">
        <img src={layer.src} alt="" className="h-full w-full object-cover" draggable={false} />
      </div>
    )
  }
  if (layer.type === 'text') {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-gradient-to-br from-azure-500/30 to-violet-royal/25">
        <Type size={15} className="text-azure-300" />
      </div>
    )
  }
  if (layer.type === 'shape') {
    return (
      <div
        className="h-10 w-10 shrink-0 rounded-lg border border-white/10"
        style={{
          background:
            layer.fillType === 'solid'
              ? layer.fill
              : `linear-gradient(135deg, ${layer.fill}, ${layer.fill2})`,
        }}
      />
    )
  }
  return (
    <div
      className="h-10 w-10 shrink-0 rounded-lg border border-white/10"
      style={{ background: layer.color }}
    />
  )
}

export default function LayersPanel({
  layers,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
  onToggleVisible,
  onToggleLock,
  onAddText,
  onAddShape,
  onAddSolid,
}: LayersPanelProps) {
  const selected = layers.find((layer) => layer.id === selectedId) ?? null
  const ordered = [...layers].reverse()

  return (
    <div className="flex h-full flex-col">
      {/* Actions rapides */}
      <div className="grid grid-cols-3 gap-2 border-b border-white/[0.07] p-3">
        <button
          type="button"
          onClick={onAddText}
          className="btn-ghost flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-[10px] font-semibold"
        >
          <Type size={15} className="text-azure-300" />
          Texte
        </button>
        <button
          type="button"
          onClick={onAddShape}
          className="btn-ghost flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-[10px] font-semibold"
        >
          <Shapes size={15} className="text-violet-soft" />
          Forme
        </button>
        <button
          type="button"
          onClick={onAddSolid}
          className="btn-ghost flex flex-col items-center gap-1.5 rounded-xl py-2.5 text-[10px] font-semibold"
        >
          <Plus size={15} className="text-mint" />
          Aplat
        </button>
      </div>

      {/* Liste */}
      <div className="scroll-slim flex-1 overflow-y-auto p-2.5">
        {ordered.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-2 px-6 text-center">
            <ImageIcon size={26} className="text-ink-500" />
            <p className="text-[11.5px] leading-relaxed text-ink-400">
              Aucun calque pour l'instant. Importez un fond ou ajoutez un logo pour démarrer.
            </p>
          </div>
        )}

        {ordered.map((layer) => {
          const index = layers.findIndex((item) => item.id === layer.id)
          return (
            <div
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={cx(
                'layer-row mb-1.5 flex cursor-pointer items-center gap-2 rounded-xl p-1.5',
                selectedId === layer.id && 'selected',
              )}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleVisible(layer.id)
                }}
                className={cx(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors',
                  layer.visible
                    ? 'text-azure-300 hover:bg-white/10'
                    : 'text-ink-500 hover:bg-white/10',
                )}
                title={layer.visible ? 'Masquer le calque' : 'Afficher le calque'}
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              <LayerThumb layer={layer} />

              <div className="min-w-0 flex-1">
                <input
                  value={layer.name}
                  onChange={(event) => onUpdate(layer.id, { name: event.target.value })}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full truncate rounded-md border border-transparent bg-transparent px-1.5 py-1 text-[11.5px] font-medium text-ink-100 outline-none transition-colors hover:border-white/10 hover:bg-white/[0.05] focus:border-azure-500/50 focus:bg-white/[0.07]"
                  aria-label="Nom du calque"
                />
                <div className="flex items-center gap-1.5 px-1.5">
                  <span className="rounded bg-white/[0.07] px-1.5 py-[1px] text-[8.5px] font-semibold uppercase tracking-wider text-ink-400">
                    {layer.type === 'image'
                      ? 'Image'
                      : layer.type === 'text'
                        ? 'Texte'
                        : layer.type === 'shape'
                          ? 'Forme'
                          : 'Aplat'}
                  </span>
                  <span className="text-[8.5px] text-ink-500">
                    {Math.round(layer.opacity)} %
                  </span>
                  {layer.rotation !== 0 && (
                    <span className="text-[8.5px] text-violet-soft">
                      {Math.round(layer.rotation)}°
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-[1px]">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onMove(layer.id, 1)
                  }}
                  disabled={index === layers.length - 1}
                  className="grid h-5 w-6 place-items-center rounded text-ink-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25"
                  title="Monter le calque"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onMove(layer.id, -1)
                  }}
                  disabled={index === 0}
                  className="grid h-5 w-6 place-items-center rounded text-ink-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25"
                  title="Descendre le calque"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onToggleLock(layer.id)
                }}
                className={cx(
                  'grid h-7 w-7 place-items-center rounded-lg transition-colors',
                  layer.locked
                    ? 'bg-coral/20 text-coral'
                    : 'text-ink-500 hover:bg-white/10 hover:text-ink-200',
                )}
                title={layer.locked ? 'Déverrouiller' : 'Verrouiller le calque'}
              >
                {layer.locked ? <Lock size={12.5} /> : <Unlock size={12.5} />}
              </button>
            </div>
          )
        })}
      </div>

      {/* Options du calque sélectionné */}
      {selected && (
        <div className="border-t border-white/[0.07] bg-white/[0.02] p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-[0.15em] text-ink-400">
              Mélange &amp; opacité
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDuplicate(selected.id)}
                className="grid h-7 w-7 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Dupliquer le calque (Ctrl+D)"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(selected.id)}
                className="grid h-7 w-7 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-coral/20 hover:text-coral"
                title="Supprimer le calque (Suppr)"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="w-[62px] text-[10px] font-medium text-ink-400">Opacité</span>
            <input
              type="range"
              min={0}
              max={100}
              value={selected.opacity}
              onChange={(event) => onUpdate(selected.id, { opacity: Number(event.target.value) })}
            />
            <span className="w-[38px] text-right text-[10.5px] font-semibold tabular-nums text-ink-200">
              {Math.round(selected.opacity)} %
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-[62px] text-[10px] font-medium text-ink-400">Fusion</span>
            <select
              value={selected.blend}
              onChange={(event) =>
                onUpdate(selected.id, {
                  blend: event.target.value as GlobalCompositeOperation,
                })
              }
              className="flex-1 rounded-lg border border-white/10 bg-ink-800 px-2.5 py-2 text-[11px] text-ink-100 outline-none transition-colors focus:border-azure-500/50"
            >
              {blendModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

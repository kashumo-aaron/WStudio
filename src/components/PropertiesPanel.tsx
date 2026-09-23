import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Copy,
  Crop,
  Maximize2,
  Move,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import type { AlignMode, DocSettings, FitMode, Layer, TextLayer, ShapeLayer } from '../lib/types'
import { fontOptions } from '../lib/backgrounds'
import { cx } from '../lib/utils'

interface PropertiesPanelProps {
  layer: Layer | null
  doc: DocSettings
  onUpdate: (id: string, patch: Partial<Layer>) => void
  onAlign: (mode: AlignMode) => void
  onFit: (mode: FitMode) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">
        {children}
      </span>
      <div className="h-px flex-1 bg-white/[0.07]" />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  suffix?: string
}) {
  return (
    <label className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 transition-colors focus-within:border-azure-500/50">
      <span className="text-[9px] font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </span>
      <input
        type="number"
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full min-w-0 bg-transparent text-[11px] font-semibold tabular-nums text-ink-100 outline-none"
      />
      {suffix && <span className="text-[8.5px] text-ink-500">{suffix}</span>}
    </label>
  )
}

export default function PropertiesPanel({
  layer,
  doc,
  onUpdate,
  onAlign,
  onFit,
  onDuplicate,
  onDelete,
}: PropertiesPanelProps) {
  if (!layer) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
          <Move size={22} className="text-ink-500" />
        </div>
        <h3 className="font-display text-[13px] font-bold text-white">Aucun calque sélectionné</h3>
        <p className="text-[10.5px] leading-relaxed text-ink-400">
          Cliquez sur un élément du canevas ou dans le panneau des calques pour modifier ses
          propriétés (position, taille, rotation, couleurs…).
        </p>
      </div>
    )
  }

  return (
    <div className="scroll-slim flex-1 overflow-y-auto p-3.5">
      {/* Identité */}
      <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-gradient-to-r from-azure-500/[0.12] to-violet-royal/[0.08] p-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10">
          <Sparkles size={15} className="text-azure-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-white">{layer.name}</p>
          <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-ink-400">
            Calque {layer.type} · {Math.round(layer.opacity)} % · {Math.round(layer.rotation)}°
          </p>
        </div>
        <button
          type="button"
          onClick={() => onDuplicate(layer.id)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Dupliquer"
        >
          <Copy size={13.5} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(layer.id)}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-coral/20 hover:text-coral"
          title="Supprimer"
        >
          <Trash2 size={13.5} />
        </button>
      </div>

      {/* Transformation */}
      <SectionTitle>Transformation</SectionTitle>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <NumberField label="X" value={layer.x} onChange={(v) => onUpdate(layer.id, { x: v })} />
        <NumberField label="Y" value={layer.y} onChange={(v) => onUpdate(layer.id, { y: v })} />
        <NumberField
          label="L"
          value={layer.width}
          onChange={(v) => onUpdate(layer.id, { width: Math.max(12, v) })}
          suffix="px"
        />
        <NumberField
          label="H"
          value={layer.height}
          onChange={(v) => onUpdate(layer.id, { height: Math.max(12, v) })}
          suffix="px"
        />
      </div>

      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wider text-ink-400">
          <RotateCcw size={11.5} />
          Rotation
        </span>
        <input
          type="range"
          min={-180}
          max={180}
          value={layer.rotation}
          onChange={(event) => onUpdate(layer.id, { rotation: Number(event.target.value) })}
        />
        <span className="w-[42px] text-right text-[10.5px] font-semibold tabular-nums text-ink-200">
          {Math.round(layer.rotation)}°
        </span>
      </div>

      {/* Alignement */}
      <SectionTitle>Alignement sur le canevas</SectionTitle>
      <div className="mb-1.5 grid grid-cols-4 gap-1.5">
        {[
          { mode: 'left' as AlignMode, Icon: ArrowLeftToLine, title: 'Aligner à gauche' },
          { mode: 'centerH' as AlignMode, Icon: AlignCenter, title: 'Centrer horizontalement' },
          { mode: 'right' as AlignMode, Icon: ArrowRightToLine, title: 'Aligner à droite' },
          { mode: 'top' as AlignMode, Icon: ArrowUpToLine, title: 'Aligner en haut' },
          { mode: 'centerV' as AlignMode, Icon: Move, title: 'Centrer verticalement' },
          { mode: 'bottom' as AlignMode, Icon: ArrowDownToLine, title: 'Aligner en bas' },
          { mode: 'center' as AlignMode, Icon: Maximize2, title: 'Centrer parfaitement' },
          { mode: 'centerH' as AlignMode, Icon: AlignLeft, title: 'Centrer horizontalement' },
        ].map(({ mode, Icon, title }, index) => (
          <button
            key={`${mode}-${index}`}
            type="button"
            onClick={() => onAlign(mode)}
            className={cx(
              'grid h-9 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-ink-300 transition-all hover:border-azure-500/45 hover:bg-azure-500/15 hover:text-white',
              mode === 'center' && index === 6 && 'col-span-2 bg-azure-500/20 text-white',
            )}
            title={title}
          >
            <Icon size={13.5} />
          </button>
        ))}
      </div>
      <p className="mb-4 text-[9px] text-ink-500">
        Canevas actuel : {doc.width} × {doc.height} px
      </p>

      {/* Ajustement d'image */}
      {layer.type === 'image' && (
        <>
          <SectionTitle>Ajustement de l'image</SectionTitle>
          <div className="mb-4 grid grid-cols-3 gap-1.5">
            {[
              { mode: 'cover' as FitMode, label: 'Remplir', icon: Maximize2 },
              { mode: 'contain' as FitMode, label: 'Contenir', icon: Crop },
              { mode: 'stretch' as FitMode, label: 'Étirer', icon: Move },
            ].map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onFit(mode)}
                className={cx(
                  'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-[9.5px] font-semibold transition-all',
                  layer.type === 'image' && layer.fit === mode
                    ? 'border-azure-400/60 bg-azure-500/20 text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-ink-300 hover:border-white/20 hover:bg-white/[0.07]',
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Texte */}
      {layer.type === 'text' && (
        <>
          <SectionTitle>Contenu du texte</SectionTitle>
          <textarea
            value={(layer as TextLayer).text}
            onChange={(event) => onUpdate(layer.id, { text: event.target.value })}
            rows={3}
            className="mb-2.5 w-full resize-none rounded-xl border border-white/[0.09] bg-white/[0.04] p-2.5 text-[11px] text-ink-100 outline-none transition-colors focus:border-azure-500/55"
            aria-label="Texte du calque"
          />

          <div className="mb-2.5 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Police
              </span>
              <select
                value={(layer as TextLayer).fontFamily}
                onChange={(event) => onUpdate(layer.id, { fontFamily: event.target.value })}
                className="rounded-lg border border-white/[0.09] bg-ink-800 px-2 py-2 text-[10px] text-ink-100 outline-none focus:border-azure-500/50"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font.replace(/"/g, '').split(',')[0]}
                  </option>
                ))}
              </select>
            </label>
            <NumberField
              label="Taille"
              value={(layer as TextLayer).fontSize}
              onChange={(v) => onUpdate(layer.id, { fontSize: Math.max(6, v) })}
            />
          </div>

          <div className="mb-2.5 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Graisse
              </span>
              <select
                value={(layer as TextLayer).fontWeight}
                onChange={(event) =>
                  onUpdate(layer.id, { fontWeight: Number(event.target.value) })
                }
                className="rounded-lg border border-white/[0.09] bg-ink-800 px-2 py-2 text-[10px] text-ink-100 outline-none focus:border-azure-500/50"
              >
                <option value={300}>Fin (300)</option>
                <option value={400}>Normal (400)</option>
                <option value={500}>Medium (500)</option>
                <option value={600}>Semi-gras (600)</option>
                <option value={700}>Gras (700)</option>
                <option value={800}>Extra-gras (800)</option>
                <option value={900}>Black (900)</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Alignement
              </span>
              <select
                value={(layer as TextLayer).align}
                onChange={(event) =>
                  onUpdate(layer.id, {
                    align: event.target.value as CanvasTextAlign,
                  })
                }
                className="rounded-lg border border-white/[0.09] bg-ink-800 px-2 py-2 text-[10px] text-ink-100 outline-none focus:border-azure-500/50"
              >
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
              </select>
            </label>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Couleur
              </span>
              <input
                type="color"
                value={(layer as TextLayer).color}
                onChange={(event) => onUpdate(layer.id, { color: event.target.value })}
                className="h-6 w-9"
              />
              <span className="text-[9px] font-medium tabular-nums text-ink-300">
                {(layer as TextLayer).color.toUpperCase()}
              </span>
            </label>
            <button
              type="button"
              onClick={() => onUpdate(layer.id, { italic: !(layer as TextLayer).italic })}
              className={cx(
                'h-[38px] w-11 rounded-lg border text-[13px] font-serif italic transition-colors',
                (layer as TextLayer).italic
                  ? 'border-azure-400/60 bg-azure-500/25 text-white'
                  : 'border-white/[0.08] bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]',
              )}
            >
              It
            </button>
            <button
              type="button"
              onClick={() => onUpdate(layer.id, { shadow: !(layer as TextLayer).shadow })}
              className={cx(
                'h-[38px] w-11 rounded-lg border text-[11px] font-bold transition-colors',
                (layer as TextLayer).shadow
                  ? 'border-azure-400/60 bg-azure-500/25 text-white'
                  : 'border-white/[0.08] bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]',
              )}
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
            >
              fx
            </button>
          </div>

          <div className="mb-4 flex items-center gap-2.5">
            <span className="w-[72px] text-[9px] font-semibold uppercase tracking-wider text-ink-500">
              Interlettrage
            </span>
            <input
              type="range"
              min={-10}
              max={60}
              value={(layer as TextLayer).letterSpacing}
              onChange={(event) =>
                onUpdate(layer.id, { letterSpacing: Number(event.target.value) })
              }
            />
            <span className="w-[36px] text-right text-[9.5px] font-semibold tabular-nums text-ink-300">
              {(layer as TextLayer).letterSpacing} px
            </span>
          </div>
        </>
      )}

      {/* Forme */}
      {layer.type === 'shape' && (
        <>
          <SectionTitle>Style de la forme</SectionTitle>

          <div className="mb-2.5 grid grid-cols-5 gap-1.5">
            {(['rect', 'ellipse', 'triangle', 'diamond', 'star'] as const).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => onUpdate(layer.id, { shape })}
                className={cx(
                  'grid h-9 place-items-center rounded-lg border text-[9px] font-semibold uppercase tracking-wide transition-all',
                  (layer as ShapeLayer).shape === shape
                    ? 'border-azure-400/60 bg-azure-500/22 text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]',
                )}
              >
                {shape === 'rect'
                  ? 'Rect'
                  : shape === 'ellipse'
                    ? 'Ovale'
                    : shape === 'triangle'
                      ? 'Tri'
                      : shape === 'diamond'
                        ? 'Los'
                        : 'Étoile'}
              </button>
            ))}
          </div>

          <div className="mb-2.5 grid grid-cols-3 gap-1.5">
            {(['solid', 'linear', 'radial'] as const).map((fillType) => (
              <button
                key={fillType}
                type="button"
                onClick={() => onUpdate(layer.id, { fillType })}
                className={cx(
                  'rounded-lg border py-2 text-[9px] font-semibold uppercase tracking-wider transition-all',
                  (layer as ShapeLayer).fillType === fillType
                    ? 'border-violet-soft/60 bg-violet-royal/25 text-white'
                    : 'border-white/[0.08] bg-white/[0.03] text-ink-300 hover:bg-white/[0.08]',
                )}
              >
                {fillType === 'solid' ? 'Uni' : fillType === 'linear' ? 'Linéaire' : 'Radial'}
              </button>
            ))}
          </div>

          <div className="mb-2.5 grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Couleur 1
              </span>
              <input
                type="color"
                value={(layer as ShapeLayer).fill}
                onChange={(event) => onUpdate(layer.id, { fill: event.target.value })}
                className="h-6 w-8"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Couleur 2
              </span>
              <input
                type="color"
                value={(layer as ShapeLayer).fill2}
                onChange={(event) => onUpdate(layer.id, { fill2: event.target.value })}
                className="h-6 w-8"
              />
            </label>
          </div>

          {(layer as ShapeLayer).fillType !== 'solid' && (
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="w-[72px] text-[9px] font-semibold uppercase tracking-wider text-ink-500">
                Angle
              </span>
              <input
                type="range"
                min={0}
                max={360}
                value={(layer as ShapeLayer).gradientAngle}
                onChange={(event) =>
                  onUpdate(layer.id, { gradientAngle: Number(event.target.value) })
                }
              />
              <span className="w-[36px] text-right text-[9.5px] font-semibold tabular-nums text-ink-300">
                {(layer as ShapeLayer).gradientAngle}°
              </span>
            </div>
          )}

          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="w-[72px] text-[9px] font-semibold uppercase tracking-wider text-ink-500">
              Arrondi
            </span>
            <input
              type="range"
              min={0}
              max={180}
              value={(layer as ShapeLayer).radius}
              onChange={(event) => onUpdate(layer.id, { radius: Number(event.target.value) })}
            />
            <span className="w-[36px] text-right text-[9.5px] font-semibold tabular-nums text-ink-300">
              {(layer as ShapeLayer).radius} px
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2">
              <span className="text-[8.5px] font-semibold uppercase tracking-wider text-ink-500">
                Contour
              </span>
              <input
                type="color"
                value={(layer as ShapeLayer).stroke}
                onChange={(event) => onUpdate(layer.id, { stroke: event.target.value })}
                className="h-6 w-8"
              />
            </label>
            <NumberField
              label="Ép."
              value={(layer as ShapeLayer).strokeWidth}
              onChange={(v) => onUpdate(layer.id, { strokeWidth: Math.max(0, v) })}
            />
          </div>
        </>
      )}

      {/* Aplat */}
      {layer.type === 'solid' && (
        <>
          <SectionTitle>Couleur unie</SectionTitle>
          <label className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <input
              type="color"
              value={layer.color}
              onChange={(event) => onUpdate(layer.id, { color: event.target.value })}
              className="h-11 w-16"
            />
            <div>
              <p className="text-[11px] font-semibold text-ink-100">{layer.color.toUpperCase()}</p>
              <p className="text-[9px] text-ink-500">
                Modifiez la teinte de l'aplat de fond
              </p>
            </div>
          </label>
        </>
      )}

      {/* Opacité rapide */}
      <div className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.028] p-3">
        <div className="flex items-center gap-2.5">
          <span className="w-[62px] text-[9px] font-semibold uppercase tracking-wider text-ink-500">
            Opacité
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={layer.opacity}
            onChange={(event) => onUpdate(layer.id, { opacity: Number(event.target.value) })}
          />
          <span className="w-[38px] text-right text-[10px] font-semibold tabular-nums text-ink-200">
            {Math.round(layer.opacity)} %
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <AlignLeft size={11} className="text-ink-500" />
          <AlignCenter size={11} className="text-ink-500" />
          <AlignRight size={11} className="text-ink-500" />
          <p className="text-[8.5px] text-ink-500">
            Utilisez les flèches du clavier pour décaler le calque pixel par pixel (Maj = 10 px).
          </p>
        </div>
      </div>
    </div>
  )
}

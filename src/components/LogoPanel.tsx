import { useMemo, useRef, useState } from 'react'
import { Download, ImagePlus, Search, Sparkles, Upload } from 'lucide-react'
import type { LogoAsset, LogoCategory } from '../lib/logos'
import { logoCategories, logos, svgToDataUrl } from '../lib/logos'
import { cx } from '../lib/utils'

interface LogoPanelProps {
  insertSize: number
  onInsertSizeChange: (size: number) => void
  onAddLogo: (logo: LogoAsset) => void
  onImportLogo: (file: File) => void
}

export default function LogoPanel({
  insertSize,
  onInsertSizeChange,
  onAddLogo,
  onImportLogo,
}: LogoPanelProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<LogoCategory | 'Tous'>('Tous')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return logos.filter((logo) => {
      const matchesCategory = category === 'Tous' || logo.category === category
      const matchesQuery =
        q.length === 0 ||
        logo.name.toLowerCase().includes(q) ||
        logo.category.toLowerCase().includes(q) ||
        logo.tags.some((tag) => tag.toLowerCase().includes(q))
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <div className="flex h-full flex-col">
      {/* En-tête */}
      <div className="border-b border-white/[0.07] bg-gradient-to-b from-azure-500/[0.09] to-transparent p-3.5">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles size={15} className="text-gold" />
          <h3 className="font-display text-[13px] font-bold text-white">
            Bibliothèque de logos Windows
          </h3>
        </div>
        <p className="mb-3 text-[10.5px] leading-relaxed text-ink-400">
          {logos.length} logos réels ou imaginaires, fonds transparents, prêts à glisser sur
          votre fond d'écran.
        </p>

        {/* Recherche */}
        <div className="relative mb-2.5">
          <Search
            size={13.5}
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-500"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un logo, un style…"
            className="w-full rounded-xl border border-white/[0.09] bg-white/[0.045] py-2 pr-3 pl-8 text-[11px] text-ink-100 outline-none transition-colors placeholder:text-ink-500 focus:border-azure-500/55 focus:bg-white/[0.075]"
          />
        </div>

        {/* Catégories */}
        <div className="scroll-slim flex gap-1.5 overflow-x-auto pb-1">
          {(['Tous', ...logoCategories] as Array<LogoCategory | 'Tous'>).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={cx(
                'shrink-0 rounded-full border px-2.5 py-1.5 text-[9.5px] font-semibold whitespace-nowrap transition-all',
                category === item
                  ? 'border-azure-400/60 bg-azure-500/25 text-white'
                  : 'border-white/[0.08] bg-white/[0.035] text-ink-300 hover:border-white/20 hover:bg-white/[0.08]',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Taille d'insertion */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-3.5 py-2.5">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-ink-400">
          Taille
        </span>
        <input
          type="range"
          min={8}
          max={100}
          value={insertSize}
          onChange={(event) => onInsertSizeChange(Number(event.target.value))}
        />
        <span className="w-[34px] text-right text-[10px] font-semibold tabular-nums text-ink-200">
          {insertSize} %
        </span>
      </div>

      {/* Grille */}
      <div className="scroll-slim flex-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-2.5 px-6 text-center">
            <Search size={24} className="text-ink-500" />
            <p className="text-[11px] text-ink-400">
              Aucun logo ne correspond à « {query} ». Essayez un autre mot-clé.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setCategory('Tous')
              }}
              className="btn-ghost rounded-lg px-3 py-1.5 text-[10.5px] font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((logo) => (
              <button
                key={logo.id}
                type="button"
                onClick={() => onAddLogo(logo)}
                className="logo-tile group flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.028] p-2.5 text-left"
                title={`Ajouter « ${logo.name} » au centre du canevas`}
              >
                <div className="checker relative flex h-[74px] w-full items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={svgToDataUrl(logo.svg)}
                    alt={logo.name}
                    className="h-[58px] w-[58px] object-contain transition-transform duration-300 group-hover:scale-110"
                    draggable={false}
                  />
                  <span className="absolute top-1.5 right-1.5 grid h-5 w-5 place-items-center rounded-full bg-azure-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <Download size={10} />
                  </span>
                </div>
                <div className="w-full">
                  <p className="truncate text-[9.5px] font-semibold text-ink-100">
                    {logo.name}
                  </p>
                  <p className="text-[8px] font-medium uppercase tracking-wider text-ink-500">
                    {logo.category}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Import custom */}
      <div className="border-t border-white/[0.07] p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImportLogo(file)
            event.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-semibold"
        >
          <Upload size={14} />
          Importer mon propre logo (PNG / SVG)
        </button>
        <p className="mt-2 flex items-start gap-1.5 text-[9px] leading-relaxed text-ink-500">
          <ImagePlus size={11} className="mt-[1px] shrink-0" />
          Les images avec fond transparent sont conservées telles quelles lors de l'export.
        </p>
      </div>
    </div>
  )
}

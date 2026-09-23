import {
  ChevronDown,
  ChevronUp,
  Download,
  Grid3x3,
  Image as ImageIcon,
  Maximize2,
  Minus,
  Monitor,
  Plus,
  Redo2,
  Save,
  Undo2,
} from 'lucide-react'
import type { DocSettings } from '../lib/types'
import { cx } from '../lib/utils'

interface TopBarProps {
  doc: DocSettings
  projectName: string
  onProjectNameChange: (value: string) => void
  zoom: number
  canUndo: boolean
  canRedo: boolean
  canInstall: boolean
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onActualSize: () => void
  onImportClick: () => void
  onExportClick: () => void
  onInstall: () => void
  onToggleGrid: () => void
  showGrid: boolean
}

export default function TopBar({
  doc,
  projectName,
  onProjectNameChange,
  zoom,
  canUndo,
  canRedo,
  canInstall,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onFitView,
  onActualSize,
  onImportClick,
  onExportClick,
  onInstall,
  onToggleGrid,
  showGrid,
}: TopBarProps) {
  return (
    <header className="relative z-30 flex h-[58px] shrink-0 items-center gap-3 border-b border-white/[0.07] bg-ink-900/95 px-4 backdrop-blur-xl">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-azure-500 to-violet-royal shadow-lg shadow-azure-600/25">
          <div className="grid grid-cols-2 gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-[7px] w-[7px] rounded-[2px] bg-white/95" />
            ))}
          </div>
        </div>
        <div className="hidden flex-col leading-none md:flex">
          <span className="font-display text-[15px] font-bold tracking-tight text-white">
            Pane Studio
          </span>
          <span className="text-[9.5px] font-medium uppercase tracking-[0.19em] text-azure-400">
            Wallpaper Lab
          </span>
        </div>
      </div>

      <div className="h-7 w-px bg-white/10" />

      {/* Project name */}
      <input
        value={projectName}
        onChange={(event) => onProjectNameChange(event.target.value)}
        className="w-[150px] rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-[12.5px] font-medium text-ink-200 transition-colors outline-none hover:border-white/10 hover:bg-white/[0.04] focus:border-azure-500/60 focus:bg-white/[0.06] lg:w-[190px]"
        aria-label="Nom du projet"
      />

      <div className="hidden items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 xl:flex">
        <Monitor size={13} className="text-ink-400" />
        <span className="text-[11px] font-semibold text-ink-200">
          {doc.width} × {doc.height}
        </span>
        <span className="text-[10px] text-ink-500">px</span>
      </div>

      <div className="flex-1" />

      {/* History */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="btn-ghost grid h-9 w-9 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-35"
          title="Annuler (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="btn-ghost grid h-9 w-9 place-items-center rounded-lg disabled:cursor-not-allowed disabled:opacity-35"
          title="Rétablir (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div className="h-7 w-px bg-white/10" />

      {/* Zoom */}
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
        <button
          type="button"
          onClick={onZoomOut}
          className="grid h-7 w-7 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Zoom arrière"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={onActualSize}
          className="min-w-[52px] rounded-lg px-1.5 py-1 text-[11px] font-semibold tabular-nums text-ink-100 transition-colors hover:bg-white/10"
          title="Taille réelle (100 %)"
        >
          {Math.round(zoom * 100)} %
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className="grid h-7 w-7 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Zoom avant"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          onClick={onFitView}
          className="grid h-7 w-7 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Ajuster à la fenêtre (Ctrl+0)"
        >
          <Maximize2 size={13.5} />
        </button>
      </div>

      <button
        type="button"
        onClick={onToggleGrid}
        className={cx(
          'grid h-9 w-9 place-items-center rounded-lg border transition-colors',
          showGrid
            ? 'border-azure-500/50 bg-azure-500/20 text-azure-300'
            : 'border-white/[0.08] bg-white/[0.03] text-ink-300 hover:bg-white/[0.08] hover:text-white',
        )}
        title="Afficher / masquer la grille"
      >
        <Grid3x3 size={16} />
      </button>

      <button
        type="button"
        onClick={onImportClick}
        className="btn-ghost flex h-9 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold"
      >
        <ImageIcon size={15} />
        <span className="hidden lg:inline">Importer</span>
      </button>

      {canInstall && (
        <button
          type="button"
          onClick={onInstall}
          className="btn-ghost flex h-9 items-center gap-2 rounded-lg border-mint/30 px-3 text-[12px] font-semibold text-mint"
          title="Installer Pane Studio comme application PC"
        >
          <Save size={15} />
          <span className="hidden xl:inline">Installer l'app</span>
          <ChevronUp size={13} className="hidden xl:inline" />
        </button>
      )}

      <button
        type="button"
        onClick={onExportClick}
        className="btn-primary flex h-9 items-center gap-2 rounded-lg px-4 text-[12.5px] font-semibold"
      >
        <Download size={15.5} />
        Exporter
        <ChevronDown size={13.5} className="opacity-80" />
      </button>
    </header>
  )
}

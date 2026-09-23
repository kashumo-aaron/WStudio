import {
  Download,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react'
import type {
  AlignMode,
  DocSettings,
  FitMode,
  Layer,
  PanelTab,
} from '../lib/types'
import type { LogoAsset } from '../lib/logos'
import type { BackgroundAsset } from '../lib/backgrounds'
import { cx } from '../lib/utils'
import LayersPanel from './LayersPanel'
import LogoPanel from './LogoPanel'
import PropertiesPanel from './PropertiesPanel'
import BackgroundPanel from './BackgroundPanel'
import ExportPanel from './ExportPanel'

interface RightPanelProps {
  tab: PanelTab
  onTabChange: (tab: PanelTab) => void
  layers: Layer[]
  selectedId: string | null
  doc: DocSettings
  insertSize: number
  onSelectLayer: (id: string) => void
  onUpdateLayer: (id: string, patch: Partial<Layer>) => void
  onDeleteLayer: (id: string) => void
  onDuplicateLayer: (id: string) => void
  onMoveLayer: (id: string, direction: -1 | 1) => void
  onToggleVisible: (id: string) => void
  onToggleLock: (id: string) => void
  onAddText: () => void
  onAddShape: () => void
  onAddSolid: () => void
  onAddLogo: (logo: LogoAsset) => void
  onImportLogo: (file: File) => void
  onInsertSizeChange: (size: number) => void
  onAlign: (mode: AlignMode) => void
  onFit: (mode: FitMode) => void
  onDocChange: (patch: Partial<DocSettings>) => void
  onAddBackground: (asset: BackgroundAsset) => void
  onGradientPreset: (preset: { name: string; from: string; to: string }) => void
  onImportClick: () => void
  onExport: (format: 'png' | 'jpeg' | 'webp', quality: number, scale: number) => void
}

const tabs: Array<{ id: PanelTab; label: string; Icon: typeof Layers }> = [
  { id: 'logos', label: 'Logos', Icon: LayoutGrid },
  { id: 'layers', label: 'Calques', Icon: Layers },
  { id: 'props', label: 'Propriétés', Icon: SlidersHorizontal },
  { id: 'background', label: 'Fond', Icon: ImageIcon },
  { id: 'export', label: 'Export', Icon: Download },
]

export default function RightPanel(props: RightPanelProps) {
  const {
    tab,
    onTabChange,
    layers,
    selectedId,
    doc,
    insertSize,
    onSelectLayer,
    onUpdateLayer,
    onDeleteLayer,
    onDuplicateLayer,
    onMoveLayer,
    onToggleVisible,
    onToggleLock,
    onAddText,
    onAddShape,
    onAddSolid,
    onAddLogo,
    onImportLogo,
    onInsertSizeChange,
    onAlign,
    onFit,
    onDocChange,
    onAddBackground,
    onGradientPreset,
    onImportClick,
    onExport,
  } = props

  const selectedLayer = layers.find((layer) => layer.id === selectedId) ?? null

  return (
    <aside className="flex w-[318px] shrink-0 flex-col border-l border-white/[0.07] bg-ink-900/95 lg:w-[352px]">
      {/* Onglets */}
      <div className="flex shrink-0 items-center gap-0.5 border-b border-white/[0.07] px-1.5 py-1.5">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cx(
              'tab-button flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[8.5px] font-semibold uppercase tracking-[0.09em]',
              tab === id ? 'active text-white' : 'text-ink-400 hover:bg-white/[0.05] hover:text-ink-200',
            )}
          >
            <Icon size={15} strokeWidth={1.9} />
            {label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex min-h-0 flex-1 flex-col">
        {tab === 'logos' && (
          <LogoPanel
            insertSize={insertSize}
            onInsertSizeChange={onInsertSizeChange}
            onAddLogo={onAddLogo}
            onImportLogo={onImportLogo}
          />
        )}

        {tab === 'layers' && (
          <LayersPanel
            layers={layers}
            selectedId={selectedId}
            onSelect={onSelectLayer}
            onUpdate={onUpdateLayer}
            onDelete={onDeleteLayer}
            onDuplicate={onDuplicateLayer}
            onMove={onMoveLayer}
            onToggleVisible={onToggleVisible}
            onToggleLock={onToggleLock}
            onAddText={onAddText}
            onAddShape={onAddShape}
            onAddSolid={onAddSolid}
          />
        )}

        {tab === 'props' && (
          <PropertiesPanel
            layer={selectedLayer}
            doc={doc}
            onUpdate={onUpdateLayer}
            onAlign={onAlign}
            onFit={onFit}
            onDuplicate={onDuplicateLayer}
            onDelete={onDeleteLayer}
          />
        )}

        {tab === 'background' && (
          <BackgroundPanel
            doc={doc}
            onDocChange={onDocChange}
            onAddBackground={onAddBackground}
            onGradientPreset={onGradientPreset}
            onImportClick={onImportClick}
          />
        )}

        {tab === 'export' && (
          <ExportPanel doc={doc} layerCount={layers.length} onExport={onExport} />
        )}
      </div>
    </aside>
  )
}

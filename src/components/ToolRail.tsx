import { Circle, Droplet, Hand, MousePointer2, Pipette, Square, Type, ZoomIn } from 'lucide-react'
import type { ToolId } from '../lib/types'
import { cx } from '../lib/utils'

interface ToolRailProps {
  tool: ToolId
  onToolChange: (tool: ToolId) => void
}

const tools: Array<{
  id: ToolId
  label: string
  shortcut: string
  Icon: typeof MousePointer2
}> = [
  { id: 'move', label: 'Déplacer / Sélectionner', shortcut: 'V', Icon: MousePointer2 },
  { id: 'rect', label: 'Rectangle', shortcut: 'U', Icon: Square },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', Icon: Circle },
  { id: 'text', label: 'Texte', shortcut: 'T', Icon: Type },
  { id: 'gradient', label: 'Dégradé', shortcut: 'G', Icon: Droplet },
  { id: 'pipette', label: 'Pipette', shortcut: 'I', Icon: Pipette },
  { id: 'hand', label: 'Main (déplacer la vue)', shortcut: 'H', Icon: Hand },
  { id: 'zoom', label: 'Zoom', shortcut: 'Z', Icon: ZoomIn },
]

export default function ToolRail({ tool, onToolChange }: ToolRailProps) {
  return (
    <aside className="flex w-[62px] shrink-0 flex-col items-center gap-1 border-r border-white/[0.07] bg-ink-900/95 py-3">
      <div className="mb-1 flex flex-col items-center gap-[3px]">
        <div className="h-[3px] w-7 rounded-full bg-gradient-to-r from-azure-400 to-violet-soft opacity-70" />
        <span className="text-[8.5px] font-semibold uppercase tracking-[0.16em] text-ink-400">
          Outils
        </span>
      </div>

      {tools.map(({ id, label, shortcut, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onToolChange(id)}
          className={cx('tool-button group', tool === id && 'active')}
          title={`${label} — raccourci ${shortcut}`}
        >
          <Icon size={19} strokeWidth={1.85} />
          <span className="pointer-events-none absolute left-[52px] z-50 hidden whitespace-nowrap rounded-lg border border-white/10 bg-ink-800 px-2.5 py-1.5 text-[11px] font-medium text-ink-100 shadow-xl group-hover:block">
            {label}
            <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[9.5px] text-ink-300">
              {shortcut}
            </span>
          </span>
        </button>
      ))}

      <div className="my-2 h-px w-7 bg-white/10" />

      <div className="flex flex-col items-center gap-1.5 px-1">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1.5">
          <div className="h-6 w-6 rounded-md border border-white/15" style={{ background: 'linear-gradient(135deg,#3aa2ff,#7c5cff)' }} />
          <div className="h-6 w-6 rounded-md border border-white/15 bg-white/80" />
        </div>
        <span className="text-[8px] font-medium uppercase tracking-wider text-ink-500">
          Couleurs
        </span>
      </div>
    </aside>
  )
}

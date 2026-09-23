import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Download,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  MonitorPlay,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react'

interface WelcomeModalProps {
  open: boolean
  onClose: () => void
  onImportClick: () => void
  onExploreLogos: () => void
  onOpenExport: () => void
}

const features = [
  {
    icon: LayoutGrid,
    title: 'Bibliothèque de logos Windows',
    description: '30 logos réels ou imaginaires, fonds transparents, ajoutés en un clic.',
  },
  {
    icon: Layers,
    title: 'Système de calques complet',
    description: 'Ordre, opacité, modes de fusion, verrouillage, duplication, annulation.',
  },
  {
    icon: Wand2,
    title: 'Import & centrage instantané',
    description: 'Importez un fond, centrez-le, alignez vos logos parfaitement sur le canevas.',
  },
  {
    icon: Download,
    title: 'Export haute définition',
    description: 'PNG, JPEG ou WebP jusqu’en 4K (ou 2×), prêt pour votre bureau Windows.',
  },
]

export default function WelcomeModal({
  open,
  onClose,
  onImportClick,
  onExploreLogos,
  onOpenExport,
}: WelcomeModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#04060d]/82 p-4 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[880px] overflow-hidden rounded-[26px] border border-white/[0.1] shadow-2xl shadow-black/60"
          >
            {/* Fond décoratif */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-azure-500/25 blur-[90px]" />
              <div className="absolute -right-24 -bottom-32 h-80 w-80 rounded-full bg-violet-royal/25 blur-[95px]" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-ink-200 transition-all hover:bg-white/[0.14] hover:text-white"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>

            <div className="relative grid gap-0 md:grid-cols-[1.08fr_0.92fr]">
              {/* Colonne gauche */}
              <div className="p-8 pb-6 md:p-10">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-azure-400/25 bg-azure-500/12 px-3.5 py-1.5">
                  <Sparkles size={12.5} className="text-gold" />
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.19em] text-azure-300">
                    Studio de fonds d'écran
                  </span>
                </div>

                <h1 className="font-display text-[36px] leading-[1.03] font-bold tracking-[-0.028em] text-white">
                  Créez des fonds
                  <br />
                  d'écran <span className="text-shine">d'exception</span>
                  <br />
                  pour votre PC.
                </h1>

                <p className="mt-4 max-w-[430px] text-[13px] leading-[1.72] text-ink-300">
                  Pane Studio réunit un éditeur multi-calques, une imposante bibliothèque de
                  logos Windows transparents et des outils de centrage précis — le tout
                  directement dans votre navigateur, installable comme une vraie application
                  Windows.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onImportClick}
                    className="btn-primary flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-[13px] font-semibold"
                  >
                    <ImageIcon size={17} />
                    Importer un fond
                  </button>
                  <button
                    type="button"
                    onClick={onExploreLogos}
                    className="btn-ghost flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-[12.5px] font-semibold"
                  >
                    Explorer les logos
                    <ArrowRight size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onOpenExport}
                  className="mt-3 flex items-center gap-2 text-[11px] font-medium text-ink-400 transition-colors hover:text-azure-300"
                >
                  <MonitorPlay size={13} />
                  Voir un exemple de composition exportable
                </button>
              </div>

              {/* Colonne droite */}
              <div className="relative border-t border-white/[0.08] bg-white/[0.028] p-7 md:border-t-0 md:border-l">
                <div className="mb-5 grid grid-cols-2 gap-2.5">
                  {[
                    { color: 'from-azure-400 to-azure-600', label: 'Calques' },
                    { color: 'from-violet-soft to-violet-royal', label: 'Logos' },
                    { color: 'from-mint to-azure-500', label: 'Dégradés' },
                    { color: 'from-gold to-coral', label: 'Export 4K' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.16 + index * 0.08, duration: 0.5 }}
                      className={`rounded-2xl bg-gradient-to-br ${item.color} p-3.5`}
                    >
                      <div className="h-1.5 w-8 rounded-full bg-white/40" />
                      <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.13em] text-white">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.09, duration: 0.5 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-[3px] grid h-7 w-7 shrink-0 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.055]">
                        <feature.icon size={12.5} className="text-azure-300" />
                      </div>
                      <div>
                        <p className="text-[10.5px] font-semibold text-white">
                          {feature.title}
                        </p>
                        <p className="mt-0.5 text-[9px] leading-[1.62] text-ink-400">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barre du bas */}
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] bg-white/[0.022] px-8 py-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                {[
                  ['V / U / T', 'Outils'],
                  ['Ctrl + Z', 'Annuler'],
                  ['Ctrl + D', 'Dupliquer'],
                  ['Ctrl + 0', 'Ajuster la vue'],
                  ['Ctrl + E', 'Exporter'],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <kbd className="rounded-md border border-white/10 bg-white/[0.07] px-1.5 py-0.5 text-[8.5px] font-semibold text-ink-200">
                      {key}
                    </kbd>
                    <span className="text-[8.5px] text-ink-500">{label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-white/[0.07] px-4 py-2 text-[10.5px] font-semibold text-white transition-colors hover:bg-white/[0.13]"
              >
                Commencer à créer
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

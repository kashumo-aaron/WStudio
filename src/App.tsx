import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Download,
  HardDriveDownload,
  Image as ImageIcon,
  Info,
  LayoutGrid,
  Layers,
  MousePointer2,
  Sparkles,
  Upload,
} from 'lucide-react'
import TopBar from './components/TopBar'
import ToolRail from './components/ToolRail'
import RightPanel from './components/RightPanel'
import WelcomeModal from './components/WelcomeModal'
import type {
  AlignMode,
  BeforeInstallPromptEvent,
  DocSettings,
  FitMode,
  ImageLayer,
  Layer,
  PanelTab,
  ShapeLayer,
  TextLayer,
  ToolId,
  ViewTransform,
} from './lib/types'
import type { LogoAsset } from './lib/logos'
import type { BackgroundAsset } from './lib/backgrounds'
import { logoDataUrl, svgToDataUrl } from './lib/logos'
import { sampleBackgrounds } from './lib/backgrounds'
import {
  HANDLES,
  getCachedImage,
  hitTestHandle,
  hitTestLayer,
  layerCenter,
  fromLayerSpace,
  loadImage,
  renderComposition,
  resizeLayer,
} from './lib/render'
import { clamp, degToRad, uid } from './lib/utils'

/* ------------------------------------------------------------------ */
/* État initial du projet                                              */
/* ------------------------------------------------------------------ */

function createInitialLayers(): Layer[] {
  return [
    {
      id: uid(),
      name: 'Dégradé de nuit',
      type: 'shape',
      shape: 'rect',
      x: 0,
      y: 0,
      width: 2560,
      height: 1440,
      rotation: 0,
      opacity: 100,
      blend: 'source-over',
      visible: true,
      locked: true,
      fillType: 'linear',
      fill: '#091029',
      fill2: '#3b1f74',
      gradientAngle: 42,
      stroke: 'transparent',
      strokeWidth: 0,
      radius: 0,
    } as ShapeLayer,
    {
      id: uid(),
      name: 'Nébuleuse (fond)',
      type: 'image',
      src: './backgrounds/space.jpg',
      fit: 'cover',
      naturalWidth: 1920,
      naturalHeight: 1080,
      x: 0,
      y: 0,
      width: 2560,
      height: 1440,
      rotation: 0,
      opacity: 62,
      blend: 'screen',
      visible: true,
      locked: false,
    } as ImageLayer,
    {
      id: uid(),
      name: 'Halo lumineux',
      type: 'shape',
      shape: 'ellipse',
      x: 2560 / 2 - 620,
      y: 1440 / 2 - 620,
      width: 1240,
      height: 1240,
      rotation: 0,
      opacity: 42,
      blend: 'screen',
      visible: true,
      locked: false,
      fillType: 'radial',
      fill: '#5ad6ff',
      fill2: '#2b6bff',
      gradientAngle: 0,
      stroke: 'transparent',
      strokeWidth: 0,
      radius: 0,
    } as ShapeLayer,
    {
      id: uid(),
      name: 'Logo holographique',
      type: 'image',
      src: logoDataUrl('holographique'),
      fit: 'stretch',
      naturalWidth: 512,
      naturalHeight: 512,
      x: 2560 / 2 - 265,
      y: 1440 / 2 - 385,
      width: 530,
      height: 530,
      rotation: 0,
      opacity: 100,
      blend: 'source-over',
      visible: true,
      locked: false,
    } as ImageLayer,
    {
      id: uid(),
      name: 'Titre principal',
      type: 'text',
      text: 'PANE STUDIO',
      fontFamily: '"Space Grotesk", sans-serif',
      fontSize: 132,
      fontWeight: 700,
      italic: false,
      color: '#ffffff',
      align: 'center',
      letterSpacing: 22,
      lineHeight: 1.16,
      shadow: true,
      x: (2560 - 1900) / 2,
      y: 1440 / 2 + 190,
      width: 1900,
      height: 190,
      rotation: 0,
      opacity: 96,
      blend: 'source-over',
      visible: true,
      locked: false,
    } as TextLayer,
    {
      id: uid(),
      name: 'Sous-titre',
      type: 'text',
      text: 'Bibliothèque de logos Windows · calques · export 4K',
      fontFamily: '"Inter", sans-serif',
      fontSize: 46,
      fontWeight: 500,
      italic: false,
      color: '#b7d9ff',
      align: 'center',
      letterSpacing: 3,
      lineHeight: 1.3,
      shadow: true,
      x: (2560 - 1900) / 2,
      y: 1440 / 2 + 388,
      width: 1900,
      height: 80,
      rotation: 0,
      opacity: 88,
      blend: 'source-over',
      visible: true,
      locked: false,
    } as TextLayer,
  ]
}

type Interaction =
  | {
      kind: 'pan'
      startScreenX: number
      startScreenY: number
      panX: number
      panY: number
    }
  | {
      kind: 'move'
      layerId: string
      startX: number
      startY: number
      origX: number
      origY: number
    }
  | {
      kind: 'resize'
      layerId: string
      handle: (typeof HANDLES)[number]
      keepAspect: boolean
    }
  | {
      kind: 'rotate'
      layerId: string
      center: { x: number; y: number }
      startAngle: number
      startRotation: number
    }
  | {
      kind: 'create-shape'
      layerId: string
      startX: number
      startY: number
    }

/* ------------------------------------------------------------------ */

export default function App() {
  /* ------------------------------ état ------------------------------ */
  const [doc, setDoc] = useState<DocSettings>({
    width: 2560,
    height: 1440,
    background: '#070b18',
    showGrid: true,
    snapToGrid: true,
  })
  const [layers, setLayers] = useState<Layer[]>(() => createInitialLayers())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<ToolId>('move')
  const [view, setView] = useState<ViewTransform>({ zoom: 0.28, panX: 90, panY: 60 })
  const [viewport, setViewport] = useState({ width: 1200, height: 800, dpr: 1 })
  const [activeTab, setActiveTab] = useState<PanelTab>('logos')
  const [insertSize, setInsertSize] = useState(28)
  const [projectName, setProjectName] = useState('Mon fond d\'écran Windows')
  const [welcomeOpen, setWelcomeOpen] = useState(true)
  const [renderTick, setRenderTick] = useState(0)
  const [historyIndex, setHistoryIndex] = useState(0)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [toast, setToast] = useState<{ message: string; tone: 'info' | 'success' } | null>(null)

  /* ------------------------------ refs ------------------------------ */
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const interactionRef = useRef<Interaction | null>(null)
  const spaceRef = useRef(false)

  const layersRef = useRef<Layer[]>(layers)
  layersRef.current = layers
  const docRef = useRef<DocSettings>(doc)
  docRef.current = doc
  const viewRef = useRef<ViewTransform>(view)
  viewRef.current = view
  const selectedRef = useRef<string | null>(selectedId)
  selectedRef.current = selectedId
  const toolRef = useRef<ToolId>(tool)
  toolRef.current = tool

  const historyRef = useRef<Layer[][]>([JSON.parse(JSON.stringify(layers)) as Layer[]])
  const historyIndexRef = useRef(0)

  /* ---------------------------- utilitaires ------------------------ */
  const showToast = useCallback((message: string, tone: 'info' | 'success' = 'success') => {
    setToast({ message, tone })
    window.setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current))
    }, 3200)
  }, [])

  const pushHistory = useCallback(() => {
    const snapshot = JSON.parse(JSON.stringify(layersRef.current)) as Layer[]
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1)
    trimmed.push(snapshot)
    const capped = trimmed.slice(-60)
    historyRef.current = capped
    historyIndexRef.current = capped.length - 1
    setHistoryIndex(capped.length - 1)
  }, [])

  const undo = useCallback(() => {
    const index = historyIndexRef.current
    if (index <= 0) return
    const target = historyRef.current[index - 1]
    if (!target) return
    historyIndexRef.current = index - 1
    setHistoryIndex(index - 1)
    setLayers(JSON.parse(JSON.stringify(target)) as Layer[])
  }, [])

  const redo = useCallback(() => {
    const index = historyIndexRef.current
    const history = historyRef.current
    if (index >= history.length - 1) return
    const target = history[index + 1]
    if (!target) return
    historyIndexRef.current = index + 1
    setHistoryIndex(index + 1)
    setLayers(JSON.parse(JSON.stringify(target)) as Layer[])
  }, [])

  const updateLayer = useCallback(
    (id: string, patch: Partial<Layer>, registerHistory = true) => {
      if (registerHistory) pushHistory()
      setLayers((current) =>
        current.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as Layer) : layer)),
      )
    },
    [pushHistory],
  )

  const updateLayerQuiet = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers((current) =>
      current.map((layer) => (layer.id === id ? ({ ...layer, ...patch } as Layer) : layer)),
    )
  }, [])

  /* ------------------------------ rendu ---------------------------- */
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const measure = () => {
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      setViewport({ width: rect.width, height: rect.height, dpr })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { dpr } = viewport
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, viewport.width, viewport.height)

    // Arrière-plan de l'espace de travail
    const workspace = ctx.createLinearGradient(0, 0, viewport.width, viewport.height)
    workspace.addColorStop(0, '#121728')
    workspace.addColorStop(0.5, '#0c1020')
    workspace.addColorStop(1, '#0a0d18')
    ctx.fillStyle = workspace
    ctx.fillRect(0, 0, viewport.width, viewport.height)

    ctx.translate(view.panX, view.panY)
    ctx.scale(view.zoom, view.zoom)

    // Ombre du canevas
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.58)'
    ctx.shadowBlur = 46 / view.zoom
    ctx.shadowOffsetY = 22 / view.zoom
    ctx.fillStyle = doc.background
    ctx.fillRect(0, 0, doc.width, doc.height)
    ctx.restore()

    // Grille
    if (doc.showGrid) {
      const step = 160
      ctx.save()
      ctx.lineWidth = 1 / view.zoom
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.075)'
      for (let x = 0; x <= doc.width; x += step) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, doc.height)
        ctx.stroke()
      }
      for (let y = 0; y <= doc.height; y += step) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(doc.width, y)
        ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(88, 178, 255, 0.42)'
      ctx.setLineDash([10 / view.zoom, 8 / view.zoom])
      ctx.beginPath()
      ctx.moveTo(doc.width / 2, 0)
      ctx.lineTo(doc.width / 2, doc.height)
      ctx.moveTo(0, doc.height / 2)
      ctx.lineTo(doc.width, doc.height / 2)
      ctx.stroke()
      ctx.restore()
    }

    renderComposition(ctx, layers, doc.width, doc.height)

    // Bordure du canevas
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
    ctx.lineWidth = 1.4 / view.zoom
    ctx.strokeRect(0, 0, doc.width, doc.height)
    ctx.restore()

    // Sélection
    const selected = layers.find((layer) => layer.id === selectedId)
    if (selected && selected.visible) {
      ctx.save()
      ctx.translate(selected.x + selected.width / 2, selected.y + selected.height / 2)
      ctx.rotate(degToRad(selected.rotation))

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.72)'
      ctx.lineWidth = 3.6 / view.zoom
      ctx.strokeRect(
        -selected.width / 2,
        -selected.height / 2,
        selected.width,
        selected.height,
      )
      ctx.strokeStyle = '#4cc2ff'
      ctx.lineWidth = 1.5 / view.zoom
      ctx.strokeRect(
        -selected.width / 2,
        -selected.height / 2,
        selected.width,
        selected.height,
      )

      const handleSize = 9 / view.zoom
      HANDLES.forEach((handle) => {
        const hx = (handle.sx * selected.width) / 2
        const hy = (handle.sy * selected.height) / 2
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#2f86e8'
        ctx.lineWidth = 1.6 / view.zoom
        ctx.beginPath()
        ctx.rect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize)
        ctx.fill()
        ctx.stroke()
      })

      const rotateY = -selected.height / 2 - 38 / view.zoom
      ctx.beginPath()
      ctx.moveTo(0, -selected.height / 2)
      ctx.lineTo(0, rotateY + 9 / view.zoom)
      ctx.strokeStyle = 'rgba(76, 194, 255, 0.85)'
      ctx.lineWidth = 1.5 / view.zoom
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, rotateY, 8.5 / view.zoom, 0, Math.PI * 2)
      ctx.fillStyle = '#4cc2ff'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 1.4 / view.zoom
      ctx.stroke()

      ctx.restore()
    }
  }, [layers, view, doc, viewport, selectedId, renderTick])

  /* ------------------------- préchargement -------------------------- */
  useEffect(() => {
    layers.forEach((layer) => {
      if (layer.type === 'image') {
        loadImage(layer.src)
          .then(() => setRenderTick((tick) => tick + 1))
          .catch(() => undefined)
      }
    })
  }, [layers])

  useEffect(() => {
    sampleBackgrounds.forEach((bg) => {
      loadImage(bg.src).catch(() => undefined)
    })
  }, [])

  /* ------------------------------ zoom ------------------------------ */
  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    setView((current) => {
      const zoom = clamp(current.zoom * factor, 0.035, 16)
      const ratio = zoom / current.zoom
      return {
        zoom,
        panX: screenX - (screenX - current.panX) * ratio,
        panY: screenY - (screenY - current.panY) * ratio,
      }
    })
  }, [])

  const fitView = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const currentDoc = docRef.current
    const zoom = Math.min(
      rect.width / currentDoc.width,
      rect.height / currentDoc.height,
    ) * 0.9
    setView({
      zoom,
      panX: (rect.width - currentDoc.width * zoom) / 2,
      panY: (rect.height - currentDoc.height * zoom) / 2,
    })
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(fitView, 120)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------ molette --------------------------- */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (event.ctrlKey || event.metaKey) {
        zoomAt(x, y, event.deltaY < 0 ? 1.12 : 1 / 1.12)
      } else {
        setView((current) => ({
          ...current,
          panX: current.panX - event.deltaX,
          panY: current.panY - event.deltaY,
        }))
      }
    }

    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  /* ------------------------- interactions --------------------------- */
  const screenToDoc = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0, screenX: 0, screenY: 0 }
    const rect = canvas.getBoundingClientRect()
    const screenX = clientX - rect.left
    const screenY = clientY - rect.top
    return {
      x: (screenX - viewRef.current.panX) / viewRef.current.zoom,
      y: (screenY - viewRef.current.panY) / viewRef.current.zoom,
      screenX,
      screenY,
    }
  }, [])

  const createShapeAt = useCallback(
    (
      startX: number,
      startY: number,
      shape: 'rect' | 'ellipse',
      fillType: 'solid' | 'linear',
    ) => {
      const id = uid()
      const layer: ShapeLayer = {
        id,
        name: shape === 'ellipse' ? 'Ellipse' : fillType === 'linear' ? 'Dégradé' : 'Rectangle',
        type: 'shape',
        shape,
        x: startX - 120,
        y: startY - 120,
        width: 240,
        height: 240,
        rotation: 0,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        locked: false,
        fillType,
        fill: fillType === 'linear' ? '#3aa2ff' : '#5b7cff',
        fill2: fillType === 'linear' ? '#7c5cff' : '#5b7cff',
        gradientAngle: 45,
        stroke: 'transparent',
        strokeWidth: 0,
        radius: shape === 'ellipse' ? 0 : 22,
      }
      pushHistory()
      setLayers((current) => [...current, layer])
      setSelectedId(id)
      interactionRef.current = {
        kind: 'create-shape',
        layerId: id,
        startX,
        startY,
      }
    },
    [pushHistory],
  )

  const createTextAt = useCallback(
    (x: number, y: number) => {
      const id = uid()
      const layer: TextLayer = {
        id,
        name: 'Nouveau texte',
        type: 'text',
        text: 'Votre texte',
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 96,
        fontWeight: 700,
        italic: false,
        color: '#ffffff',
        align: 'center',
        letterSpacing: 2,
        lineHeight: 1.25,
        shadow: true,
        x: x - 500,
        y: y - 70,
        width: 1000,
        height: 140,
        rotation: 0,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        locked: false,
      }
      pushHistory()
      setLayers((current) => [...current, layer])
      setSelectedId(id)
      setTool('move')
      setActiveTab('props')
      showToast('Calque de texte ajouté — personnalisez-le dans « Propriétés ».')
    },
    [pushHistory, showToast],
  )

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.setPointerCapture(event.pointerId)
      const point = screenToDoc(event.clientX, event.clientY)
      const currentTool = toolRef.current

      // Pan
      if (currentTool === 'hand' || event.button === 1 || spaceRef.current) {
        interactionRef.current = {
          kind: 'pan',
          startScreenX: point.screenX,
          startScreenY: point.screenY,
          panX: viewRef.current.panX,
          panY: viewRef.current.panY,
        }
        return
      }

      if (currentTool === 'zoom') {
        zoomAt(point.screenX, point.screenY, event.altKey ? 1 / 1.4 : 1.4)
        return
      }

      if (currentTool === 'pipette') {
        const canvasCtx = canvas.getContext('2d')
        if (canvasCtx) {
          const pixel = canvasCtx.getImageData(
            Math.round(point.x * viewRef.current.zoom + viewRef.current.panX),
            Math.round(point.y * viewRef.current.zoom + viewRef.current.panY),
            1,
            1,
          ).data
          const hex = `#${[pixel[0], pixel[1], pixel[2]]
            .map((value) => value.toString(16).padStart(2, '0'))
            .join('')}`
          showToast(`Couleur prélevée : ${hex.toUpperCase()}`, 'info')
        }
        return
      }

      if (currentTool === 'rect' || currentTool === 'ellipse' || currentTool === 'gradient') {
        createShapeAt(
          point.x,
          point.y,
          currentTool === 'ellipse' ? 'ellipse' : 'rect',
          currentTool === 'gradient' ? 'linear' : 'solid',
        )
        return
      }

      if (currentTool === 'text') {
        createTextAt(point.x, point.y)
        return
      }

      // Outils de sélection : poignées du calque sélectionné
      const selected = layersRef.current.find((layer) => layer.id === selectedRef.current)
      if (selected && selected.visible && !selected.locked) {
        const tolerance = 10 / viewRef.current.zoom
        const rotateAnchor = fromLayerSpace(
          selected,
          0,
          -selected.height / 2 - 38 / viewRef.current.zoom,
        )
        if (
          Math.hypot(rotateAnchor.x - point.x, rotateAnchor.y - point.y) <=
          tolerance * 1.9
        ) {
          const center = layerCenter(selected)
          pushHistory()
          interactionRef.current = {
            kind: 'rotate',
            layerId: selected.id,
            center,
            startAngle: Math.atan2(point.y - center.y, point.x - center.x),
            startRotation: selected.rotation,
          }
          return
        }

        const handle = HANDLES.find((item) =>
          hitTestHandle(selected, item, point.x, point.y, tolerance),
        )
        if (handle) {
          pushHistory()
          interactionRef.current = {
            kind: 'resize',
            layerId: selected.id,
            handle,
            keepAspect: event.shiftKey,
          }
          return
        }
      }

      // Test de collision sur les calques (du haut vers le bas)
      const stack = layersRef.current
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        const layer = stack[index]
        if (!layer.visible || layer.locked) continue
        if (hitTestLayer(layer, point.x, point.y)) {
          setSelectedId(layer.id)
          pushHistory()
          interactionRef.current = {
            kind: 'move',
            layerId: layer.id,
            startX: point.x,
            startY: point.y,
            origX: layer.x,
            origY: layer.y,
          }
          return
        }
      }

      setSelectedId(null)
    },
    [createShapeAt, createTextAt, pushHistory, screenToDoc, showToast, zoomAt],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const interaction = interactionRef.current
      if (!interaction) return
      const point = screenToDoc(event.clientX, event.clientY)

      switch (interaction.kind) {
        case 'pan': {
          setView((current) => ({
            ...current,
            panX: interaction.panX + (point.screenX - interaction.startScreenX),
            panY: interaction.panY + (point.screenY - interaction.startScreenY),
          }))
          break
        }
        case 'move': {
          const layer = layersRef.current.find((item) => item.id === interaction.layerId)
          if (!layer) break
          let dx = point.x - interaction.startX
          let dy = point.y - interaction.startY
          if (docRef.current.snapToGrid) {
            const threshold = 10 / viewRef.current.zoom
            const targetCenterX = interaction.origX + dx + layer.width / 2
            const targetCenterY = interaction.origY + dy + layer.height / 2
            if (Math.abs(targetCenterX - docRef.current.width / 2) < threshold) {
              dx = docRef.current.width / 2 - layer.width / 2 - interaction.origX
            }
            if (Math.abs(targetCenterY - docRef.current.height / 2) < threshold) {
              dy = docRef.current.height / 2 - layer.height / 2 - interaction.origY
            }
          }
          updateLayerQuiet(interaction.layerId, {
            x: interaction.origX + dx,
            y: interaction.origY + dy,
          })
          break
        }
        case 'resize': {
          const layer = layersRef.current.find((item) => item.id === interaction.layerId)
          if (!layer) break
          const next = resizeLayer(
            layer,
            interaction.handle,
            point.x,
            point.y,
            event.shiftKey || interaction.keepAspect,
          )
          updateLayerQuiet(interaction.layerId, next)
          break
        }
        case 'rotate': {
          const angle = Math.atan2(
            point.y - interaction.center.y,
            point.x - interaction.center.x,
          )
          let degrees =
            interaction.startRotation +
            ((angle - interaction.startAngle) * 180) / Math.PI
          if (event.shiftKey) degrees = Math.round(degrees / 15) * 15
          updateLayerQuiet(interaction.layerId, {
            rotation: Math.round(degrees * 10) / 10,
          })
          break
        }
        case 'create-shape': {
          const x = Math.min(interaction.startX, point.x)
          const y = Math.min(interaction.startY, point.y)
          const width = Math.abs(point.x - interaction.startX)
          const height = Math.abs(point.y - interaction.startY)
          updateLayerQuiet(interaction.layerId, {
            x,
            y,
            width: Math.max(16, width),
            height: Math.max(16, height),
          })
          break
        }
        default:
          break
      }
    },
    [screenToDoc, updateLayerQuiet],
  )

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }
    interactionRef.current = null
  }, [])

  /* ------------------------- ajout de contenu ----------------------- */
  const addImageLayer = useCallback(
    (src: string, name: string, options?: { cover?: boolean; natural?: { w: number; h: number } }) => {
      const currentDoc = docRef.current
      const id = uid()
      const layer: ImageLayer = {
        id,
        name,
        type: 'image',
        src,
        fit: options?.cover ? 'cover' : 'stretch',
        naturalWidth: options?.natural?.w ?? 1024,
        naturalHeight: options?.natural?.h ?? 1024,
        x: 0,
        y: 0,
        width: currentDoc.width,
        height: currentDoc.height,
        rotation: 0,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        locked: false,
      }
      pushHistory()
      setLayers((current) => [...current, layer])
      setSelectedId(id)
      loadImage(src)
        .then(() => setRenderTick((tick) => tick + 1))
        .catch(() => undefined)
      return id
    },
    [pushHistory],
  )

  const handleAddLogo = useCallback(
    (logo: LogoAsset) => {
      const currentDoc = docRef.current
      const id = uid()
      const size = Math.round(Math.min(currentDoc.width, currentDoc.height) * (insertSize / 100))
      const layer: ImageLayer = {
        id,
        name: logo.name,
        type: 'image',
        src: svgToDataUrl(logo.svg),
        fit: 'stretch',
        naturalWidth: 512,
        naturalHeight: 512,
        x: Math.round((currentDoc.width - size) / 2),
        y: Math.round((currentDoc.height - size) / 2),
        width: size,
        height: size,
        rotation: 0,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        locked: false,
      }
      pushHistory()
      setLayers((current) => [...current, layer])
      setSelectedId(id)
      setActiveTab('props')
      loadImage(layer.src)
        .then(() => setRenderTick((tick) => tick + 1))
        .catch(() => undefined)
      showToast(`« ${logo.name} » ajouté et centré sur le canevas.`)
    },
    [insertSize, pushHistory, showToast],
  )

  const handleAddBackground = useCallback(
    (asset: BackgroundAsset) => {
      const currentDoc = docRef.current
      const id = uid()
      const layer: ImageLayer = {
        id,
        name: `Fond — ${asset.name}`,
        type: 'image',
        src: asset.src,
        fit: 'cover',
        naturalWidth: 1920,
        naturalHeight: 1080,
        x: 0,
        y: 0,
        width: currentDoc.width,
        height: currentDoc.height,
        rotation: 0,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        locked: false,
      }
      pushHistory()
      setLayers((current) => [layer, ...current])
      setSelectedId(id)
      loadImage(asset.src)
        .then(() => setRenderTick((tick) => tick + 1))
        .catch(() => undefined)
      showToast(`Fond « ${asset.name} » importé et ajusté au canevas.`)
    },
    [pushHistory, showToast],
  )

  const handleGradientPreset = useCallback(
    (preset: { name: string; from: string; to: string }) => {
      const currentDoc = docRef.current
      const id = uid()
      const layer: ShapeLayer = {
        id,
        name: `Dégradé — ${preset.name}`,
        type: 'shape',
        shape: 'rect',
        x: 0,
        y: 0,
        width: currentDoc.width,
        height: currentDoc.height,
        rotation: 0,
        opacity: 100,
        blend: 'source-over',
        visible: true,
        locked: false,
        fillType: 'linear',
        fill: preset.from,
        fill2: preset.to,
        gradientAngle: 45,
        stroke: 'transparent',
        strokeWidth: 0,
        radius: 0,
      }
      pushHistory()
      setLayers((current) => [layer, ...current])
      setSelectedId(id)
      showToast(`Dégradé « ${preset.name} » ajouté en fond de pile.`)
    },
    [pushHistory, showToast],
  )

  /* ------------------------------ import ---------------------------- */
  const processImportedFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const src = String(reader.result ?? '')
        const probe = new Image()
        probe.onload = () => {
          const currentDoc = docRef.current
          const id = uid()
          const scale = Math.max(
            currentDoc.width / probe.width,
            currentDoc.height / probe.height,
          )
          const layer: ImageLayer = {
            id,
            name: file.name.replace(/\.[^.]+$/, '').slice(0, 32) || 'Image importée',
            type: 'image',
            src,
            fit: 'stretch',
            naturalWidth: probe.width,
            naturalHeight: probe.height,
            x: Math.round((currentDoc.width - probe.width * scale) / 2),
            y: Math.round((currentDoc.height - probe.height * scale) / 2),
            width: Math.round(probe.width * scale),
            height: Math.round(probe.height * scale),
            rotation: 0,
            opacity: 100,
            blend: 'source-over',
            visible: true,
            locked: false,
          }
          pushHistory()
          setLayers((current) => [...current, layer])
          setSelectedId(id)
          setActiveTab('props')
          loadImage(src)
            .then(() => setRenderTick((tick) => tick + 1))
            .catch(() => undefined)
          showToast(`« ${layer.name} » importé, centré et ajusté au canevas.`)
        }
        probe.src = src
      }
      reader.readAsDataURL(file)
    },
    [pushHistory, showToast],
  )

  const handleImportLogoFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        const src = String(reader.result ?? '')
        const probe = new Image()
        probe.onload = () => {
          const currentDoc = docRef.current
          const size = Math.round(
            Math.min(currentDoc.width, currentDoc.height) * (insertSize / 100),
          )
          const id = uid()
          const layer: ImageLayer = {
            id,
            name: file.name.replace(/\.[^.]+$/, '').slice(0, 28) || 'Logo personnalisé',
            type: 'image',
            src,
            fit: 'contain',
            naturalWidth: probe.width,
            naturalHeight: probe.height,
            x: Math.round((currentDoc.width - size) / 2),
            y: Math.round((currentDoc.height - size) / 2),
            width: size,
            height: size,
            rotation: 0,
            opacity: 100,
            blend: 'source-over',
            visible: true,
            locked: false,
          }
          pushHistory()
          setLayers((current) => [...current, layer])
          setSelectedId(id)
          loadImage(src)
            .then(() => setRenderTick((tick) => tick + 1))
            .catch(() => undefined)
          showToast('Logo personnalisé ajouté au centre du canevas.')
        }
        probe.src = src
      }
      reader.readAsDataURL(file)
    },
    [insertSize, pushHistory, showToast],
  )

  useEffect(() => {
    const listener = (event: Event) => {
      const file = (event as CustomEvent<File>).detail
      if (file instanceof File) processImportedFile(file)
    }
    window.addEventListener('pane:import-file', listener)
    return () => window.removeEventListener('pane:import-file', listener)
  }, [processImportedFile])

  /* ------------------------------ export ---------------------------- */
  const handleExport = useCallback(
    (format: 'png' | 'jpeg' | 'webp', quality: number, scale: number) => {
      const currentDoc = docRef.current
      const offscreen = document.createElement('canvas')
      offscreen.width = Math.round(currentDoc.width * scale)
      offscreen.height = Math.round(currentDoc.height * scale)
      const ctx = offscreen.getContext('2d')
      if (!ctx) return
      ctx.scale(scale, scale)
      ctx.fillStyle = currentDoc.background
      ctx.fillRect(0, 0, currentDoc.width, currentDoc.height)
      renderComposition(ctx, layersRef.current, currentDoc.width, currentDoc.height)

      const mime =
        format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp'
      const url = offscreen.toDataURL(mime, quality)
      const link = document.createElement('a')
      link.href = url
      link.download = `${projectName.replace(/[^\w\-]+/g, '-').toLowerCase()}-${currentDoc.width}x${currentDoc.height}.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      showToast(`Fond d'écran exporté en ${format.toUpperCase()} (${currentDoc.width} × ${currentDoc.height}).`)
    },
    [projectName, showToast],
  )

  /* --------------------------- opérations calque -------------------- */
  const deleteLayer = useCallback(
    (id: string) => {
      pushHistory()
      setLayers((current) => current.filter((layer) => layer.id !== id))
      setSelectedId((current) => (current === id ? null : current))
    },
    [pushHistory],
  )

  const duplicateLayer = useCallback(
    (id: string) => {
      const layer = layersRef.current.find((item) => item.id === id)
      if (!layer) return
      const copy: Layer = {
        ...JSON.parse(JSON.stringify(layer)),
        id: uid(),
        name: `${layer.name} (copie)`,
        x: layer.x + 28,
        y: layer.y + 28,
      } as Layer
      pushHistory()
      setLayers((current) => [...current, copy])
      setSelectedId(copy.id)
      showToast('Calque dupliqué.')
    },
    [pushHistory, showToast],
  )

  const moveLayer = useCallback(
    (id: string, direction: -1 | 1) => {
      const stack = [...layersRef.current]
      const index = stack.findIndex((layer) => layer.id === id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= stack.length) return
      const [item] = stack.splice(index, 1)
      stack.splice(target, 0, item)
      pushHistory()
      setLayers(stack)
    },
    [pushHistory],
  )

  const toggleVisible = useCallback(
    (id: string) => {
      const layer = layersRef.current.find((item) => item.id === id)
      if (!layer) return
      updateLayer(id, { visible: !layer.visible })
    },
    [updateLayer],
  )

  const toggleLock = useCallback(
    (id: string) => {
      const layer = layersRef.current.find((item) => item.id === id)
      if (!layer) return
      updateLayer(id, { locked: !layer.locked })
    },
    [updateLayer],
  )

  const alignLayer = useCallback(
    (mode: AlignMode) => {
      const id = selectedRef.current
      if (!id) {
        showToast('Sélectionnez d\'abord un calque à aligner.', 'info')
        return
      }
      const layer = layersRef.current.find((item) => item.id === id)
      if (!layer) {
        showToast('Sélectionnez d\'abord un calque à aligner.', 'info')
        return
      }
      const currentDoc = docRef.current
      const patch: Partial<Layer> = {}
      switch (mode) {
        case 'left':
          patch.x = 0
          break
        case 'centerH':
          patch.x = Math.round((currentDoc.width - layer.width) / 2)
          break
        case 'right':
          patch.x = currentDoc.width - layer.width
          break
        case 'top':
          patch.y = 0
          break
        case 'centerV':
          patch.y = Math.round((currentDoc.height - layer.height) / 2)
          break
        case 'bottom':
          patch.y = currentDoc.height - layer.height
          break
        case 'center':
          patch.x = Math.round((currentDoc.width - layer.width) / 2)
          patch.y = Math.round((currentDoc.height - layer.height) / 2)
          break
        default:
          break
      }
      updateLayer(id, patch)
    },
    [showToast, updateLayer],
  )

  const fitLayer = useCallback(
    (mode: FitMode) => {
      const id = selectedRef.current
      if (!id) return
      const layer = layersRef.current.find((item) => item.id === id)
      if (!layer) return
      if (layer.type !== 'image') {
        showToast('L\'ajustement automatique s\'applique aux calques image.', 'info')
        return
      }
      const currentDoc = docRef.current
      if (mode === 'stretch') {
        updateLayer(id, {
          x: 0,
          y: 0,
          width: currentDoc.width,
          height: currentDoc.height,
          fit: 'stretch',
        })
        return
      }
      const ratio =
        mode === 'cover'
          ? Math.max(
              currentDoc.width / Math.max(1, layer.naturalWidth),
              currentDoc.height / Math.max(1, layer.naturalHeight),
            )
          : Math.min(
              currentDoc.width / Math.max(1, layer.naturalWidth),
              currentDoc.height / Math.max(1, layer.naturalHeight),
            )
      const width = layer.naturalWidth * ratio
      const height = layer.naturalHeight * ratio
      updateLayer(id, {
        x: Math.round((currentDoc.width - width) / 2),
        y: Math.round((currentDoc.height - height) / 2),
        width: Math.round(width),
        height: Math.round(height),
        fit: 'stretch',
      })
      showToast(mode === 'cover' ? 'Image ajustée pour remplir le canevas.' : 'Image ajustée et centrée dans le canevas.')
    },
    [showToast, updateLayer],
  )

  const nudgeSelected = useCallback(
    (dx: number, dy: number) => {
      const id = selectedRef.current
      if (!id) return
      const layer = layersRef.current.find((item) => item.id === id)
      if (!layer || layer.locked) return
      updateLayer(id, { x: layer.x + dx, y: layer.y + dy }, false)
    },
    [updateLayer],
  )

  /* ------------------------------ clavier --------------------------- */
  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      const element = target as HTMLElement | null
      if (!element) return false
      const tag = element.tagName
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        element.isContentEditable
      )
    }

    const toolKeys: Record<string, ToolId> = {
      v: 'move',
      u: 'rect',
      o: 'ellipse',
      t: 'text',
      g: 'gradient',
      i: 'pipette',
      h: 'hand',
      z: 'zoom',
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      const key = event.key.toLowerCase()
      const modifier = event.ctrlKey || event.metaKey

      if (modifier && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if (modifier && key === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (modifier && key === 'd') {
        event.preventDefault()
        if (selectedRef.current) duplicateLayer(selectedRef.current)
        return
      }
      if (modifier && key === 'e') {
        event.preventDefault()
        setActiveTab('export')
        return
      }
      if (modifier && key === '0') {
        event.preventDefault()
        fitView()
        return
      }
      if (modifier && key === '=') {
        event.preventDefault()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) zoomAt(rect.width / 2, rect.height / 2, 1.25)
        return
      }
      if (modifier && key === '-') {
        event.preventDefault()
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) zoomAt(rect.width / 2, rect.height / 2, 1 / 1.25)
        return
      }
      if (key === 'delete' || key === 'backspace') {
        if (selectedRef.current) {
          event.preventDefault()
          deleteLayer(selectedRef.current)
        }
        return
      }
      if (key === ' ') {
        event.preventDefault()
        spaceRef.current = true
        return
      }
      if (key === 'escape') {
        interactionRef.current = null
        setSelectedId(null)
        return
      }
      if (!modifier && toolKeys[key]) {
        setTool(toolKeys[key])
        return
      }

      const arrows: Record<string, [number, number]> = {
        arrowleft: [-1, 0],
        arrowright: [1, 0],
        arrowup: [0, -1],
        arrowdown: [0, 1],
      }
      if (arrows[key] && selectedRef.current) {
        event.preventDefault()
        const [dx, dy] = arrows[key]
        const step = event.shiftKey ? 12 : 1
        nudgeSelected(dx * step, dy * step)
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ') spaceRef.current = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [deleteLayer, duplicateLayer, fitView, nudgeSelected, redo, undo, zoomAt])

  /* -------------------------------- PWA ----------------------------- */
  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstallEvent(null)
      showToast('Pane Studio a été installé sur votre PC.', 'success')
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [showToast])

  const handleInstall = useCallback(async () => {
    if (!installEvent) {
      showToast(
        'Utilisez le menu de votre navigateur → « Installer Pane Studio ».',
        'info',
      )
      return
    }
    await installEvent.prompt()
    const choice = await installEvent.userChoice
    if (choice.outcome === 'accepted') {
      showToast('Installation en cours…')
    }
    setInstallEvent(null)
  }, [installEvent, showToast])

  /* ------------------------------- vues ----------------------------- */
  const handleAddTextLayer = useCallback(() => {
    const currentDoc = docRef.current
    createTextAt(currentDoc.width / 2, currentDoc.height / 2)
  }, [createTextAt])

  const handleAddShapeLayer = useCallback(() => {
    const currentDoc = docRef.current
    createShapeAt(currentDoc.width / 2, currentDoc.height / 2, 'rect', 'linear')
    setTool('move')
    setActiveTab('props')
    showToast('Forme ajoutée — dessinez ou ajustez-la depuis « Propriétés ».')
  }, [createShapeAt, showToast])

  const handleAddSolidLayer = useCallback(() => {
    const currentDoc = docRef.current
    const id = uid()
    pushHistory()
    setLayers((current) => [
      ...current,
      {
        id,
        name: 'Aplat de couleur',
        type: 'solid',
        color: '#182648',
        x: 0,
        y: 0,
        width: currentDoc.width,
        height: currentDoc.height,
        rotation: 0,
        opacity: 100,
        blend: 'multiply',
        visible: true,
        locked: false,
      } as Layer,
    ])
    setSelectedId(id)
    setActiveTab('props')
    showToast('Calque d\'aplat ajouté.')
  }, [pushHistory, showToast])

  const handleDocChange = useCallback(
    (patch: Partial<DocSettings>) => {
      setDoc((current) => ({ ...current, ...patch }))
    },
    [],
  )

  const openImportDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const cursorStyle = (): string => {
    switch (tool) {
      case 'hand':
        return 'grab'
      case 'zoom':
        return 'zoom-in'
      case 'text':
        return 'text'
      case 'pipette':
        return 'crosshair'
      case 'rect':
      case 'ellipse':
      case 'gradient':
        return 'crosshair'
      default:
        return 'default'
    }
  }

  /* ------------------------------- rendu ---------------------------- */
  return (
    <div className="flex h-full flex-col overflow-hidden bg-ink-950">
      <TopBar
        doc={doc}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        zoom={view.zoom}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyRef.current.length - 1}
        canInstall={Boolean(installEvent)}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={() => {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) zoomAt(rect.width / 2, rect.height / 2, 1.25)
        }}
        onZoomOut={() => {
          const rect = canvasRef.current?.getBoundingClientRect()
          if (rect) zoomAt(rect.width / 2, rect.height / 2, 1 / 1.25)
        }}
        onFitView={fitView}
        onActualSize={() => setView((current) => ({ ...current, zoom: 1 }))}
        onImportClick={openImportDialog}
        onExportClick={() => setActiveTab('export')}
        onInstall={handleInstall}
        onToggleGrid={() => handleDocChange({ showGrid: !doc.showGrid })}
        showGrid={doc.showGrid}
      />

      <div className="flex min-h-0 flex-1">
        <ToolRail tool={tool} onToolChange={setTool} />

        {/* Zone de travail */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          {/* Barre contextuelle */}
          <div className="flex h-[38px] shrink-0 items-center gap-2 border-b border-white/[0.06] bg-ink-850/80 px-3.5">
            <MousePointer2 size={12} className="text-azure-400" />
            <span className="text-[9.5px] font-semibold uppercase tracking-[0.15em] text-ink-300">
              {tool === 'move'
                ? 'Déplacement'
                : tool === 'rect'
                  ? 'Rectangle'
                  : tool === 'ellipse'
                    ? 'Ellipse'
                    : tool === 'text'
                      ? 'Texte'
                      : tool === 'gradient'
                        ? 'Dégradé'
                        : tool === 'pipette'
                          ? 'Pipette'
                          : tool === 'hand'
                            ? 'Main'
                            : 'Zoom'}
            </span>
            <div className="h-4 w-px bg-white/10" />
            <p className="truncate text-[9.5px] text-ink-500">
              {tool === 'move'
                ? 'Glissez un élément pour le déplacer · les coins redimensionnent · Maj maintient les proportions'
                : tool === 'hand' || tool === 'zoom'
                  ? 'Molette : panoramique · Ctrl + molette : zoom · Ctrl + 0 : ajuster la vue'
                  : 'Cliquez-glissez sur le canevas pour créer · Échap pour revenir à la sélection'}
            </p>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('logos')}
                className="flex items-center gap-1.5 rounded-lg border border-azure-400/25 bg-azure-500/12 px-2.5 py-1 text-[9px] font-semibold text-azure-300 transition-colors hover:bg-azure-500/22"
              >
                <LayoutGrid size={10.5} />
                Bibliothèque de logos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('layers')}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold text-ink-300 transition-colors hover:bg-white/[0.09]"
              >
                <Layers size={10.5} />
                Calques ({layers.length})
              </button>
            </div>
          </div>

          {/* Canevas */}
          <div
            ref={containerRef}
            className="relative min-h-0 flex-1 overflow-hidden"
            style={{ cursor: cursorStyle() }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 h-full w-full touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onDoubleClick={() => setActiveTab('props')}
            />

            {/* Aide visuelle */}
            <div className="pointer-events-none absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/[0.08] bg-ink-900/78 px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles size={11} className="text-gold" />
              <span className="text-[9px] font-medium text-ink-300">
                Ctrl + molette : zoom · Molette : déplacer la vue · Double-clic : propriétés
              </span>
            </div>
          </div>

          {/* Barre d'état */}
          <div className="flex h-[30px] shrink-0 items-center gap-3 border-t border-white/[0.06] bg-ink-850/85 px-3.5">
            <div className="flex items-center gap-1.5">
              <ImageIcon size={11} className="text-ink-500" />
              <span className="text-[9px] font-medium tabular-nums text-ink-400">
                {doc.width} × {doc.height} px
              </span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[9px] tabular-nums text-ink-400">
              Zoom {Math.round(view.zoom * 100)} %
            </span>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[9px] text-ink-400">
              {selectedId
                ? `Calque : ${layers.find((layer) => layer.id === selectedId)?.name ?? '—'}`
                : 'Aucun calque sélectionné'}
            </span>
            <div className="flex-1" />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-lg border border-mint/25 bg-mint/10 px-2.5 py-1 text-[8.5px] font-semibold text-mint transition-colors hover:bg-mint/20"
              >
                <HardDriveDownload size={10.5} />
                Installer l'application
              </button>
              <button
                type="button"
                onClick={openImportDialog}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[8.5px] font-semibold text-ink-300 transition-colors hover:bg-white/[0.09]"
              >
                <Upload size={10.5} />
                Importer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className="flex items-center gap-1.5 rounded-lg border border-azure-400/30 bg-azure-500/15 px-2.5 py-1 text-[8.5px] font-semibold text-azure-300 transition-colors hover:bg-azure-500/25"
              >
                <Download size={10.5} />
                Exporter
              </button>
            </div>
          </div>
        </main>

        <RightPanel
          tab={activeTab}
          onTabChange={setActiveTab}
          layers={layers}
          selectedId={selectedId}
          doc={doc}
          insertSize={insertSize}
          onSelectLayer={setSelectedId}
          onUpdateLayer={updateLayer}
          onDeleteLayer={deleteLayer}
          onDuplicateLayer={duplicateLayer}
          onMoveLayer={moveLayer}
          onToggleVisible={toggleVisible}
          onToggleLock={toggleLock}
          onAddText={handleAddTextLayer}
          onAddShape={handleAddShapeLayer}
          onAddSolid={handleAddSolidLayer}
          onAddLogo={handleAddLogo}
          onImportLogo={handleImportLogoFile}
          onInsertSizeChange={setInsertSize}
          onAlign={alignLayer}
          onFit={fitLayer}
          onDocChange={handleDocChange}
          onAddBackground={handleAddBackground}
          onGradientPreset={handleGradientPreset}
          onImportClick={openImportDialog}
          onExport={handleExport}
        />
      </div>

      {/* Inputs de fichiers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) processImportedFile(file)
          event.target.value = ''
        }}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleImportLogoFile(file)
          event.target.value = ''
        }}
      />

      {/* Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-5 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border border-white/[0.1] bg-ink-800/95 px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {toast.tone === 'success' ? (
              <Sparkles size={14} className="text-mint" />
            ) : (
              <Info size={14} className="text-azure-300" />
            )}
            <span className="text-[11px] font-medium text-white">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Écran d'accueil */}
      <WelcomeModal
        open={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onImportClick={() => {
          setWelcomeOpen(false)
          openImportDialog()
        }}
        onExploreLogos={() => {
          setWelcomeOpen(false)
          setActiveTab('logos')
        }}
        onOpenExport={() => {
          setWelcomeOpen(false)
          setActiveTab('export')
        }}
      />
    </div>
  )
}

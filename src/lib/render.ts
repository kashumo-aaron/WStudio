import type { ImageLayer, Layer, ShapeLayer, TextLayer } from './types'
import { degToRad } from './utils'

/* ------------------------------------------------------------------ */
/* Image cache                                                         */
/* ------------------------------------------------------------------ */

const imageCache = new Map<string, HTMLImageElement>()
const pendingLoads = new Map<string, Promise<HTMLImageElement>>()

export function getCachedImage(src: string): HTMLImageElement | undefined {
  return imageCache.get(src)
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached)
  }
  const pending = pendingLoads.get(src)
  if (pending) return pending

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      imageCache.set(src, img)
      pendingLoads.delete(src)
      resolve(img)
    }
    img.onerror = () => {
      pendingLoads.delete(src)
      reject(new Error('Image load failed'))
    }
    img.src = src
  })

  pendingLoads.set(src, promise)
  return promise
}

/* ------------------------------------------------------------------ */
/* Shape paths                                                         */
/* ------------------------------------------------------------------ */

export function buildShapePath(
  shape: ShapeLayer['shape'],
  width: number,
  height: number,
  radius: number,
): Path2D {
  const path = new Path2D()
  const x = -width / 2
  const y = -height / 2

  switch (shape) {
    case 'rect': {
      const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
      if (r > 0 && typeof path.roundRect === 'function') {
        path.roundRect(x, y, width, height, r)
      } else {
        path.rect(x, y, width, height)
      }
      break
    }
    case 'ellipse': {
      path.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2)
      break
    }
    case 'triangle': {
      path.moveTo(0, y)
      path.lineTo(x + width, y + height)
      path.lineTo(x, y + height)
      path.closePath()
      break
    }
    case 'diamond': {
      path.moveTo(0, y)
      path.lineTo(x + width, 0)
      path.lineTo(0, y + height)
      path.lineTo(x, 0)
      path.closePath()
      break
    }
    case 'star': {
      const spikes = 5
      for (let i = 0; i < spikes * 2; i += 1) {
        const factor = i % 2 === 0 ? 1 : 0.44
        const angle = (Math.PI / spikes) * i - Math.PI / 2
        const px = Math.cos(angle) * (width / 2) * factor
        const py = Math.sin(angle) * (height / 2) * factor
        if (i === 0) path.moveTo(px, py)
        else path.lineTo(px, py)
      }
      path.closePath()
      break
    }
    default:
      path.rect(x, y, width, height)
  }

  return path
}

/* ------------------------------------------------------------------ */
/* Layer drawing                                                       */
/* ------------------------------------------------------------------ */

function drawShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
  const path = buildShapePath(layer.shape, layer.width, layer.height, layer.radius)

  let fill: string | CanvasGradient = layer.fill
  if (layer.fillType !== 'solid') {
    if (layer.fillType === 'linear') {
      const angle = degToRad(layer.gradientAngle)
      const dx = (Math.cos(angle) * layer.width) / 2
      const dy = (Math.sin(angle) * layer.height) / 2
      const gradient = ctx.createLinearGradient(-dx, -dy, dx, dy)
      gradient.addColorStop(0, layer.fill)
      gradient.addColorStop(1, layer.fill2)
      fill = gradient
    } else {
      const gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        Math.max(layer.width, layer.height) / 2,
      )
      gradient.addColorStop(0, layer.fill)
      gradient.addColorStop(1, layer.fill2)
      fill = gradient
    }
  }

  ctx.fillStyle = fill
  ctx.fill(path)

  if (layer.strokeWidth > 0 && layer.stroke && layer.stroke !== 'transparent') {
    ctx.strokeStyle = layer.stroke
    ctx.lineWidth = layer.strokeWidth
    ctx.lineJoin = 'round'
    ctx.stroke(path)
  }
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer) {
  const lines = layer.text.length > 0 ? layer.text.split('\n') : ['']
  const lineHeight = layer.fontSize * layer.lineHeight
  const totalHeight = lineHeight * lines.length

  ctx.font = `${layer.italic ? 'italic ' : ''}${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`
  ctx.textAlign = layer.align
  ctx.textBaseline = 'middle'
  ctx.fillStyle = layer.color

  const spacingCtx = ctx as unknown as { letterSpacing?: string }
  const previousSpacing = spacingCtx.letterSpacing
  if (previousSpacing !== undefined) {
    spacingCtx.letterSpacing = `${layer.letterSpacing}px`
  }

  const anchorX =
    layer.align === 'left'
      ? -layer.width / 2
      : layer.align === 'right'
        ? layer.width / 2
        : 0

  lines.forEach((line, index) => {
    const yPos = -totalHeight / 2 + lineHeight / 2 + index * lineHeight
    if (layer.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)'
      ctx.shadowBlur = layer.fontSize * 0.34
      ctx.shadowOffsetY = layer.fontSize * 0.09
    }
    ctx.fillText(line, anchorX, yPos)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  })

  if (previousSpacing !== undefined) {
    spacingCtx.letterSpacing = previousSpacing
  }
}

function drawImageLayer(ctx: CanvasRenderingContext2D, layer: ImageLayer) {
  const img = imageCache.get(layer.src)
  if (!img || !img.complete || img.naturalWidth === 0) return

  const { width, height } = layer
  if (layer.fit === 'cover' || layer.fit === 'contain') {
    const scale =
      layer.fit === 'cover'
        ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
        : Math.min(width / img.naturalWidth, height / img.naturalHeight)
    const drawWidth = img.naturalWidth * scale
    const drawHeight = img.naturalHeight * scale
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
  } else {
    ctx.drawImage(img, -width / 2, -height / 2, width, height)
  }
}

export function drawLayer(ctx: CanvasRenderingContext2D, layer: Layer) {
  if (!layer.visible || layer.opacity <= 0) return

  ctx.save()
  ctx.globalAlpha = Math.min(1, Math.max(0, layer.opacity / 100))
  ctx.globalCompositeOperation = layer.blend

  ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2)
  if (layer.rotation) ctx.rotate(degToRad(layer.rotation))

  switch (layer.type) {
    case 'image':
      drawImageLayer(ctx, layer)
      break
    case 'solid':
      ctx.fillStyle = layer.color
      ctx.fillRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height)
      break
    case 'shape':
      drawShapeLayer(ctx, layer)
      break
    case 'text':
      drawTextLayer(ctx, layer)
      break
    default:
      break
  }

  ctx.restore()
}

export function renderComposition(
  ctx: CanvasRenderingContext2D,
  layers: Layer[],
  width: number,
  height: number,
) {
  layers.forEach((layer) => drawLayer(ctx, layer))
  void width
  void height
}

/* ------------------------------------------------------------------ */
/* Geometry: handles & hit-testing                                     */
/* ------------------------------------------------------------------ */

export interface HandleDef {
  id: string
  sx: number
  sy: number
  cursor: string
}

export const HANDLES: HandleDef[] = [
  { id: 'nw', sx: -1, sy: -1, cursor: 'nwse-resize' },
  { id: 'n', sx: 0, sy: -1, cursor: 'ns-resize' },
  { id: 'ne', sx: 1, sy: -1, cursor: 'nesw-resize' },
  { id: 'e', sx: 1, sy: 0, cursor: 'ew-resize' },
  { id: 'se', sx: 1, sy: 1, cursor: 'nwse-resize' },
  { id: 's', sx: 0, sy: 1, cursor: 'ns-resize' },
  { id: 'sw', sx: -1, sy: 1, cursor: 'nesw-resize' },
  { id: 'w', sx: -1, sy: 0, cursor: 'ew-resize' },
]

export function layerCenter(layer: Layer): { x: number; y: number } {
  return { x: layer.x + layer.width / 2, y: layer.y + layer.height / 2 }
}

/** Document point -> unrotated layer space. */
export function toLayerSpace(layer: Layer, px: number, py: number) {
  const center = layerCenter(layer)
  const angle = -degToRad(layer.rotation)
  const dx = px - center.x
  const dy = py - center.y
  return {
    x: dx * Math.cos(angle) - dy * Math.sin(angle),
    y: dx * Math.sin(angle) + dy * Math.cos(angle),
  }
}

/** Unrotated layer space -> document point. */
export function fromLayerSpace(layer: Layer, lx: number, ly: number) {
  const center = layerCenter(layer)
  const angle = degToRad(layer.rotation)
  return {
    x: center.x + lx * Math.cos(angle) - ly * Math.sin(angle),
    y: center.y + lx * Math.sin(angle) + ly * Math.cos(angle),
  }
}

export function hitTestLayer(layer: Layer, px: number, py: number): boolean {
  const local = toLayerSpace(layer, px, py)
  return (
    local.x >= -layer.width / 2 &&
    local.x <= layer.width / 2 &&
    local.y >= -layer.height / 2 &&
    local.y <= layer.height / 2
  )
}

export function hitTestHandle(
  layer: Layer,
  handle: HandleDef,
  px: number,
  py: number,
  tolerance: number,
): boolean {
  const world = fromLayerSpace(
    layer,
    (handle.sx * layer.width) / 2,
    (handle.sy * layer.height) / 2,
  )
  return Math.abs(world.x - px) <= tolerance && Math.abs(world.y - py) <= tolerance
}

export function resizeLayer(
  layer: Layer,
  handle: HandleDef,
  pointerX: number,
  pointerY: number,
  keepAspect: boolean,
): { x: number; y: number; width: number; height: number } {
  const local = toLayerSpace(layer, pointerX, pointerY)
  const anchorLocal = {
    x: (-handle.sx * layer.width) / 2,
    y: (-handle.sy * layer.height) / 2,
  }

  let newWidth = layer.width
  let newHeight = layer.height
  if (handle.sx !== 0) newWidth = (local.x - anchorLocal.x) * handle.sx
  if (handle.sy !== 0) newHeight = (local.y - anchorLocal.y) * handle.sy

  if (keepAspect && handle.sx !== 0 && handle.sy !== 0) {
    const ratio = layer.width / Math.max(1, layer.height)
    if (newWidth / Math.max(1, newHeight) > ratio) {
      newHeight = newWidth / ratio
    } else {
      newWidth = newHeight * ratio
    }
  }

  newWidth = Math.max(12, newWidth)
  newHeight = Math.max(12, newHeight)

  const newCenterLocal = {
    x: anchorLocal.x + (handle.sx * newWidth) / 2,
    y: anchorLocal.y + (handle.sy * newHeight) / 2,
  }
  const worldCenter = fromLayerSpace(layer, newCenterLocal.x, newCenterLocal.y)

  return {
    x: worldCenter.x - newWidth / 2,
    y: worldCenter.y - newHeight / 2,
    width: newWidth,
    height: newHeight,
  }
}

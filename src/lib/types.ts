export type LayerType = 'image' | 'text' | 'shape' | 'solid'

export type ImageFit = 'stretch' | 'cover' | 'contain'

export type ShapeKind = 'rect' | 'ellipse' | 'triangle' | 'diamond' | 'star'

export type FillType = 'solid' | 'linear' | 'radial'

export interface BaseLayer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  /** 0 -> 100 */
  opacity: number
  blend: GlobalCompositeOperation
  /** top-left corner in document space */
  x: number
  y: number
  width: number
  height: number
  /** degrees, around the layer centre */
  rotation: number
}

export interface ImageLayer extends BaseLayer {
  type: 'image'
  src: string
  fit: ImageFit
  naturalWidth: number
  naturalHeight: number
}

export interface TextLayer extends BaseLayer {
  type: 'text'
  text: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  italic: boolean
  color: string
  align: CanvasTextAlign
  letterSpacing: number
  lineHeight: number
  shadow: boolean
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape'
  shape: ShapeKind
  fillType: FillType
  fill: string
  fill2: string
  gradientAngle: number
  stroke: string
  strokeWidth: number
  radius: number
}

export interface SolidLayer extends BaseLayer {
  type: 'solid'
  color: string
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | SolidLayer

export interface DocSettings {
  width: number
  height: number
  background: string
  showGrid: boolean
  snapToGrid: boolean
}

export type ToolId =
  | 'move'
  | 'rect'
  | 'ellipse'
  | 'text'
  | 'gradient'
  | 'pipette'
  | 'hand'
  | 'zoom'

export type PanelTab = 'logos' | 'layers' | 'props' | 'background' | 'export'

export type AlignMode =
  | 'left'
  | 'centerH'
  | 'right'
  | 'top'
  | 'centerV'
  | 'bottom'
  | 'center'

export type FitMode = 'cover' | 'contain' | 'stretch'

export interface ViewTransform {
  zoom: number
  panX: number
  panY: number
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

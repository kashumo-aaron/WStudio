export interface BackgroundAsset {
  id: string
  name: string
  src: string
  thumb: string
  mood: string
}

export const sampleBackgrounds: BackgroundAsset[] = [
  {
    id: 'gradient',
    name: 'Fluide irisé',
    src: './backgrounds/gradient.jpg',
    thumb: './backgrounds/gradient.jpg',
    mood: 'Coloré',
  },
  {
    id: 'space',
    name: 'Nébuleuse profonde',
    src: './backgrounds/space.jpg',
    thumb: './backgrounds/space.jpg',
    mood: 'Cosmique',
  },
  {
    id: 'neon-city',
    name: 'Mégalopole néon',
    src: './backgrounds/neon-city.jpg',
    thumb: './backgrounds/neon-city.jpg',
    mood: 'Cyberpunk',
  },
  {
    id: 'mountain',
    name: 'Brume matinale',
    src: './backgrounds/mountain.jpg',
    thumb: './backgrounds/mountain.jpg',
    mood: 'Nature',
  },
  {
    id: 'dark-smoke',
    name: 'Fumée abyssale',
    src: './backgrounds/dark-smoke.jpg',
    thumb: './backgrounds/dark-smoke.jpg',
    mood: 'Sombre',
  },
  {
    id: 'aurora',
    name: 'Aurore boréale',
    src: './backgrounds/aurora.jpg',
    thumb: './backgrounds/aurora.jpg',
    mood: 'Polaire',
  },
]

export interface CanvasPreset {
  label: string
  width: number
  height: number
  hint: string
}

export const canvasPresets: CanvasPreset[] = [
  { label: 'Full HD', width: 1920, height: 1080, hint: 'Écran 1080p' },
  { label: 'QHD', width: 2560, height: 1440, hint: 'Écran 1440p' },
  { label: '4K UHD', width: 3840, height: 2160, hint: 'Écran 2160p' },
  { label: 'Ultra-large', width: 3440, height: 1440, hint: '21:9 incurvé' },
  { label: 'Double écran', width: 3840, height: 1080, hint: 'Dual 1080p' },
  { label: 'Carré', width: 2048, height: 2048, hint: 'Réseaux sociaux' },
  { label: 'Portrait', width: 1080, height: 1920, hint: 'Mobile / vertical' },
]

export const fontOptions: string[] = [
  '"Space Grotesk", sans-serif',
  '"Inter", sans-serif',
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  'Impact, sans-serif',
  '"Arial Black", sans-serif',
  'Verdana, sans-serif',
  '"Trebuchet MS", sans-serif',
  'Garamond, serif',
]

export interface BlendOption {
  value: GlobalCompositeOperation
  label: string
}

export const blendModes: BlendOption[] = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Produit' },
  { value: 'screen', label: 'Superposition' },
  { value: 'overlay', label: 'Incrustation' },
  { value: 'darken', label: 'Obscurcir' },
  { value: 'lighten', label: 'Éclaircir' },
  { value: 'color-dodge', label: 'Densité couleur -' },
  { value: 'color-burn', label: 'Densité couleur +' },
  { value: 'hard-light', label: 'Lumière dure' },
  { value: 'soft-light', label: 'Lumière tamisée' },
  { value: 'difference', label: 'Différence' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Teinte' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Couleur' },
  { value: 'luminosity', label: 'Luminosité' },
]

export const gradientPresets: Array<{ name: string; from: string; to: string }> = [
  { name: 'Nuit électrique', from: '#0f2027', to: '#2c5364' },
  { name: 'Violet royal', from: '#4e2bd4', to: '#a45cff' },
  { name: 'Aube corail', from: '#ff5f6d', to: '#ffc371' },
  { name: 'Océan profond', from: '#0f2b5b', to: '#2fe3c2' },
  { name: 'Crépuscule', from: '#2b1055', to: '#7597de' },
  { name: 'Émeraude', from: '#0ba360', to: '#3cba92' },
  { name: 'Magenta solaire', from: '#f857a6', to: '#ff5858' },
  { name: 'Graphite', from: '#232526', to: '#414345' },
]

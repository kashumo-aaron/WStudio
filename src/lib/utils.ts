export const uid = (): string =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export const degToRad = (deg: number): number => (deg * Math.PI) / 180

export const radToDeg = (rad: number): number => (rad * 180) / Math.PI

export const roundTo = (value: number, precision = 0): number => {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ')

export type LogoCategory =
  | 'Classique'
  | 'Moderne'
  | 'Néon'
  | 'Futuriste'
  | 'Métal'
  | 'Minimaliste'

export interface LogoAsset {
  id: string
  name: string
  category: LogoCategory
  tags: string[]
  svg: string
}

export const logoCategories: LogoCategory[] = [
  'Classique',
  'Moderne',
  'Néon',
  'Futuriste',
  'Métal',
  'Minimaliste',
]

export const svgToDataUrl = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s{2,}/g, ' ').trim())}`

/** Quatre panneaux (le "carreau de fenêtre") — base de la plupart des logos. */
const panes = (
  fill: string,
  options: { gap?: number; pad?: number; rx?: number; opacity?: string } = {},
): string => {
  const gap = options.gap ?? 28
  const pad = options.pad ?? 56
  const rx = options.rx ?? 12
  const opacity = options.opacity ? ` opacity="${options.opacity}"` : ''
  const size = (512 - pad * 2 - gap) / 2
  return `<g fill="${fill}"${opacity}>
    <rect x="${pad}" y="${pad}" width="${size}" height="${size}" rx="${rx}"/>
    <rect x="${pad + size + gap}" y="${pad}" width="${size}" height="${size}" rx="${rx}"/>
    <rect x="${pad}" y="${pad + size + gap}" width="${size}" height="${size}" rx="${rx}"/>
    <rect x="${pad + size + gap}" y="${pad + size + gap}" width="${size}" height="${size}" rx="${rx}"/>
  </g>`
}

const svgShell = (defs: string, body: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}${body}</svg>`

export const logos: LogoAsset[] = [
  /* ---------------------------- CLASSIQUE ---------------------------- */
  {
    id: 'w11-azur',
    name: 'Windows 11 Azur',
    category: 'Classique',
    tags: ['windows', 'bleu', 'microsoft', 'moderne'],
    svg: svgShell(
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7ad6ff"/><stop offset="1" stop-color="#1a6fe8"/>
      </linearGradient></defs>`,
      panes('url(#g)'),
    ),
  },
  {
    id: 'w10-perspective',
    name: 'Windows 10 Perspective',
    category: 'Classique',
    tags: ['windows', 'bleu', 'incliné'],
    svg: svgShell(
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#4fc3f7"/><stop offset="1" stop-color="#0d47a1"/>
      </linearGradient></defs>`,
      `<g transform="translate(256 256) skewY(-11) scale(0.92) translate(-256 -256)">${panes('url(#g)', { rx: 4 })}</g>`,
    ),
  },
  {
    id: 'xp-drapeau',
    name: 'Windows XP Drapeau',
    category: 'Classique',
    tags: ['windows', 'xp', 'couleur', 'vintage', 'drapeau'],
    svg: svgShell(
      '',
      `<g>
        <path d="M62 128 L236 92 L236 240 L62 240 Z" fill="#f4682c"/>
        <path d="M258 88 L452 52 L452 222 L258 222 Z" fill="#84c441"/>
        <path d="M62 262 L236 262 L236 412 L62 380 Z" fill="#31a8e0"/>
        <path d="M258 262 L452 262 L452 452 L258 416 Z" fill="#f5b93c"/>
      </g>`,
    ),
  },
  {
    id: 'w95-pixel',
    name: 'Windows 95 Pixel',
    category: 'Classique',
    tags: ['windows', 'rétro', 'pixel', 'vintage'],
    svg: svgShell(
      '',
      `<g stroke="#101010" stroke-width="14" stroke-linejoin="round">
        <path d="M70 122 L226 92 L226 232 L70 232 Z" fill="#d63b2f"/>
        <path d="M250 88 L442 56 L442 216 L250 216 Z" fill="#3fae4a"/>
        <path d="M70 256 L226 256 L226 398 L70 366 Z" fill="#2f6fd0"/>
        <path d="M250 240 L442 240 L442 424 L250 392 Z" fill="#e8b93c"/>
      </g>`,
    ),
  },
  {
    id: 'w7-aero',
    name: 'Windows 7 Aero',
    category: 'Classique',
    tags: ['windows', 'aero', 'brillant', 'sphère'],
    svg: svgShell(
      `<defs>
        <radialGradient id="orb" cx="0.32" cy="0.26" r="0.92">
          <stop offset="0" stop-color="#eaf7ff"/><stop offset="0.52" stop-color="#68b6ec"/>
          <stop offset="1" stop-color="#12457f"/>
        </radialGradient>
        <linearGradient id="flag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="1" stop-color="#bfe6ff" stop-opacity="0.72"/>
        </linearGradient>
      </defs>`,
      `<circle cx="256" cy="256" r="212" fill="url(#orb)"/>
       <g transform="translate(256 256) rotate(-16) translate(-256 -256)" opacity="0.9">
        <path d="M148 190 L242 172 L242 250 L148 250 Z" fill="url(#flag)"/>
        <path d="M258 170 L362 150 L362 232 L258 232 Z" fill="url(#flag)"/>
        <path d="M148 268 L242 268 L242 348 L148 328 Z" fill="url(#flag)"/>
        <path d="M258 250 L362 250 L362 428 L258 346 Z" fill="url(#flag)" opacity="0"/>
        <path d="M258 250 L362 250 L362 332 L258 312 Z" fill="url(#flag)"/>
       </g>
       <ellipse cx="196" cy="152" rx="96" ry="58" fill="#ffffff" opacity="0.24" transform="rotate(-28 196 152)"/>`,
    ),
  },
  {
    id: 'w8-metro',
    name: 'Windows 8 Metro',
    category: 'Classique',
    tags: ['windows', 'metro', 'plat', 'incliné'],
    svg: svgShell(
      '',
      `<g transform="translate(256 256) rotate(-14) translate(-256 -256)" fill="#2c7cd3">
        <rect x="92" y="92" width="146" height="146"/>
        <rect x="266" y="92" width="146" height="146"/>
        <rect x="92" y="266" width="146" height="146"/>
        <rect x="266" y="266" width="146" height="146"/>
      </g>`,
    ),
  },
  {
    id: 'ms-tuiles',
    name: 'Tuiles Microsoft',
    category: 'Classique',
    tags: ['microsoft', 'couleur', 'tuiles', 'simple'],
    svg: svgShell(
      '',
      `<g>
        <rect x="72" y="72" width="172" height="172" rx="18" fill="#f25022"/>
        <rect x="268" y="72" width="172" height="172" rx="18" fill="#7fba00"/>
        <rect x="72" y="268" width="172" height="172" rx="18" fill="#00a4ef"/>
        <rect x="268" y="268" width="172" height="172" rx="18" fill="#ffb900"/>
      </g>`,
    ),
  },
  {
    id: 'w31-classic',
    name: 'Fenêtre 3.1',
    category: 'Classique',
    tags: ['vintage', 'fenêtre', 'rétro', 'gris'],
    svg: svgShell(
      '',
      `<g>
        <rect x="84" y="104" width="344" height="304" rx="10" fill="#c9ccd6" stroke="#22242c" stroke-width="12"/>
        <rect x="84" y="104" width="344" height="62" rx="10" fill="#2f4fa8"/>
        <rect x="84" y="152" width="344" height="16" fill="#2f4fa8"/>
        <rect x="112" y="196" width="180" height="168" rx="6" fill="#eef0f5" stroke="#22242c" stroke-width="9"/>
        <rect x="316" y="196" width="86" height="26" rx="5" fill="#e2e5ec" stroke="#22242c" stroke-width="8"/>
        <rect x="316" y="240" width="86" height="26" rx="5" fill="#e2e5ec" stroke="#22242c" stroke-width="8"/>
        <rect x="316" y="284" width="86" height="26" rx="5" fill="#e2e5ec" stroke="#22242c" stroke-width="8"/>
      </g>`,
    ),
  },

  /* ----------------------------- MODERNE ----------------------------- */
  {
    id: 'fluent-verre',
    name: 'Fluent Verre',
    category: 'Moderne',
    tags: ['verre', 'glassmorphism', 'fluide', 'bleu'],
    svg: svgShell(
      `<defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.86"/>
          <stop offset="0.55" stop-color="#bfe2ff" stop-opacity="0.42"/>
          <stop offset="1" stop-color="#7cc0ff" stop-opacity="0.22"/>
        </linearGradient>
        <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#8dc6ff"/>
        </linearGradient>
      </defs>`,
      panes('url(#glass)', { rx: 28 }) +
        panes('none', {
          rx: 28,
        }).replace(/fill="none"/g, 'fill="none" stroke="url(#edge)" stroke-width="7"'),
    ),
  },
  {
    id: 'terminal',
    name: 'Terminal',
    category: 'Moderne',
    tags: ['console', 'code', 'developer', 'sombre'],
    svg: svgShell(
      `<defs><linearGradient id="t" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2b3550"/><stop offset="1" stop-color="#12182b"/>
      </linearGradient></defs>`,
      `<rect x="72" y="72" width="368" height="368" rx="52" fill="url(#t)" stroke="#4c6cff" stroke-width="10"/>
       <path d="M148 186 L226 244 L148 302" fill="none" stroke="#5ef0c2" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
       <rect x="252" y="286" width="118" height="28" rx="14" fill="#5ef0c2"/>`,
    ),
  },
  {
    id: 'segoe-ligne',
    name: 'Lignes Segoe',
    category: 'Moderne',
    tags: ['ligne', 'outline', 'épuré', 'bleu'],
    svg: svgShell(
      '',
      panes('none').replace(
        /fill="none"/g,
        'fill="none" stroke="#2f86e8" stroke-width="22" stroke-linecap="round"',
      ),
    ),
  },
  {
    id: 'pastel-doux',
    name: 'Pastel Doux',
    category: 'Moderne',
    tags: ['pastel', 'doux', 'dégradé', 'coloré'],
    svg: svgShell(
      `<defs>
        <linearGradient id="p1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd3e0"/><stop offset="1" stop-color="#ff9fc0"/></linearGradient>
        <linearGradient id="p2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9f0ff"/><stop offset="1" stop-color="#86cdf5"/></linearGradient>
        <linearGradient id="p3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2d6ff"/><stop offset="1" stop-color="#b39bf5"/></linearGradient>
        <linearGradient id="p4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d4f7e6"/><stop offset="1" stop-color="#8fe3bd"/></linearGradient>
      </defs>`,
      `<g>
        <rect x="72" y="72" width="172" height="172" rx="38" fill="url(#p1)"/>
        <rect x="268" y="72" width="172" height="172" rx="38" fill="url(#p2)"/>
        <rect x="72" y="268" width="172" height="172" rx="38" fill="url(#p3)"/>
        <rect x="268" y="268" width="172" height="172" rx="38" fill="url(#p4)"/>
      </g>`,
    ),
  },

  /* ------------------------------- NÉON ------------------------------ */
  {
    id: 'neon-cyan',
    name: 'Néon Cyan',
    category: 'Néon',
    tags: ['néon', 'cyan', 'glow', 'cyberpunk'],
    svg: svgShell(
      `<defs>
        <filter id="glow" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="20" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="n" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7df9ff"/><stop offset="1" stop-color="#00c8ff"/>
        </linearGradient>
      </defs>`,
      `<g filter="url(#glow)">${panes('url(#n)', { rx: 16 })}</g>`,
    ),
  },
  {
    id: 'neon-magenta',
    name: 'Néon Magenta',
    category: 'Néon',
    tags: ['néon', 'magenta', 'violet', 'glow'],
    svg: svgShell(
      `<defs>
        <filter id="glow" x="-45%" y="-45%" width="190%" height="190%">
          <feGaussianBlur stdDeviation="22" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff6bd6"/><stop offset="1" stop-color="#8b3dff"/>
        </linearGradient>
      </defs>`,
      `<g filter="url(#glow)">${panes('url(#m)', { rx: 6 })}</g>`,
    ),
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    category: 'Néon',
    tags: ['synthwave', 'rétro', 'soleil', 'grille'],
    svg: svgShell(
      `<defs>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffe66b"/><stop offset="1" stop-color="#ff4d9d"/>
        </linearGradient>
        <linearGradient id="grid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#00e5ff"/><stop offset="1" stop-color="#b14dff"/>
        </linearGradient>
      </defs>`,
      `<circle cx="256" cy="228" r="150" fill="url(#sun)"/>
       <rect x="106" y="228" width="300" height="26" fill="#150a2e"/>
       <rect x="106" y="272" width="300" height="20" fill="#150a2e"/>
       <rect x="106" y="308" width="300" height="16" fill="#150a2e"/>
       <g>${panes('url(#grid)', { pad: 116, gap: 22, rx: 4, opacity: '0.92' })}</g>`,
    ),
  },
  {
    id: 'plasma',
    name: 'Plasma Vert',
    category: 'Néon',
    tags: ['plasma', 'vert', 'énergie', 'glow'],
    svg: svgShell(
      `<defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="26" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="pl" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stop-color="#a8ffb0"/><stop offset="1" stop-color="#00d68f"/>
        </radialGradient>
      </defs>`,
      `<g filter="url(#glow)">${panes('url(#pl)', { rx: 42 })}</g>`,
    ),
  },

  /* ---------------------------- FUTURISTE ---------------------------- */
  {
    id: 'holographique',
    name: 'Holographique',
    category: 'Futuriste',
    tags: ['holographique', 'irisé', 'dégradé', 'moderne'],
    svg: svgShell(
      `<defs>
        <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7af5ff"/>
          <stop offset="0.33" stop-color="#6f8bff"/>
          <stop offset="0.66" stop-color="#c86bff"/>
          <stop offset="1" stop-color="#ff8fce"/>
        </linearGradient>
      </defs>`,
      panes('url(#holo)', { rx: 22 }),
    ),
  },
  {
    id: 'isometrique',
    name: 'Isométrique 3D',
    category: 'Futuriste',
    tags: ['3d', 'isométrique', 'cube', 'profondeur'],
    svg: svgShell(
      '',
      `<g>
        <path d="M256 78 L428 172 L256 268 L84 172 Z" fill="#66d9ff"/>
        <path d="M84 196 L256 292 L256 442 L84 346 Z" fill="#2f7fdc"/>
        <path d="M256 292 L428 196 L428 346 L256 442 Z" fill="#1c4fa8"/>
        <path d="M256 122 L372 186 L256 250 L140 186 Z" fill="#bdefff" opacity="0.55"/>
      </g>`,
    ),
  },
  {
    id: 'galaxie',
    name: 'Galaxie',
    category: 'Futuriste',
    tags: ['espace', 'galaxie', 'étoiles', 'cosmos'],
    svg: svgShell(
      `<defs>
        <radialGradient id="space" cx="0.32" cy="0.28" r="0.92">
          <stop offset="0" stop-color="#7b5cff"/><stop offset="0.55" stop-color="#2c2b7a"/>
          <stop offset="1" stop-color="#0a0a24"/>
        </radialGradient>
      </defs>`,
      panes('url(#space)', { rx: 26 }) +
        `<g fill="#ffffff">
          <circle cx="128" cy="140" r="7" opacity="0.9"/><circle cx="366" cy="118" r="5" opacity="0.75"/>
          <circle cx="404" cy="286" r="8" opacity="0.85"/><circle cx="164" cy="366" r="6" opacity="0.7"/>
          <circle cx="288" cy="410" r="5" opacity="0.8"/><circle cx="98" cy="272" r="5" opacity="0.6"/>
          <circle cx="232" cy="228" r="9" opacity="0.9"/><circle cx="330" cy="196" r="4" opacity="0.7"/>
        </g>`,
    ),
  },
  {
    id: 'eclipse',
    name: 'Éclipse Solaire',
    category: 'Futuriste',
    tags: ['éclipse', 'soleil', 'orange', 'sombre'],
    svg: svgShell(
      `<defs>
        <radialGradient id="corona" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.62" stop-color="#ff8a2b"/><stop offset="0.82" stop-color="#ff5c1f" stop-opacity="0.65"/>
          <stop offset="1" stop-color="#ff5c1f" stop-opacity="0"/>
        </radialGradient>
      </defs>`,
      `<circle cx="256" cy="256" r="232" fill="url(#corona)"/>
       <circle cx="256" cy="256" r="152" fill="#0b0b12"/>
       <circle cx="256" cy="256" r="152" fill="none" stroke="#ffb169" stroke-width="6" opacity="0.85"/>`,
    ),
  },
  {
    id: 'blueprint',
    name: 'Blueprint Technique',
    category: 'Futuriste',
    tags: ['blueprint', 'technique', 'grille', 'bleu'],
    svg: svgShell(
      `<defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0 L0 0 0 32" fill="none" stroke="#4da3ff" stroke-width="2" opacity="0.35"/>
        </pattern>
      </defs>`,
      `<rect x="48" y="48" width="416" height="416" rx="18" fill="url(#grid)"/>
       <g fill="none" stroke="#9ed2ff" stroke-width="10">
        <rect x="92" y="92" width="132" height="132" rx="8"/>
        <rect x="288" y="92" width="132" height="132" rx="8"/>
        <rect x="92" y="288" width="132" height="132" rx="8"/>
        <rect x="288" y="288" width="132" height="132" rx="8"/>
       </g>
       <g stroke="#9ed2ff" stroke-width="4" opacity="0.6">
        <line x1="224" y1="158" x2="288" y2="158"/><line x1="224" y1="354" x2="288" y2="354"/>
        <line x1="158" y1="224" x2="158" y2="288"/><line x1="354" y1="224" x2="354" y2="288"/>
       </g>`,
    ),
  },
  {
    id: 'matrix',
    name: 'Matrix Numérique',
    category: 'Futuriste',
    tags: ['matrix', 'vert', 'numérique', 'code'],
    svg: svgShell(
      `<defs>
        <linearGradient id="mx" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7dffa8"/><stop offset="1" stop-color="#0f8f4c"/>
        </linearGradient>
      </defs>`,
      panes('url(#mx)', { rx: 8, opacity: '0.9' }) +
        `<g fill="#02120a" opacity="0.6" font-family="monospace">
          <text x="118" y="196" font-size="86">10</text><text x="316" y="196" font-size="86">11</text>
          <text x="118" y="392" font-size="86">01</text><text x="316" y="392" font-size="86">00</text>
        </g>`,
    ),
  },

  /* ------------------------------ MÉTAL ------------------------------ */
  {
    id: 'chrome',
    name: 'Chrome Poli',
    category: 'Métal',
    tags: ['chrome', 'argent', 'métal', 'brillant'],
    svg: svgShell(
      `<defs>
        <linearGradient id="chr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/><stop offset="0.28" stop-color="#c8d3e2"/>
          <stop offset="0.5" stop-color="#7f8fa6"/><stop offset="0.72" stop-color="#dfe8f4"/>
          <stop offset="1" stop-color="#8290a5"/>
        </linearGradient>
      </defs>`,
      panes('url(#chr)', { rx: 14 }),
    ),
  },
  {
    id: 'or-royal',
    name: 'Or Royal',
    category: 'Métal',
    tags: ['or', 'doré', 'luxe', 'précieux'],
    svg: svgShell(
      `<defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff3c4"/><stop offset="0.35" stop-color="#ffd166"/>
          <stop offset="0.7" stop-color="#d99a1f"/><stop offset="1" stop-color="#a5710c"/>
        </linearGradient>
      </defs>`,
      panes('url(#gold)', { rx: 10 }) +
        `<g stroke="#fff0bf" stroke-width="6" opacity="0.55" fill="none">
          <path d="M92 120 L182 120"/><path d="M288 120 L378 120"/><path d="M92 316 L182 316"/><path d="M288 316 L378 316"/>
        </g>`,
    ),
  },
  {
    id: 'cuivre',
    name: 'Cuivre Brossé',
    category: 'Métal',
    tags: ['cuivre', 'bronze', 'métal', 'chaud'],
    svg: svgShell(
      `<defs>
        <linearGradient id="cop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f7b98e"/><stop offset="0.45" stop-color="#c9743f"/>
          <stop offset="1" stop-color="#7d3c1c"/>
        </linearGradient>
      </defs>`,
      panes('url(#cop)', { rx: 6 }) +
        `<g stroke="#3d1c0c" stroke-width="3" opacity="0.28">
          ${[...Array(9)].map((_, i) => `<line x1="72" y1="${92 + i * 42}" x2="440" y2="${92 + i * 42}"/>`).join('')}
        </g>`,
    ),
  },
  {
    id: 'obsidienne',
    name: 'Obsidienne',
    category: 'Métal',
    tags: ['noir', 'sombre', 'obsidienne', 'métal'],
    svg: svgShell(
      `<defs>
        <linearGradient id="obs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2c303c"/><stop offset="0.5" stop-color="#14161d"/>
          <stop offset="1" stop-color="#05060a"/>
        </linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8fa4c7"/><stop offset="1" stop-color="#2b3040"/>
        </linearGradient>
      </defs>`,
      panes('url(#obs)', { rx: 18 }) +
        panes('none', { rx: 18 }).replace(
          /fill="none"/g,
          'fill="none" stroke="url(#rim)" stroke-width="5"',
        ),
    ),
  },

  /* --------------------------- MINIMALISTE --------------------------- */
  {
    id: 'minimal-trait',
    name: 'Trait Minimal',
    category: 'Minimaliste',
    tags: ['minimal', 'ligne', 'fin', 'épuré'],
    svg: svgShell(
      '',
      panes('none').replace(
        /fill="none"/g,
        'fill="none" stroke="currentColor" stroke-width="14"',
      ),
    ),
  },
  {
    id: 'monochrome-blanc',
    name: 'Monochrome Blanc',
    category: 'Minimaliste',
    tags: ['blanc', 'simple', 'contraste', 'sombre'],
    svg: svgShell('', panes('#ffffff')),
  },
  {
    id: 'monochrome-noir',
    name: 'Monochrome Noir',
    category: 'Minimaliste',
    tags: ['noir', 'simple', 'contraste', 'clair'],
    svg: svgShell('', panes('#0d0f16')),
  },
  {
    id: 'duo-tone',
    name: 'Duo Ton',
    category: 'Minimaliste',
    tags: ['duo', 'bicolore', 'diagonal', 'moderne'],
    svg: svgShell(
      `<defs>
        <linearGradient id="duo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#3aa2ff"/><stop offset="1" stop-color="#ff6b8b"/>
        </linearGradient>
      </defs>`,
      `<g>
        <rect x="72" y="72" width="172" height="172" rx="16" fill="#3aa2ff"/>
        <rect x="268" y="72" width="172" height="172" rx="16" fill="#ff6b8b"/>
        <rect x="72" y="268" width="172" height="172" rx="16" fill="#ff6b8b"/>
        <rect x="268" y="268" width="172" height="172" rx="16" fill="url(#duo)"/>
      </g>`,
    ),
  },
]

const logoIndex = new Map<string, LogoAsset>(logos.map((logo) => [logo.id, logo]))

export const getLogo = (id: string): LogoAsset | undefined => logoIndex.get(id)

export const logoDataUrl = (id: string): string => {
  const logo = logoIndex.get(id)
  return logo ? svgToDataUrl(logo.svg) : ''
}

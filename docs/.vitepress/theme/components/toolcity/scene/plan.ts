export interface BoxInstance {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  seed: number
  tone: number
}

export interface RoundInstance {
  x: number
  y: number
  z: number
  radius: number
  height: number
  seed: number
  tone: number
}

export interface PadQuad {
  x: number
  z: number
  w: number
  d: number
  y: number
  tone: number
}

export interface MarkQuad {
  x: number
  z: number
  angle: number
  len: number
  wid: number
  tone: number
}

export interface AvenueFrame {
  x: number
  z: number
  tx: number
  tz: number
  nx: number
  nz: number
}

export interface FootprintQuad {
  x: number
  z: number
  w: number
  d: number
}

export interface CurveLike {
  getPointAt(t: number): { x: number; y: number; z: number }
  getTangentAt(t: number): { x: number; y: number; z: number }
}

export interface CityPlan {
  frames: AvenueFrame[]
  bodies: BoxInstance[]
  caps: BoxInstance[]
  roofs: BoxInstance[]
  rounds: RoundInstance[]
  pads: PadQuad[]
  marks: MarkQuad[]
  lamps: { x: number; z: number; angle: number }[]
  trees: { x: number; z: number; scale: number }[]
  lines: number[]
  crowns: { x: number; y: number; z: number }[]
  shadows: FootprintQuad[]
  cars: { lane: number; t: number; speed: number }[]
  zoneOf(x: number, z: number): number
}

export const COL_PITCH = 21
export const ROW_PITCH = 24
export const AVENUE_HALF = 4.6
export const SIDEWALK = 1.5
export const PAD_W = COL_PITCH - 5.4
export const PAD_D = ROW_PITCH - 5.2
export const LOT_W = PAD_W - SIDEWALK * 2
export const DISTRICT_BASE = 0.2
export const DISTRICT_STEP = 0.1
export const DISTRICT_COUNT = 7
export const DISTRICT_LATERAL = 42
export const LOT_D = PAD_D - SIDEWALK * 2

const COL_RANGE = 7
const ROW_FROM = -9
const ROW_TO = 3
const DASH_PITCH = 4.6

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function heightRange(x: number, z: number): [number, number] {
  if (z > 26) return [1.2, 3]
  if (z > 2) return [2, 6]
  if (z > -30) return [4, 13]
  if (z > -70) {
    const core = Math.max(0, 1 - Math.abs(x) / 78)
    return [6 + core * 3, 14 + core * 18]
  }
  if (z > -120) return [4, 14]
  return [3, 10]
}

export function buildCityPlan(curve: CurveLike, seed = 20261021): CityPlan {
  const rng = mulberry32(seed)

  const frames: AvenueFrame[] = []
  const SAMPLES = 360
  for (let i = 0; i <= SAMPLES; i++) {
    const p = curve.getPointAt(i / SAMPLES)
    const tan = curve.getTangentAt(i / SAMPLES)
    const len = Math.hypot(tan.x, tan.z) || 1
    frames.push({
      x: p.x,
      z: p.z,
      tx: tan.x / len,
      tz: tan.z / len,
      nx: -tan.z / len,
      nz: tan.x / len
    })
  }

  const Z_HEAD = frames[0].z
  const Z_TAIL = frames[frames.length - 1].z
  const Z_SPAN = Z_TAIL - Z_HEAD

  function indexAt(z: number) {
    if (Z_SPAN === 0) return 0
    const ratio = Math.min(1, Math.max(0, (z - Z_HEAD) / Z_SPAN))
    return Math.round(ratio * (frames.length - 1))
  }

  function avenueRange(z: number) {
    const lo = Math.min(indexAt(z + PAD_D), indexAt(z - PAD_D))
    const hi = Math.max(indexAt(z + PAD_D), indexAt(z - PAD_D))
    let left = Infinity
    let right = -Infinity
    for (let i = Math.max(0, lo - 1); i <= Math.min(frames.length - 1, hi + 1); i++) {
      const x = frames[i].x
      if (x < left) left = x
      if (x > right) right = x
    }
    return { left: left - AVENUE_HALF - 3.6, right: right + AVENUE_HALF + 3.6 }
  }

  function zoneOf(x: number, z: number) {
    const i = indexAt(z)
    const t = i / (frames.length - 1)
    if (Math.abs(frames[i].x - x) > DISTRICT_LATERAL) return -1
    const nearest = Math.round((t - DISTRICT_BASE) / DISTRICT_STEP)
    if (nearest < 0 || nearest >= DISTRICT_COUNT) return -1
    return Math.abs(t - (DISTRICT_BASE + nearest * DISTRICT_STEP)) <= DISTRICT_STEP / 2
      ? nearest
      : -1
  }

  function nearAvenue(x: number, z: number, margin: number) {
    const lo = Math.min(indexAt(z + margin), indexAt(z - margin))
    const hi = Math.max(indexAt(z + margin), indexAt(z - margin))
    for (let i = Math.max(0, lo - 1); i <= Math.min(frames.length - 1, hi + 1); i++) {
      const f = frames[i]
      if (Math.abs(f.x - x) < margin + AVENUE_HALF && Math.abs(f.z - z) < margin + AVENUE_HALF)
        return true
    }
    return false
  }

  const bodies: BoxInstance[] = []
  const caps: BoxInstance[] = []
  const roofs: BoxInstance[] = []
  const rounds: RoundInstance[] = []
  const pads: PadQuad[] = []
  const marks: MarkQuad[] = []
  const lamps: { x: number; z: number; angle: number }[] = []
  const trees: { x: number; z: number; scale: number }[] = []
  const lines: number[] = []
  const crowns: { x: number; y: number; z: number }[] = []
  const shadows: FootprintQuad[] = []

  function addCap(x: number, y: number, z: number, w: number, d: number) {
    caps.push({ x, y: y + 0.1, z, sx: w + 0.26, sy: 0.2, sz: d + 0.26, seed: 0, tone: 1 })
  }

  function addBuilding(x: number, z: number, w: number, d: number, h: number) {
    const seedValue = rng()
    const tone = 0.9 + rng() * 0.18
    let base = 0

    if (h > 4.4 && rng() < 0.32) {
      const ph = 1 + rng() * 1.4
      bodies.push({
        x,
        y: ph / 2,
        z,
        sx: w + 1.6,
        sy: ph,
        sz: d + 1.6,
        seed: rng(),
        tone: tone * 0.97
      })
      addCap(x, ph, z, w + 1.6, d + 1.6)
      base = ph
    }

    bodies.push({ x, y: base + h / 2, z, sx: w, sy: h, sz: d, seed: seedValue, tone })
    addCap(x, base + h, z, w, d)
    shadows.push({ x, z, w: w * 1.55, d: d * 1.55 })

    if (h > 6.5 && rng() < 0.44) {
      const ch = h * (0.16 + rng() * 0.26)
      const cw = w * (0.48 + rng() * 0.24)
      const cd = d * (0.48 + rng() * 0.24)
      const cx = x + (rng() - 0.5) * (w - cw) * 0.5
      const cz = z + (rng() - 0.5) * (d - cd) * 0.5
      bodies.push({
        x: cx,
        y: base + h + ch / 2,
        z: cz,
        sx: cw,
        sy: ch,
        sz: cd,
        seed: rng(),
        tone
      })
      addCap(cx, base + h + ch, cz, cw, cd)
    }

    if (rng() < 0.7) {
      const mw = w * (0.2 + rng() * 0.24)
      const md = d * (0.2 + rng() * 0.24)
      const mh = 0.26 + rng() * 0.5
      roofs.push({
        x: x + (rng() - 0.5) * (w - mw) * 0.7,
        y: base + h + 0.26 + mh / 2,
        z: z + (rng() - 0.5) * (d - md) * 0.7,
        sx: mw,
        sy: mh,
        sz: md,
        seed: 0,
        tone: 0.86 + rng() * 0.1
      })
    }

    if (h > 9 && rng() < 0.55) {
      const top = base + h + 0.26
      lines.push(x, top, z, x, top + 1.4 + rng() * 3.4, z)
    }
  }

  function addRound(x: number, z: number, r: number, h: number) {
    rounds.push({
      x,
      y: h / 2,
      z,
      radius: r,
      height: h,
      seed: rng(),
      tone: 0.92 + rng() * 0.14
    })
    addCap(x, h, z, r * 2, r * 2)
    shadows.push({ x, z, w: r * 3, d: r * 3 })
  }

  function fillLot(cx: number, cz: number, lotW: number, lotD: number) {
    const fine = cz > 2
    const nx = Math.max(1, Math.min(5, Math.round(lotW / (fine ? 3.9 : 4.6))))
    const nz = Math.max(1, Math.min(6, Math.round(lotD / (fine ? 4.2 : 5.6))))
    const [hMin, hMax] = heightRange(cx, cz)

    for (let a = 0; a < nx; a++) {
      for (let b = 0; b < nz; b++) {
        const cellW = lotW / nx
        const cellD = lotD / nz
        if (rng() < (nx * nz > 6 ? 0.1 : 0.05)) {
          trees.push({
            x: cx - lotW / 2 + (a + 0.5) * cellW,
            z: cz - lotD / 2 + (b + 0.5) * cellD,
            scale: 0.4 + rng() * 0.3
          })
          continue
        }
        const w = cellW * (0.62 + rng() * 0.3)
        const d = cellD * (0.62 + rng() * 0.3)
        const x = cx - lotW / 2 + (a + 0.5) * cellW + (rng() - 0.5) * 0.4
        const z = cz - lotD / 2 + (b + 0.5) * cellD + (rng() - 0.5) * 0.4
        const h = hMin + Math.pow(rng(), 1.55) * (hMax - hMin)
        if (rng() < 0.07 && h > 3.4) addRound(x, z, Math.min(w, d) * 0.42, h)
        else addBuilding(x, z, w, d, h)
      }
    }
  }

  function emitBlock(cx: number, cz: number, padW: number, padD: number) {
    const lotW = padW - SIDEWALK * 2
    const lotD = padD - SIDEWALK * 2
    if (lotW < 2.6 || lotD < 2.6) return
    const roll = rng()
    pads.push({ x: cx, z: cz, w: padW, d: padD, y: 0.06, tone: 0 })

    if (roll < 0.07 && padW > 9) {
      pads.push({ x: cx, z: cz, w: lotW, d: lotD, y: 0.13, tone: 2 })
      const rows = 3
      const cols = Math.max(2, Math.round(lotW / 3.4))
      for (let a = 0; a < rows; a++) {
        for (let b = 0; b < cols; b++) {
          if (rng() < 0.22) continue
          trees.push({
            x: cx - lotW / 2 + ((b + 0.5) * lotW) / cols,
            z: cz - lotD / 2 + ((a + 0.5) * lotD) / rows,
            scale: 0.45 + rng() * 0.4
          })
        }
      }
      return
    }

    pads.push({ x: cx, z: cz, w: lotW, d: lotD, y: 0.13, tone: roll > 0.96 ? 3 : 1 })
    fillLot(cx, cz, lotW, lotD)
  }

  const landmarkSlots: { x: number; z: number }[] = []

  for (let i = -COL_RANGE; i <= COL_RANGE; i++) {
    for (let j = ROW_FROM; j <= ROW_TO; j++) {
      const cx = i * COL_PITCH + (rng() - 0.5) * 1
      const cz = j * ROW_PITCH + (rng() - 0.5) * 1
      const blockLeft = cx - PAD_W / 2
      const blockRight = cx + PAD_W / 2
      const cut = avenueRange(cz)

      if (cut.right > blockLeft && cut.left < blockRight) {
        const strips: [number, number][] = []
        if (cut.left - blockLeft > 5.4) strips.push([blockLeft, cut.left])
        if (blockRight - cut.right > 5.4) strips.push([cut.right, blockRight])
        for (const [from, to] of strips) {
          emitBlock((from + to) / 2, cz, to - from - 0.6, PAD_D)
        }
        continue
      }

      if (Math.abs(cx) > 88 && cz < -60 && rng() < 0.5) continue

      if (cz < -22 && cz > -78 && Math.abs(cx) < 70 && rng() < 0.1) {
        landmarkSlots.push({ x: cx, z: cz })
        pads.push({ x: cx, z: cz, w: PAD_W, d: PAD_D, y: 0.06, tone: 0 })
        pads.push({ x: cx, z: cz, w: LOT_W, d: LOT_D, y: 0.13, tone: 1 })
        continue
      }

      emitBlock(cx, cz, PAD_W, PAD_D)
    }
  }

  for (const slot of landmarkSlots.slice(0, 9)) {
    let w = 5.2 + rng() * 3.2
    let d = 4.6 + rng() * 2.8
    let y = 0
    const tiers = 3 + Math.floor(rng() * 2)
    for (let t = 0; t < tiers; t++) {
      const h = t === 0 ? 9 + rng() * 5 : 5 + rng() * 4.5
      bodies.push({
        x: slot.x,
        y: y + h / 2,
        z: slot.z,
        sx: w,
        sy: h,
        sz: d,
        seed: rng(),
        tone: 1 + t * 0.02
      })
      addCap(slot.x, y + h, slot.z, w, d)
      y += h
      w *= 0.74
      d *= 0.74
    }
    const spire = 3.5 + rng() * 5.5
    lines.push(slot.x, y, slot.z, slot.x, y + spire, slot.z)
    crowns.push({ x: slot.x, y: y + spire + 0.3, z: slot.z })
    shadows.push({ x: slot.x, z: slot.z, w: w * 3.2, d: d * 3.2 })
  }

  /* 大道：车道虚线、路灯、行道树 */
  for (let i = 3; i < frames.length - 3; i += 5) {
    const f = frames[i]
    const angle = Math.atan2(f.tx, f.tz)
    const parity = Math.floor(i / 5)
    for (const lane of [-2.2, 2.2]) {
      if (parity % 2 === 0) {
        marks.push({
          x: f.x + f.nx * lane,
          z: f.z + f.nz * lane,
          angle,
          len: 2.2,
          wid: 0.16,
          tone: 0
        })
      }
      if (lane > 0 && parity % 3 === 0) {
        lamps.push({
          x: f.x + f.nx * (AVENUE_HALF + 2.1),
          z: f.z + f.nz * (AVENUE_HALF + 2.1),
          angle
        })
      }
      if (lane < 0 && parity % 3 === 1) {
        lamps.push({
          x: f.x - f.nx * (AVENUE_HALF + 2.1),
          z: f.z - f.nz * (AVENUE_HALF + 2.1),
          angle
        })
      }
      if (parity % 4 === 1) {
        const side = lane > 0 ? 1 : -1
        trees.push({
          x: f.x + f.nx * side * (AVENUE_HALF + 3.1),
          z: f.z + f.nz * side * (AVENUE_HALF + 3.1),
          scale: 0.42 + rng() * 0.2
        })
      }
    }
  }

  /* 网格街道中心虚线 */
  for (let i = -COL_RANGE - 1; i <= COL_RANGE; i++) {
    const x = (i + 0.5) * COL_PITCH
    if (Math.abs(x) > 150) continue
    for (let z = ROW_FROM * ROW_PITCH - 6; z <= ROW_TO * ROW_PITCH + 10; z += DASH_PITCH) {
      if (nearAvenue(x, z, 1.4)) continue
      marks.push({ x, z, angle: 0, len: 1.7, wid: 0.14, tone: 0 })
    }
  }
  for (let j = ROW_FROM - 1; j <= ROW_TO; j++) {
    const z = (j + 0.5) * ROW_PITCH
    for (let x = -COL_RANGE * COL_PITCH - 6; x <= COL_RANGE * COL_PITCH + 6; x += DASH_PITCH) {
      if (nearAvenue(x, z, 1.4)) continue
      marks.push({ x, z, angle: Math.PI / 2, len: 1.7, wid: 0.14, tone: 0 })
    }
  }

  /* 人行横道 */
  for (let j = ROW_FROM - 1; j <= ROW_TO; j++) {
    const z = (j + 0.5) * ROW_PITCH
    const hit = frames[indexAt(z)]
    if (!hit || Math.abs(hit.z - z) > 2.2) continue
    const angle = Math.atan2(hit.tx, hit.tz)
    for (const dir of [-1, 1]) {
      for (let k = -2; k <= 2; k++) {
        const off = dir * (AVENUE_HALF + 2.4)
        marks.push({
          x: hit.x + hit.nx * off + hit.tx * k * 1.3,
          z: hit.z + hit.nz * off + hit.tz * k * 1.3,
          angle,
          len: 1.7,
          wid: 0.34,
          tone: 1
        })
      }
    }
  }

  const cars: { lane: number; t: number; speed: number }[] = []
  for (let i = 0; i < 22; i++) {
    cars.push({
      lane: i % 2 === 0 ? -2.2 : 2.2,
      t: rng(),
      speed: (0.014 + rng() * 0.012) * (i % 2 === 0 ? 1 : -1)
    })
  }

  return {
    frames,
    bodies,
    caps,
    roofs,
    rounds,
    pads,
    marks,
    lamps,
    trees,
    lines,
    crowns,
    shadows,
    cars,
    zoneOf
  }
}

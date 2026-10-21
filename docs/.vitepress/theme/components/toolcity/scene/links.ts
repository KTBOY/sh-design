import * as THREE from 'three'
import { DISTRICT_BASE, DISTRICT_STEP } from './plan'
import type { CityPalette } from './palette'
import type { ToolCity } from './city'

export interface CityLinks {
  group: THREE.Group
  fire(index: number, strength: number): void
  update(elapsed: number, dt: number, scroll: number): void
  setPalette(palette: CityPalette): void
  dispose(): void
}

const PULSE_SECONDS = 0.52
const RING_SECONDS = 0.6
const RING_DELAY = 0.5
const LAMP_RADIUS = 7
const LAMP_HOLD = 1.05

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 5; i++) {
      const dx = sampleX(t) - x
      if (Math.abs(dx) < 1e-4) break
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-5) break
      t = Math.min(1, Math.max(0, t - dx / slope))
    }
    return sampleY(t)
  }
}

const premium = cubicBezier(0.4, 0, 0.2, 1)

function softTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 2, 64, 64, 62)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.35, 'rgba(255,255,255,0.72)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function ringTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 63)
    gradient.addColorStop(0, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.52, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.66, 'rgba(255,255,255,0.45)')
    gradient.addColorStop(0.77, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.88, 'rgba(255,255,255,0.3)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

interface RingState {
  mesh: THREE.Mesh
  age: number
  active: boolean
  strength: number
}

export function createCityLinks(city: ToolCity, palette: CityPalette): CityLinks {
  const group = new THREE.Group()
  group.name = 'tool-city-links'
  const texture = softTexture()
  const haloTexture = ringTexture()

  const ringGeometry = new THREE.PlaneGeometry(2, 2)
  ringGeometry.rotateX(-Math.PI / 2)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: palette.accent,
    map: haloTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })

  const rings: RingState[] = [0, 1].map(() => {
    const mesh = new THREE.Mesh(ringGeometry, ringMaterial.clone())
    mesh.position.y = 0.34
    mesh.visible = false
    mesh.renderOrder = 4
    group.add(mesh)
    return { mesh, age: 0, active: false, strength: 1 }
  })

  const pulseGeometry = new THREE.PlaneGeometry(1, 1)
  pulseGeometry.rotateX(-Math.PI / 2)
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: palette.lampGlow,
    map: texture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  })
  const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial)
  pulse.position.y = 0.36
  pulse.visible = false
  pulse.renderOrder = 5
  group.add(pulse)

  let pulseAge = -1
  let pulseFrom = 0
  let pulseTo = 0
  let pulseStrength = 1
  let lampHold = 0
  let lampLit = false
  let nextRing = 0
  let scroll = 0

  function fire(index: number, strength: number) {
    const targetT = Math.min(0.92, DISTRICT_BASE + index * DISTRICT_STEP)
    pulseFrom = Math.min(0.9, 0.02 + scroll * 0.16)
    pulseTo = Math.max(targetT, pulseFrom + 0.06)
    pulseAge = 0
    pulseStrength = strength
    pulse.visible = true

    const ring = rings[nextRing]
    nextRing = (nextRing + 1) % rings.length
    const position = city.avenuePoint(targetT)
    ring.mesh.position.set(position.x, 0.34, position.z)
    ring.age = 0
    ring.active = true
    ring.strength = strength
    ring.mesh.visible = false

    city.highlightLamps(position.x, position.z, LAMP_RADIUS, 1.5 + strength * 0.35)
    lampLit = true
    lampHold = LAMP_HOLD
  }

  function update(_elapsed: number, dt: number, progress: number) {
    scroll = progress

    if (pulseAge >= 0) {
      pulseAge += dt
      const t = Math.min(1, pulseAge / PULSE_SECONDS)
      const frame = city.avenuePoint(pulseFrom + (pulseTo - pulseFrom) * t)
      pulse.position.set(frame.x, 0.36, frame.z)
      pulse.rotation.y = Math.atan2(frame.tx, frame.tz)
      const fade = Math.sin(Math.PI * Math.min(1, t * 1.15))
      pulse.scale.set(1.9 * pulseStrength, 1, 5.6 * pulseStrength)
      pulseMaterial.opacity = 0.85 * fade * Math.min(1.3, pulseStrength)
      if (t >= 1) {
        pulseAge = -1
        pulse.visible = false
        pulseMaterial.opacity = 0
      }
    }

    for (const ring of rings) {
      if (!ring.active) continue
      ring.age += dt
      const local = (ring.age - RING_DELAY) / RING_SECONDS
      if (local < 0) continue
      ring.mesh.visible = true
      if (local >= 1) {
        ring.active = false
        ring.mesh.visible = false
        continue
      }
      const eased = premium(local)
      const radius = 1.1 + eased * 4.3 * Math.min(1.45, ring.strength)
      ring.mesh.scale.setScalar(radius)
      ;(ring.mesh.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(Math.PI * local) * 0.85 * Math.min(1.25, ring.strength)
    }

    if (lampLit) {
      lampHold -= dt
      if (lampHold <= 0) {
        lampLit = false
        city.clearLampHighlight()
      }
    }
  }

  function setPalette(next: CityPalette) {
    ringMaterial.color.setHex(next.accent)
    for (const ring of rings)
      (ring.mesh.material as THREE.MeshBasicMaterial).color.setHex(next.accent)
    pulseMaterial.color.setHex(next.lampGlow)
  }

  function dispose() {
    pulseGeometry.dispose()
    pulseMaterial.dispose()
    ringGeometry.dispose()
    ringMaterial.dispose()
    for (const ring of rings) (ring.mesh.material as THREE.Material).dispose()
    texture.dispose()
    haloTexture.dispose()
    group.removeFromParent()
    group.clear()
  }

  return { group, fire, update, setPalette, dispose }
}

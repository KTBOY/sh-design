import * as THREE from 'three'
import type { CityPalette } from './palette'
import {
  AVENUE_HALF,
  buildCityPlan,
  type AvenueFrame,
  type BoxInstance,
  type CityPlan,
  type CurveLike
} from './plan'
import { BUILDING_FRAGMENT, BUILDING_VERTEX, GROUND_FRAGMENT, GROUND_VERTEX } from './shaders'

const UP = new THREE.Vector3(0, 1, 0)

class QuadBuilder {
  private readonly positions: number[] = []
  private readonly indices: number[] = []

  get empty() {
    return this.positions.length === 0
  }

  quad(x: number, z: number, w: number, d: number, y: number, angle = 0) {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const hw = w / 2
    const hd = d / 2
    const base = this.positions.length / 3
    const corners: [number, number][] = [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [-hw, hd]
    ]
    for (const [px, pz] of corners) {
      this.positions.push(x + px * c - pz * s, y, z + px * s + pz * c)
    }
    this.indices.push(base, base + 2, base + 1, base, base + 3, base + 2)
  }

  strip(frames: AvenueFrame[], offset: number, width: number, y: number) {
    for (let i = 0; i < frames.length - 1; i++) {
      const a = frames[i]
      const b = frames[i + 1]
      const tx = b.x - a.x
      const tz = b.z - a.z
      const len = Math.hypot(tx, tz) || 1
      this.quad(
        (a.x + b.x) / 2 - (tz / len) * offset,
        (a.z + b.z) / 2 + (tx / len) * offset,
        len * 1.08,
        width,
        y,
        Math.atan2(tz, tx)
      )
    }
  }

  build() {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3))
    geometry.setIndex(this.indices)
    geometry.computeBoundingSphere()
    return geometry
  }
}

function glowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 31)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function shadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 4, 32, 32, 30)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(0.6, 'rgba(255,255,255,0.35)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function boxEdges(target: number[], box: BoxInstance) {
  const hx = box.sx / 2
  const hy = box.sy / 2
  const hz = box.sz / 2
  const corners = [
    [box.x - hx, box.y - hy, box.z - hz],
    [box.x + hx, box.y - hy, box.z - hz],
    [box.x + hx, box.y - hy, box.z + hz],
    [box.x - hx, box.y - hy, box.z + hz],
    [box.x - hx, box.y + hy, box.z - hz],
    [box.x + hx, box.y + hy, box.z - hz],
    [box.x + hx, box.y + hy, box.z + hz],
    [box.x - hx, box.y + hy, box.z + hz]
  ]
  const pairs = [
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4]
  ]
  for (const [a, b] of pairs) target.push(...corners[a], ...corners[b])
}

export class ToolCity {
  readonly group = new THREE.Group()

  private readonly plan: CityPlan
  private readonly buildingMaterial: THREE.ShaderMaterial
  private readonly groundMaterial: THREE.ShaderMaterial
  private readonly sidewalkMaterial: THREE.MeshBasicMaterial
  private readonly avenueMaterial: THREE.MeshBasicMaterial
  private readonly lotMaterial: THREE.MeshBasicMaterial
  private readonly parkMaterial: THREE.MeshBasicMaterial
  private readonly markingMaterial: THREE.MeshBasicMaterial
  private readonly accentMaterial: THREE.MeshBasicMaterial
  private readonly curbMaterial: THREE.MeshBasicMaterial
  private readonly capMaterial: THREE.MeshStandardMaterial
  private readonly mechMaterial: THREE.MeshStandardMaterial
  private readonly edgeMaterial: THREE.LineBasicMaterial
  private readonly canopyMaterial: THREE.MeshStandardMaterial
  private readonly trunkMaterial: THREE.MeshStandardMaterial
  private readonly poleMaterial: THREE.MeshStandardMaterial
  private readonly lampMaterial: THREE.MeshBasicMaterial
  private readonly crownMaterial: THREE.PointsMaterial
  private readonly shadowMaterial: THREE.MeshBasicMaterial
  private readonly carMaterial: THREE.MeshBasicMaterial
  private carWarm = 0x3b82f6
  private carCool = 0x93c5fd
  private readonly carMesh: THREE.InstancedMesh
  private lampMesh: THREE.InstancedMesh | null = null
  private cardShadowMesh: THREE.InstancedMesh | null = null
  private hoverActive = false
  private districtMix = 0
  private litBase = 0.06
  private readonly tint = new THREE.Color()
  private readonly matrix = new THREE.Matrix4()
  private readonly quaternion = new THREE.Quaternion()
  private readonly position = new THREE.Vector3()
  private readonly scale = new THREE.Vector3()
  private readonly ownedTextures: THREE.Texture[] = []

  constructor(curve: CurveLike, palette: CityPalette) {
    this.group.name = 'tool-city'
    this.plan = buildCityPlan(curve)

    this.buildingMaterial = new THREE.ShaderMaterial({
      vertexShader: BUILDING_VERTEX,
      fragmentShader: BUILDING_FRAGMENT,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uWall: { value: new THREE.Color(palette.wall) },
          uGlass: { value: new THREE.Color(palette.glass) },
          uLit: { value: new THREE.Color(palette.lit) },
          uRoof: { value: new THREE.Color(palette.roof) },
          uFrame: { value: new THREE.Color(palette.frame) },
          uSky: { value: new THREE.Color(palette.sky) },
          uLitChance: { value: palette.litChance },
          uTintA: { value: new THREE.Color(0.99, 1.0, 1.02) },
          uTintB: { value: new THREE.Color(1.02, 1.0, 0.98) },
          uActiveZone: { value: -1 },
          uGroupSplit: { value: 4 },
          uActiveMix: { value: 0 }
        }
      ])
    })
    this.groundMaterial = new THREE.ShaderMaterial({
      vertexShader: GROUND_VERTEX,
      fragmentShader: GROUND_FRAGMENT,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uNear: { value: new THREE.Color(palette.roadNear) },
          uFar: { value: new THREE.Color(palette.roadFar) }
        }
      ])
    })

    this.capMaterial = new THREE.MeshStandardMaterial({ color: palette.cap, roughness: 0.55 })
    this.mechMaterial = new THREE.MeshStandardMaterial({ color: palette.mech, roughness: 0.82 })
    this.edgeMaterial = new THREE.LineBasicMaterial({
      color: palette.edge,
      transparent: true,
      opacity: 0.32,
      depthWrite: false
    })
    this.sidewalkMaterial = new THREE.MeshBasicMaterial({ color: palette.sidewalk })
    this.avenueMaterial = new THREE.MeshBasicMaterial({ color: palette.avenue })
    this.lotMaterial = new THREE.MeshBasicMaterial({ color: palette.lot })
    this.parkMaterial = new THREE.MeshBasicMaterial({ color: palette.park })
    this.markingMaterial = new THREE.MeshBasicMaterial({
      color: palette.marking,
      transparent: true,
      opacity: 0.86
    })
    this.accentMaterial = new THREE.MeshBasicMaterial({
      color: palette.accent,
      transparent: true,
      opacity: 0.26
    })
    this.curbMaterial = new THREE.MeshBasicMaterial({ color: palette.cap })
    this.canopyMaterial = new THREE.MeshStandardMaterial({
      color: palette.tree,
      roughness: 0.9,
      flatShading: true
    })
    this.trunkMaterial = new THREE.MeshStandardMaterial({ color: palette.trunk, roughness: 0.9 })
    this.poleMaterial = new THREE.MeshStandardMaterial({ color: palette.mech, roughness: 0.62 })
    this.lampMaterial = new THREE.MeshBasicMaterial({ color: palette.lamp })
    const glow = glowTexture()
    this.ownedTextures.push(glow)
    this.crownMaterial = new THREE.PointsMaterial({
      color: palette.lit,
      size: 1.9,
      map: glow,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      sizeAttenuation: true
    })
    this.shadowMaterial = new THREE.MeshBasicMaterial({
      color: palette.shadow,
      map: shadowTexture(),
      transparent: true,
      opacity: 0.19,
      depthWrite: false
    })
    this.carMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
    this.carMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.46, 0.28, 1.1),
      this.carMaterial,
      Math.max(1, this.plan.cars.length)
    )
    if (this.shadowMaterial.map) this.ownedTextures.push(this.shadowMaterial.map)

    this.buildGround()
    this.buildPads()
    this.buildBuildings()
    this.buildRoadSurface()
    this.buildStreetLife()
    this.buildTraffic()
    this.buildLines()
  }

  private buildGround() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), this.groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.set(0, 0, -60)
    this.group.add(ground)
  }

  private buildPads() {
    const sidewalk = new QuadBuilder()
    const lot = new QuadBuilder()
    const park = new QuadBuilder()

    for (const pad of this.plan.pads) {
      const target = pad.tone === 0 ? sidewalk : pad.tone === 2 ? park : lot
      target.quad(pad.x, pad.z, pad.w, pad.d, pad.y)
    }

    const emit = (builder: QuadBuilder, material: THREE.Material) => {
      if (builder.empty) return
      this.group.add(new THREE.Mesh(builder.build(), material))
    }
    emit(sidewalk, this.sidewalkMaterial)
    emit(lot, this.lotMaterial)
    emit(park, this.parkMaterial)
  }

  private buildBuildings() {
    const { bodies, rounds, caps, roofs, shadows } = this.plan

    if (bodies.length) {
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      geometry.setAttribute(
        'aSeed',
        new THREE.InstancedBufferAttribute(
          Float32Array.from(bodies, (b) => b.seed),
          1
        )
      )
      geometry.setAttribute(
        'aTone',
        new THREE.InstancedBufferAttribute(
          Float32Array.from(bodies, (b) => b.tone),
          1
        )
      )
      geometry.setAttribute(
        'aZone',
        new THREE.InstancedBufferAttribute(
          Float32Array.from(bodies, (b) => this.plan.zoneOf(b.x, b.z)),
          1
        )
      )
      const mesh = new THREE.InstancedMesh(geometry, this.buildingMaterial, bodies.length)
      this.fill(mesh, bodies)
      this.group.add(mesh)
    }

    if (rounds.length) {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 18, 1)
      geometry.setAttribute(
        'aSeed',
        new THREE.InstancedBufferAttribute(
          Float32Array.from(rounds, (r) => r.seed),
          1
        )
      )
      geometry.setAttribute(
        'aTone',
        new THREE.InstancedBufferAttribute(
          Float32Array.from(rounds, (r) => r.tone),
          1
        )
      )
      geometry.setAttribute(
        'aZone',
        new THREE.InstancedBufferAttribute(
          Float32Array.from(rounds, (r) => this.plan.zoneOf(r.x, r.z)),
          1
        )
      )
      const mesh = new THREE.InstancedMesh(geometry, this.buildingMaterial, rounds.length)
      rounds.forEach((round, index) => {
        this.position.set(round.x, round.y, round.z)
        this.scale.set(round.radius * 2, round.height, round.radius * 2)
        this.matrix.compose(this.position, this.quaternion, this.scale)
        mesh.setMatrixAt(index, this.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.frustumCulled = false
      this.group.add(mesh)
    }

    if (caps.length) {
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        this.capMaterial,
        caps.length
      )
      this.fill(mesh, caps)
      this.group.add(mesh)
    }

    if (roofs.length) {
      const mesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        this.mechMaterial,
        roofs.length
      )
      this.fill(mesh, roofs)
      this.group.add(mesh)
    }

    if (shadows.length) {
      const plane = new THREE.PlaneGeometry(1, 1)
      plane.rotateX(-Math.PI / 2)
      const mesh = new THREE.InstancedMesh(plane, this.shadowMaterial, shadows.length)
      shadows.forEach((footprint, index) => {
        this.position.set(footprint.x, 0.21, footprint.z)
        this.scale.set(footprint.w, 1, footprint.d)
        this.matrix.compose(this.position, this.quaternion, this.scale)
        mesh.setMatrixAt(index, this.matrix)
      })
      mesh.instanceMatrix.needsUpdate = true
      mesh.frustumCulled = false
      mesh.renderOrder = 1
      this.group.add(mesh)
    }
  }

  private buildRoadSurface() {
    const { marks, frames } = this.plan
    const dashes = new QuadBuilder()
    const crossings = new QuadBuilder()
    const lines = new QuadBuilder()
    const asphalt = new QuadBuilder()
    const walk = new QuadBuilder()
    const curb = new QuadBuilder()

    for (const mark of marks) {
      const target = mark.tone === 2 ? lines : mark.tone === 1 ? crossings : dashes
      target.quad(mark.x, mark.z, mark.len, mark.wid, 0.28, mark.angle)
    }

    asphalt.strip(frames, 0, AVENUE_HALF * 2 + 1.6, 0.15)
    for (const side of [-1, 1]) {
      walk.strip(frames, side * (AVENUE_HALF + 2.3), 3, 0.17)
      curb.strip(frames, side * (AVENUE_HALF + 0.85), 0.5, 0.22)
      lines.strip(frames, side * (AVENUE_HALF - 0.5), 0.1, 0.28)
    }
    lines.strip(frames, 0, 0.18, 0.28)

    const emit = (builder: QuadBuilder, material: THREE.Material, renderOrder: number) => {
      if (builder.empty) return
      const mesh = new THREE.Mesh(builder.build(), material)
      mesh.renderOrder = renderOrder
      this.group.add(mesh)
    }
    emit(asphalt, this.avenueMaterial, 0)
    emit(walk, this.sidewalkMaterial, 0)
    emit(curb, this.curbMaterial, 1)
    emit(dashes, this.markingMaterial, 2)
    emit(crossings, this.markingMaterial, 2)
    emit(lines, this.accentMaterial, 2)
  }

  private buildStreetLife() {
    const { trees, lamps, crowns } = this.plan

    if (trees.length) {
      const canopy = new THREE.InstancedMesh(
        new THREE.IcosahedronGeometry(0.62, 0),
        this.canopyMaterial,
        trees.length
      )
      const trunks = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.06, 0.09, 0.9, 5),
        this.trunkMaterial,
        trees.length
      )
      trees.forEach((tree, index) => {
        this.position.set(tree.x, 0.95 + tree.scale * 0.6, tree.z)
        this.scale.set(tree.scale * 2, tree.scale * 1.7, tree.scale * 2)
        this.matrix.compose(this.position, this.quaternion, this.scale)
        canopy.setMatrixAt(index, this.matrix)
        this.position.set(tree.x, 0.45, tree.z)
        this.scale.setScalar(1)
        this.matrix.compose(this.position, this.quaternion, this.scale)
        trunks.setMatrixAt(index, this.matrix)
      })
      canopy.instanceMatrix.needsUpdate = true
      trunks.instanceMatrix.needsUpdate = true
      this.group.add(canopy, trunks)
    }

    if (lamps.length) {
      const poles = new THREE.InstancedMesh(
        new THREE.CylinderGeometry(0.045, 0.07, 1.7, 5),
        this.poleMaterial,
        lamps.length
      )
      const heads = new THREE.InstancedMesh(
        new THREE.SphereGeometry(0.13, 8, 6),
        this.lampMaterial,
        lamps.length
      )
      lamps.forEach((lamp, index) => {
        this.scale.setScalar(1)
        this.position.set(lamp.x, 0.95, lamp.z)
        this.matrix.compose(this.position, this.quaternion, this.scale)
        poles.setMatrixAt(index, this.matrix)
        this.position.set(lamp.x, 1.85, lamp.z)
        this.matrix.compose(this.position, this.quaternion, this.scale)
        heads.setMatrixAt(index, this.matrix)
      })
      poles.instanceMatrix.needsUpdate = true
      heads.instanceMatrix.needsUpdate = true
      lamps.forEach((_lamp, index) => heads.setColorAt(index, this.tint.setScalar(1)))
      if (heads.instanceColor) heads.instanceColor.needsUpdate = true
      this.lampMesh = heads
      this.group.add(poles, heads)
    }

    if (crowns.length) {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          crowns.flatMap((crown) => [crown.x, crown.y, crown.z]),
          3
        )
      )
      const points = new THREE.Points(geometry, this.crownMaterial)
      points.renderOrder = 4
      this.group.add(points)
    }
  }

  private buildTraffic() {
    this.carMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    this.carMesh.frustumCulled = false
    this.carMesh.renderOrder = 3
    this.paintCars()
    this.group.add(this.carMesh)
  }

  private paintCars() {
    const warm = new THREE.Color(this.carWarm)
    const cool = new THREE.Color(this.carCool)
    this.plan.cars.forEach((car, index) => {
      this.carMesh.setColorAt(index, car.speed > 0 ? warm : cool)
    })
    if (this.carMesh.instanceColor) this.carMesh.instanceColor.needsUpdate = true
  }

  private buildLines() {
    const edges: number[] = []
    for (const body of this.plan.bodies) {
      if (body.sy > 8.5) boxEdges(edges, body)
    }
    for (const pad of this.plan.pads) {
      if (pad.tone !== 0) continue
      const x0 = pad.x - pad.w / 2
      const x1 = pad.x + pad.w / 2
      const z0 = pad.z - pad.d / 2
      const z1 = pad.z + pad.d / 2
      const y = 0.09
      edges.push(
        x0,
        y,
        z0,
        x1,
        y,
        z0,
        x1,
        y,
        z0,
        x1,
        y,
        z1,
        x1,
        y,
        z1,
        x0,
        y,
        z1,
        x0,
        y,
        z1,
        x0,
        y,
        z0
      )
    }
    const all = edges.concat(this.plan.lines)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(all, 3))
    const lines = new THREE.LineSegments(geometry, this.edgeMaterial)
    lines.renderOrder = 2
    this.group.add(lines)
  }

  private fill(mesh: THREE.InstancedMesh, items: BoxInstance[]) {
    items.forEach((item, index) => {
      this.position.set(item.x, item.y, item.z)
      this.scale.set(item.sx, item.sy, item.sz)
      this.matrix.compose(this.position, this.quaternion, this.scale)
      mesh.setMatrixAt(index, this.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.frustumCulled = false
  }

  private sampleFrame(t: number) {
    const frames = this.plan.frames
    const raw = Math.min(0.9999, Math.max(0, t)) * (frames.length - 1)
    const i = Math.floor(raw)
    const j = Math.min(frames.length - 1, i + 1)
    const a = raw - i
    const first = frames[i]
    const next = frames[j]
    return {
      x: first.x + (next.x - first.x) * a,
      z: first.z + (next.z - first.z) * a,
      tx: first.tx + (next.tx - first.tx) * a,
      tz: first.tz + (next.tz - first.tz) * a
    }
  }

  centerlineX(z: number) {
    const frames = this.plan.frames
    const last = frames.length - 1
    let lo = 0
    let hi = last
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (frames[mid].z > z) lo = mid + 1
      else hi = mid
    }
    const a = frames[Math.max(0, lo - 1)]
    const b = frames[Math.min(last, lo)]
    const span = a.z - b.z
    const t = Math.abs(span) < 1e-6 ? 0 : (a.z - z) / span
    return a.x + (b.x - a.x) * Math.min(1, Math.max(0, t))
  }

  avenuePoint(t: number) {
    return this.sampleFrame(t)
  }

  highlightLamps(x: number, z: number, radius: number, strength: number) {
    if (!this.lampMesh) return
    this.plan.lamps.forEach((lamp, index) => {
      let gain = 1
      if (radius > 0) {
        const distance = Math.hypot(lamp.x - x, lamp.z - z)
        if (distance < radius) gain = 1 + (strength - 1) * (1 - distance / radius)
      }
      this.lampMesh?.setColorAt(index, this.tint.setScalar(gain))
    })
    if (this.lampMesh.instanceColor) this.lampMesh.instanceColor.needsUpdate = true
  }

  clearLampHighlight() {
    this.highlightLamps(0, 0, 0, 1)
  }

  setHoverActive(active: boolean) {
    this.hoverActive = active
  }

  setDistrict(index: number | null) {
    this.buildingMaterial.uniforms.uActiveZone.value = index === null ? -1 : index
  }

  setCardShadows(items: { x: number; z: number; r: number }[]) {
    if (!this.cardShadowMesh) {
      const plane = new THREE.PlaneGeometry(1, 1)
      plane.rotateX(-Math.PI / 2)
      this.cardShadowMesh = new THREE.InstancedMesh(plane, this.shadowMaterial, 8)
      this.cardShadowMesh.frustumCulled = false
      this.cardShadowMesh.renderOrder = 1
      this.group.add(this.cardShadowMesh)
    }
    for (let i = 0; i < 8; i++) {
      const item = items[i]
      this.position.set(item ? item.x : 0, 0.2, item ? item.z : 0)
      const span = item ? item.r : 0
      this.scale.set(span, 1, span)
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.cardShadowMesh.setMatrixAt(i, this.matrix)
    }
    this.cardShadowMesh.instanceMatrix.needsUpdate = true
  }

  setGroupSplit(count: number) {
    this.buildingMaterial.uniforms.uGroupSplit.value = count
  }

  update(elapsed: number) {
    this.buildingMaterial.uniforms.uLitChance.value =
      this.litBase + (this.hoverActive ? 0 : Math.sin(elapsed * 1.21) * 0.008)

    const districtTarget = this.buildingMaterial.uniforms.uActiveZone.value >= 0 ? 1 : 0
    this.districtMix += (districtTarget - this.districtMix) * 0.09
    if (Math.abs(this.districtMix - districtTarget) < 0.004) this.districtMix = districtTarget
    this.buildingMaterial.uniforms.uActiveMix.value = this.districtMix

    this.plan.cars.forEach((car, index) => {
      let t = car.t + elapsed * car.speed
      t = ((t % 1) + 1) % 1
      const frame = this.sampleFrame(t)
      const len = Math.hypot(frame.tx, frame.tz) || 1
      const ux = frame.tx / len
      const uz = frame.tz / len
      this.position.set(frame.x - uz * car.lane, 0.48, frame.z + ux * car.lane)
      this.quaternion.setFromAxisAngle(UP, Math.atan2(ux, uz) + (car.speed < 0 ? Math.PI : 0))
      this.scale.setScalar(1)
      this.matrix.compose(this.position, this.quaternion, this.scale)
      this.carMesh.setMatrixAt(index, this.matrix)
    })
    this.carMesh.instanceMatrix.needsUpdate = true

    this.crownMaterial.opacity = 0.34 + 0.36 * Math.abs(Math.sin(elapsed * 1.15))
  }

  setPalette(palette: CityPalette) {
    const uniforms = this.buildingMaterial.uniforms
    uniforms.uWall.value.setHex(palette.wall)
    uniforms.uGlass.value.setHex(palette.glass)
    uniforms.uLit.value.setHex(palette.lit)
    uniforms.uRoof.value.setHex(palette.roof)
    uniforms.uFrame.value.setHex(palette.frame)
    uniforms.uSky.value.setHex(palette.sky)
    this.litBase = palette.litChance
    uniforms.uLitChance.value = palette.litChance

    this.groundMaterial.uniforms.uNear.value.setHex(palette.roadNear)
    this.groundMaterial.uniforms.uFar.value.setHex(palette.roadFar)
    this.sidewalkMaterial.color.setHex(palette.sidewalk)
    this.avenueMaterial.color.setHex(palette.avenue)
    this.lotMaterial.color.setHex(palette.lot)
    this.parkMaterial.color.setHex(palette.park)
    this.markingMaterial.color.setHex(palette.marking)
    this.accentMaterial.color.setHex(palette.accent)
    this.curbMaterial.color.setHex(palette.cap)
    this.capMaterial.color.setHex(palette.cap)
    this.mechMaterial.color.setHex(palette.mech)
    this.edgeMaterial.color.setHex(palette.edge)
    this.canopyMaterial.color.setHex(palette.tree)
    this.trunkMaterial.color.setHex(palette.trunk)
    this.poleMaterial.color.setHex(palette.mech)
    this.lampMaterial.color.setHex(palette.lamp)
    this.crownMaterial.color.setHex(palette.lit)
    this.shadowMaterial.color.setHex(palette.shadow)
    this.carWarm = palette.carWarm
    this.carCool = palette.carCool
    this.paintCars()
  }

  dispose() {
    this.group.traverse((child) => {
      if (
        child instanceof THREE.Mesh ||
        child instanceof THREE.LineSegments ||
        child instanceof THREE.Points
      ) {
        child.geometry.dispose()
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        for (const material of materials) material.dispose()
      }
    })
    for (const texture of this.ownedTextures) texture.dispose()
    this.group.removeFromParent()
    this.group.clear()
  }
}

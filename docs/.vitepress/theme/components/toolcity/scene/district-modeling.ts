import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export type Point3 = readonly [number, number, number]
type ModelMesh = THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>

/** 仅管理本街区拥有的资源；动态部件以 Group 为合批边界。 */
export class DistrictModeling {
  private readonly geometries = new Set<THREE.BufferGeometry>()
  private readonly materials = new Set<THREE.MeshStandardMaterial>()
  private readonly cache = new Map<string, THREE.BufferGeometry>()
  private readonly up = new THREE.Vector3(0, 1, 0)

  material(color: number, options: THREE.MeshStandardMaterialParameters = {}) {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.82, ...options })
    this.materials.add(material)
    return material
  }

  private geometry(key: string, create: () => THREE.BufferGeometry) {
    const cached = this.cache.get(key)
    if (cached) return cached
    const geometry = create()
    this.geometries.add(geometry)
    this.cache.set(key, geometry)
    return geometry
  }

  mesh(
    parent: THREE.Group,
    geometry: THREE.BufferGeometry,
    material: THREE.MeshStandardMaterial,
    position: Point3,
    scale: Point3 = [1, 1, 1]
  ): ModelMesh {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(...position)
    mesh.scale.set(...scale)
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  box(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    size: Point3,
    position: Point3,
    radius = 0.08
  ) {
    const key = `box:${size.join(':')}:${radius}`
    const geometry = this.geometry(key, () => {
      if (radius === 0) return new THREE.BoxGeometry(...size)
      const segments = Math.min(...size) < 0.25 ? 1 : 2
      return new RoundedBoxGeometry(...size, segments, radius)
    })
    return this.mesh(parent, geometry, material, position)
  }

  cylinder(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    radius: number,
    height: number,
    position: Point3,
    topRadius = radius
  ) {
    const geometry = this.geometry(
      `cylinder:${topRadius}:${radius}:${height}`,
      () => new THREE.CylinderGeometry(topRadius, radius, height, 24)
    )
    return this.mesh(parent, geometry, material, position)
  }

  sphere(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    position: Point3,
    scale: Point3
  ) {
    const geometry = this.geometry('sphere', () => new THREE.SphereGeometry(1, 12, 8))
    return this.mesh(parent, geometry, material, position, scale)
  }

  canopy(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    position: Point3,
    scale: Point3
  ) {
    const geometry = this.geometry('canopy', () => new THREE.IcosahedronGeometry(1, 1))
    return this.mesh(parent, geometry, material, position, scale)
  }

  dome(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    radius: number,
    position: Point3
  ) {
    const geometry = this.geometry(
      `dome:${radius}`,
      () => new THREE.SphereGeometry(radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    )
    return this.mesh(parent, geometry, material, position)
  }

  ring(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    radius: number,
    tube: number,
    position: Point3,
    arc = Math.PI * 2
  ) {
    const geometry = this.geometry(
      `ring:${radius}:${tube}:${arc}`,
      () => new THREE.TorusGeometry(radius, tube, 6, 48, arc)
    )
    return this.mesh(parent, geometry, material, position)
  }

  /** 沿曲线生成贴地条带，用于河道和步道；两端按曲线端点截平。 */
  ribbon(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    points: readonly Point3[],
    halfWidth: number,
    height: number
  ) {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      'catmullrom',
      0.25
    )
    const segments = 64
    const positions: number[] = []
    const uvs: number[] = []
    const indices: number[] = []
    const point = new THREE.Vector3()
    const tangent = new THREE.Vector3()
    const side = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    for (let index = 0; index <= segments; index++) {
      curve.getPointAt(index / segments, point)
      curve.getTangentAt(index / segments, tangent)
      side.crossVectors(up, tangent).normalize().multiplyScalar(halfWidth)
      positions.push(point.x - side.x, height, point.z - side.z)
      positions.push(point.x + side.x, height, point.z + side.z)
      uvs.push(0, index / segments, 1, index / segments)
      if (index < segments) {
        const start = index * 2
        indices.push(start, start + 2, start + 1, start + 1, start + 2, start + 3)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    this.geometries.add(geometry)
    const mesh = this.mesh(parent, geometry, material, [0, 0, 0])
    mesh.castShadow = false
    mesh.receiveShadow = true
    return mesh
  }

  /** 低频起伏的缓丘网格；前后缘落回地面，避免山体与沙盘之间出现硬切边。 */
  ridge(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    bounds: readonly [number, number, number, number],
    amplitude: number,
    phase: number
  ) {
    const [xMin, xMax, zMin, zMax] = bounds
    const columns = 72
    const rows = 10
    const positions: number[] = []
    const uvs: number[] = []
    const colors: number[] = []
    const indices: number[] = []
    for (let row = 0; row <= rows; row++) {
      const v = row / rows
      const z = THREE.MathUtils.lerp(zMin, zMax, v)
      const cross = Math.pow(Math.sin(Math.PI * v), 1.25)
      for (let column = 0; column <= columns; column++) {
        const u = column / columns
        const x = THREE.MathUtils.lerp(xMin, xMax, u)
        const crest =
          0.78 +
          0.16 * Math.sin(u * 8.2 + phase) +
          0.09 * Math.sin(u * 19.7 - phase * 0.6) +
          0.04 * Math.sin(u * 37 + phase * 1.9)
        const rise = Math.min(1, cross * crest)
        positions.push(x, cross * amplitude * crest, z)
        uvs.push(u, v)
        /** 两端提亮、中段加深：山脚融进地面，丘顶融进天空，只剩坡面自身的明暗。 */
        const shade = 0.84 + 0.16 * Math.pow(Math.abs(rise * 2 - 1), 1.6)
        colors.push(shade, shade, shade)
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const start = row * (columns + 1) + column
        const next = start + columns + 1
        indices.push(start, next, start + 1, start + 1, next, next + 1)
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    this.geometries.add(geometry)
    const mesh = this.mesh(parent, geometry, material, [0, 0, 0])
    mesh.castShadow = false
    mesh.receiveShadow = false
    return mesh
  }

  segment(
    parent: THREE.Group,
    material: THREE.MeshStandardMaterial,
    start: Point3,
    end: Point3,
    radius = 0.025
  ) {
    const from = new THREE.Vector3(...start)
    const to = new THREE.Vector3(...end)
    const direction = to.clone().sub(from)
    const length = direction.length()
    const geometry = this.geometry('segment', () => new THREE.CylinderGeometry(1, 1, 1, 6))
    const midpoint = from.add(to).multiplyScalar(0.5)
    const mesh = this.mesh(
      parent,
      geometry,
      material,
      [midpoint.x, midpoint.y, midpoint.z],
      [radius, length, radius]
    )
    if (length > 0) mesh.quaternion.setFromUnitVectors(this.up, direction.divideScalar(length))
    return mesh
  }

  /** 静态装饰组不需要单独交互，将其变换烘焙到子对象以参加父级合批。 */
  bake(group: THREE.Group) {
    const parent = group.parent
    if (!parent) return
    group.updateMatrix()
    for (const child of [...group.children]) {
      child.applyMatrix4(group.matrix)
      parent.add(child)
    }
    group.removeFromParent()
  }

  /** 只合并同一组的静态网格，保留地标祖先、动画组和阴影语义。 */
  batch(root: THREE.Group) {
    for (const child of [...root.children]) {
      if (child instanceof THREE.Group) this.batch(child)
    }
    const buckets = new Map<string, ModelMesh[]>()
    for (const child of root.children) {
      if (
        !(child instanceof THREE.Mesh) ||
        !(child.material instanceof THREE.MeshStandardMaterial)
      ) {
        continue
      }
      const mesh = child as ModelMesh
      const key = `${mesh.material.uuid}:${mesh.castShadow}:${mesh.receiveShadow}`
      const bucket = buckets.get(key)
      if (bucket) bucket.push(mesh)
      else buckets.set(key, [mesh])
    }
    for (const meshes of buckets.values()) {
      if (meshes.length < 2) continue
      const parts: THREE.BufferGeometry[] = []
      try {
        for (const mesh of meshes) {
          mesh.updateMatrix()
          const part = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()
          this.geometries.add(part)
          parts.push(part)
          part.applyMatrix4(mesh.matrix)
          part.clearGroups()
        }
        const geometry = mergeGeometries(parts, false)
        if (!geometry) throw new Error('Unable to batch district geometry')
        this.geometries.add(geometry)
        geometry.computeBoundingBox()
        geometry.computeBoundingSphere()
        const first = meshes[0]
        const merged = this.mesh(root, geometry, first.material, [0, 0, 0])
        merged.name = 'district-static-batch'
        merged.castShadow = first.castShadow
        merged.receiveShadow = first.receiveShadow
        for (const mesh of meshes) root.remove(mesh)
      } finally {
        for (const part of parts) this.releaseGeometry(part)
      }
    }
  }

  /** 合批后丢弃不再被网格引用的源几何，避免保留两套顶点数据。 */
  finish(root: THREE.Group) {
    this.batch(root)
    const used = new Set<THREE.BufferGeometry>()
    root.traverse((object) => {
      if (object instanceof THREE.Mesh) used.add(object.geometry)
    })
    for (const geometry of this.geometries) {
      if (!used.has(geometry)) this.releaseGeometry(geometry)
    }
    this.cache.clear()
  }

  private releaseGeometry(geometry: THREE.BufferGeometry) {
    if (this.geometries.delete(geometry)) geometry.dispose()
  }

  dispose() {
    const textures = new Set<THREE.Texture>()
    for (const material of this.materials) {
      const values: unknown[] = Object.values(material)
      for (const value of values) {
        if (value instanceof THREE.Texture) textures.add(value)
      }
      material.dispose()
    }
    for (const texture of textures) texture.dispose()
    for (const geometry of this.geometries) geometry.dispose()
    this.materials.clear()
    this.geometries.clear()
    this.cache.clear()
  }
}

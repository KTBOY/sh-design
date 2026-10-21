import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export type IconKind = 'layers' | 'chart' | 'code' | 'cloud' | 'flash' | 'book' | 'gem'

const glass = new THREE.MeshPhysicalMaterial({
  fog: false,
  color: 0xc2e2ff,
  emissive: 0xc2e2ff,
  emissiveIntensity: 0.34,
  transparent: true,
  opacity: 0.72,
  roughness: 0.07,
  metalness: 0,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
  side: THREE.DoubleSide,
  depthWrite: false
})

const glassFacet = new THREE.MeshPhysicalMaterial({
  fog: false,
  color: 0xcfe7ff,
  emissive: 0xcfe7ff,
  emissiveIntensity: 0.34,
  transparent: true,
  opacity: 0.62,
  roughness: 0.05,
  metalness: 0,
  clearcoat: 1,
  flatShading: true,
  depthWrite: false
})

const glassSoft = new THREE.MeshPhysicalMaterial({
  fog: false,
  color: 0xe2f0ff,
  emissive: 0xe2f0ff,
  emissiveIntensity: 0.3,
  transparent: true,
  opacity: 0.62,
  roughness: 0.14,
  metalness: 0,
  clearcoat: 0.85,
  clearcoatRoughness: 0.12,
  side: THREE.DoubleSide,
  depthWrite: false
})

const blue = new THREE.MeshStandardMaterial({
  fog: false,
  color: 0x3b82f6,
  roughness: 0.24,
  metalness: 0.04,
  emissive: 0x2f6fe4,
  emissiveIntensity: 0.42
})

const deep = new THREE.MeshStandardMaterial({
  fog: false,
  color: 0x1e3a8a,
  roughness: 0.3,
  metalness: 0.08,
  emissive: 0x24408f,
  emissiveIntensity: 0.34
})

const pale = new THREE.MeshStandardMaterial({
  fog: false,
  color: 0xe8f3ff,
  emissive: 0xe8f3ff,
  emissiveIntensity: 0.3,
  roughness: 0.34,
  metalness: 0.02
})

const white = new THREE.MeshStandardMaterial({
  fog: false,
  color: 0xf8fbff,
  emissive: 0xf8fbff,
  emissiveIntensity: 0.28,
  roughness: 0.4,
  metalness: 0
})

function rounded(width: number, height: number, depth: number, radius = 0.18) {
  return new RoundedBoxGeometry(width, height, depth, 3, radius)
}

function add(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0]
) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  group.add(mesh)
  return mesh
}

/* 三层组件板：三片冰面 + 顶层蓝色组件标记 */
function makeLayers() {
  const group = new THREE.Group()
  const layers = [
    { y: -0.95, z: -0.6, x: -0.16, tone: glassSoft },
    { y: 0, z: 0, x: 0, tone: glass },
    { y: 0.95, z: 0.6, x: 0.16, tone: glass }
  ]
  for (const layer of layers) {
    add(
      group,
      rounded(4.05, 2.85, 0.2, 0.26),
      layer.tone,
      [layer.x, layer.y, layer.z],
      [-0.06, 0.2, 0]
    )
  }
  add(group, rounded(1.45, 1.1, 0.1, 0.18), pale, [0.16, 0.98, 0.74], [-0.06, 0.2, 0])
  const token = new THREE.Shape()
  token.moveTo(-0.5, -0.42)
  token.lineTo(0.5, -0.42)
  token.lineTo(0, 0.5)
  token.closePath()
  const tokenGeometry = new THREE.ExtrudeGeometry(token, {
    depth: 0.16,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.04,
    bevelThickness: 0.03,
    curveSegments: 2
  })
  tokenGeometry.translate(0, 0, -0.08)
  add(group, tokenGeometry, blue, [0.16, 0.98, 0.8], [-0.06, 0.2, 0])
  return group
}

/* 柱状图 + 折线：底座、四根柱、柱顶连接线与节点 */
function makeChart() {
  const group = new THREE.Group()
  add(group, rounded(4.4, 0.3, 2.0, 0.12), pale, [0, -1.5, 0])
  const heights = [1.3, 2.3, 3.3, 2.7]
  const xs = [-1.5, -0.5, 0.5, 1.5]
  heights.forEach((height, index) => {
    add(group, rounded(0.74, height, 0.74, 0.14), index === 2 ? blue : glassSoft, [
      xs[index],
      -1.35 + height / 2,
      0
    ])
  })
  const tops = heights.map((height, index) => ({ x: xs[index], y: -1.35 + height }))
  for (let i = 0; i < tops.length - 1; i++) {
    const a = tops[i]
    const b = tops[i + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    add(
      group,
      rounded(0.13, Math.hypot(dx, dy), 0.13, 0.05),
      deep,
      [(a.x + b.x) / 2, (a.y + b.y) / 2, 0.5],
      [0, 0, Math.atan2(-dx, dy)]
    )
  }
  for (const top of tops) {
    add(group, new THREE.SphereGeometry(0.15, 12, 10), blue, [top.x, top.y + 0.05, 0.5])
  }
  return group
}

/* 代码块：玻璃机身边框 + 内嵌面板 + 尖括号与斜杠 */
function makeCode() {
  const group = new THREE.Group()
  add(group, rounded(3.1, 2.7, 0.95, 0.36), glass, [0, 0.1, 0], [0, 0.28, 0])
  add(group, rounded(2.3, 1.95, 0.1, 0.18), pale, [0, 0.12, 0.5], [0, 0.28, 0])
  const bracket = rounded(0.22, 1.15, 0.2, 0.09)
  for (const direction of [-1, 1]) {
    add(group, bracket, deep, [direction * 1.02, 0.42, 0.58], [0, 0.28, direction * 0.72])
    add(group, bracket, deep, [direction * 1.02, -0.2, 0.58], [0, 0.28, -direction * 0.72])
  }
  add(group, rounded(0.2, 1.35, 0.22, 0.08), blue, [0, 0.12, 0.6], [0, 0.28, 0.42])
  return group
}

/* 云：五瓣主体 + 平底 + 蓝色核心 */
function makeCloud() {
  const group = new THREE.Group()
  const lobes = [
    { x: 0, y: 0.45, z: 0, r: 1.12 },
    { x: -1.28, y: 0.05, z: 0.05, r: 0.92 },
    { x: 1.3, y: 0.02, z: 0, r: 0.86 },
    { x: -0.58, y: -0.32, z: 0.16, r: 0.78 },
    { x: 0.62, y: -0.34, z: 0.12, r: 0.82 }
  ]
  const sphere = new THREE.SphereGeometry(1, 26, 18)
  for (const lobe of lobes) {
    const mesh = add(group, sphere, glassSoft, [lobe.x, lobe.y, lobe.z])
    mesh.scale.setScalar(lobe.r)
  }
  add(group, rounded(3.2, 0.5, 1.55, 0.24), glassSoft, [0, -0.72, 0.06])
  add(group, new THREE.SphereGeometry(0.52, 20, 14), blue, [0.05, 0.16, 0.62])
  return group
}

function boltShape() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.25, 2.3)
  shape.lineTo(1.25, 2.3)
  shape.lineTo(0.35, 0.55)
  shape.lineTo(1.35, 0.55)
  shape.lineTo(-0.9, -2.35)
  shape.lineTo(-0.15, -0.25)
  shape.lineTo(-1.1, -0.25)
  shape.closePath()
  return shape
}

/* 闪电：蓝色本体 + 冰壳光晕（同一轮廓，避免内外双影） */
function makeFlash() {
  const group = new THREE.Group()
  const rotation: [number, number, number] = [0.12, 0.34, -0.06]
  const halo = new THREE.ExtrudeGeometry(boltShape(), {
    depth: 0.26,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.1,
    bevelThickness: 0.08,
    curveSegments: 4
  })
  halo.translate(-0.125, 0.025, -0.13)
  halo.scale(1.16, 1.16, 1)
  halo.translate(0.125, -0.025, 0)
  const bolt = new THREE.ExtrudeGeometry(boltShape(), {
    depth: 0.34,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    curveSegments: 4
  })
  bolt.translate(0, 0, -0.17)
  add(group, halo, glass, [0, 0.1, -0.18], rotation)
  add(group, bolt, blue, [0, 0.1, 0.04], rotation)
  return group
}

/* 翻开的书：两块书页 + 封面板 + 书脊 + 页缘 */
function makeBook() {
  const group = new THREE.Group()
  for (const direction of [-1, 1]) {
    const tilt = direction * 0.42
    add(
      group,
      rounded(2.15, 2.85, 0.34, 0.1),
      white,
      [direction * 0.98, 0.05, 0.18],
      [0, tilt, direction * 0.05]
    )
    add(
      group,
      rounded(2.35, 3.05, 0.12, 0.12),
      blue,
      [direction * 0.98, 0.05, -0.04],
      [0, tilt, direction * 0.05]
    )
    add(
      group,
      rounded(1.9, 0.06, 0.36, 0.02),
      pale,
      [direction * 0.98, -1.08, 0.18],
      [0, tilt, direction * 0.05]
    )
  }
  add(group, rounded(0.3, 2.95, 0.55, 0.12), deep, [0, 0.02, 0.05])
  return group
}

/* 宝石：冠部 + 腰线 + 亭部 + 内核 */
function makeGem() {
  const group = new THREE.Group()
  add(
    group,
    new THREE.CylinderGeometry(1.0, 1.42, 0.72, 8, 1),
    glassFacet,
    [0, 0.86, 0],
    [0, 0.4, 0]
  )
  add(group, new THREE.CylinderGeometry(1.42, 1.42, 0.14, 8, 1), deep, [0, 0.44, 0], [0, 0.4, 0])
  add(group, new THREE.CylinderGeometry(1.42, 0, 1.5, 8, 1), glass, [0, -0.32, 0], [0, 0.4, 0])
  add(group, new THREE.CylinderGeometry(1.0, 1.0, 0.06, 8, 1), pale, [0, 1.2, 0], [0, 0.4, 0])
  add(group, new THREE.OctahedronGeometry(0.62, 0), blue, [0, 0.34, 0.15])
  add(group, new THREE.SphereGeometry(0.15, 10, 8), white, [0.62, 1.22, 0.5])
  group.scale.setScalar(1.18)
  return group
}

export function createToolIcon(kind: IconKind): THREE.Group {
  switch (kind) {
    case 'layers':
      return makeLayers()
    case 'chart':
      return makeChart()
    case 'code':
      return makeCode()
    case 'cloud':
      return makeCloud()
    case 'flash':
      return makeFlash()
    case 'book':
      return makeBook()
    case 'gem':
      return makeGem()
  }
}

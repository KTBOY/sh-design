import * as THREE from 'three'
import { DistrictModeling, type Point3 } from './district-modeling'
import { LANDMARKS } from './landmarks'

export interface District {
  /** 原点不偏移的街区根组；日光和阴影贴图由外部 stage 管理。 */
  group: THREE.Group
  /** 仅地标网格；网格祖先的 userData.toolId 对应产品标识。 */
  pickables: THREE.Object3D[]
  /** 固定世界坐标的屋顶铭牌锚点；外部不要平移或缩放根组。 */
  anchors: Map<string, THREE.Vector3>
  /** 改变入口及地块细线高亮，切换时复位上一个动画。 */
  setSelection(id: string | null): void
  /** 临时强调入口，不覆盖已有选中状态。 */
  setHover(id: string | null): void
  /** 由外部驱动一次动画，进度 0 和 1 均为基础形态。 */
  animate(id: string, progress: number): void
  /** 驱动河面流纹时间；只更新材质 uniform，不重建场景。 */
  update(elapsed: number): void
  /** 幂等释放本模型资源，不管理外部 renderer。 */
  dispose(): void
}

const COLORS = {
  cream: 0xf5f1e7,
  limestone: 0xe5dfd2,
  roof: 0xd3c6ac,
  glass: 0xb4c0bc,
  dark: 0x444e50,
  ground: 0xeeeae1,
  road: 0xd1cec5,
  paving: 0xe4dfd4,
  tree: 0xa9b5a1,
  trunk: 0xaca18d,
  gold: 0xb9a071,
  lamp: 0xfff2d5,
  apron: 0xe9e4d8,
  shore: 0xd7d0c0,
  water: 0xafcac6,
  waterDeep: 0x97b4b1,
  ripple: 0xe4efeb,
  lawn: 0xc5cfb4,
  hillNear: 0xccd6c0,
  hillFar: 0xdadccf,
  wood: 0xb28f68,
  reed: 0xa6b49b
} as const

type Palette = Record<keyof typeof COLORS, THREE.MeshStandardMaterial>

function createWaterMaterial(model: DistrictModeling) {
  const time = { value: 0 }
  const material = model.material(COLORS.water, { roughness: 0.3, metalness: 0.06 })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWaterTime = time
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec2 vWaterPosition;
        varying float vWaterFlow;`
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vWaterPosition = position.xz;
        vWaterFlow = sin(position.z * 1.7 + uWaterTime * 0.55)
          + sin(position.x * 1.3 - uWaterTime * 0.42)
          + sin((position.x + position.z) * 2.6 + uWaterTime * 0.25);`
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uWaterTime;
        varying vec2 vWaterPosition;
        varying float vWaterFlow;`
      )
      .replace(
        '#include <tonemapping_fragment>',
        `float flow = vWaterPosition.y * 2.2 - uWaterTime * 1.6
          + sin(vWaterPosition.x * 0.65) * 1.5;
        float ripple = sin(flow);
        float ripple2 = sin(vWaterPosition.y * 5.4 + uWaterTime * 0.95 + vWaterPosition.x * 1.3);
        float glint = smoothstep(0.82, 1.0, sin(flow * 1.7 + 0.6));
        float breathe = 0.5 + 0.5 * sin(vWaterFlow * 0.7 + uWaterTime * 0.5);
        gl_FragColor.rgb *= 1.0 + ripple * 0.11 + breathe * 0.02;
        gl_FragColor.rgb += glint * 0.13 * vec3(0.82, 0.96, 0.92) + ripple2 * 0.018;
        #include <tonemapping_fragment>`
      )
  }
  material.customProgramCacheKey = () => 'cream-district-water'
  return { material, time }
}

interface BuildingContext {
  model: DistrictModeling
  palette: Palette
  root: THREE.Group
  accent: THREE.MeshStandardMaterial
  signal: THREE.MeshStandardMaterial
}

interface BuildingSpec {
  width: number
  depth: number
  anchorHeight: number
  build(context: BuildingContext): (amount: number) => void
}

interface BuildingState {
  accent: THREE.MeshStandardMaterial
  outline: THREE.MeshStandardMaterial
  border: THREE.Group
  pose(amount: number): void
}

const BUILDINGS: Readonly<Record<string, BuildingSpec>> = {
  'sh-design': { width: 7.2, depth: 5.8, anchorHeight: 6.45, build: buildDesign },
  'sk-chart-duo': { width: 6.7, depth: 5.2, anchorHeight: 7.7, build: buildCharts },
  'coral-coder': { width: 6.8, depth: 6.6, anchorHeight: 5.6, build: buildObservatory },
  shukelab: { width: 6.9, depth: 5.8, anchorHeight: 5.75, build: buildLab },
  flash: { width: 6.8, depth: 5.2, anchorHeight: 3.55, build: buildArcade },
  'novel-atlas': { width: 6.8, depth: 6.4, anchorHeight: 5.55, build: buildLibrary },
  'resonance-hud': { width: 7.2, depth: 5.5, anchorHeight: 4.15, build: buildHud }
}

function part(parent: THREE.Group, name: string, position: Point3 = [0, 0, 0]) {
  const group = new THREE.Group()
  group.name = name
  group.position.set(...position)
  parent.add(group)
  return group
}

function buildDesign({ model, palette: p, root, accent }: BuildingContext) {
  model.box(root, p.limestone, [6.25, 0.5, 4.3], [0, 0.45, -0.1], 0.13)
  const modules = [
    { x: -1.96, z: 0.35, height: 1.7 },
    { x: 0, z: -0.1, height: 3.2 },
    { x: 1.96, z: -0.6, height: 4.6 }
  ].map(({ x, z, height }, index) => {
    const module = part(root, `design-module-${index}`, [x, 0.7, z])
    model.box(module, p.cream, [1.85, height, 2.5], [0, height / 2, 0], 0.16)
    model.box(module, p.roof, [1.92, 0.16, 2.58], [0, height + 0.03, 0], 0.06)
    model.box(module, p.glass, [1.22, 0.4, 0.055], [0, height - 0.65, 1.255], 0.025)
    model.box(module, p.cream, [0.06, 0.43, 0.08], [0, height - 0.65, 1.28], 0.015)
    model.box(module, p.limestone, [0.42, 0.16, 0.7], [0.4, height + 0.18, -0.55], 0.04)
    return { module, x, index }
  })
  for (let step = 0; step < 3; step++) {
    model.box(
      root,
      p.cream,
      [1.7, 0.12, 0.45],
      [-1.96, 0.26 + step * 0.12, 2.45 - step * 0.32],
      0.04
    )
  }
  model.box(root, accent, [0.7, 0.85, 0.09], [-1.96, 1.15, 1.65], 0.04)
  for (const x of [-0.38, 0.38]) {
    for (const y of [1.1, 1.8]) {
      model.box(root, p.roof, [0.43, 0.43, 0.08], [x, y, 1.2], 0.08)
    }
  }
  return (amount: number) => {
    for (const { module, x, index } of modules) {
      module.position.x = x + (index - 1) * amount * 0.28
      module.position.y = 0.7 + amount * (0.12 + index * 0.08)
    }
  }
}

function buildCharts({ model, palette: p, root, accent, signal }: BuildingContext) {
  model.box(root, p.limestone, [5.8, 0.32, 3.8], [0, 0.36, -0.25], 0.14)
  const towers = [2.7, 5.6, 4.05].map((height, index) => {
    const tower = part(root, `chart-column-${index}`, [(index - 1) * 1.87, 0.52, -0.5])
    model.box(tower, p.cream, [1.4, height, 2.15], [0, height / 2, 0], 0.14)
    model.box(tower, p.roof, [1.49, 0.18, 2.25], [0, height + 0.04, 0], 0.07)
    model.box(tower, p.glass, [0.93, height * 0.63, 0.06], [0, height * 0.51, 1.08], 0.04)
    for (let y = 1; y < height - 0.3; y += 1.05) {
      model.box(tower, p.limestone, [1.44, 0.075, 2.19], [0, y, 0], 0.025)
    }
    model.box(tower, signal, [0.16, 0.15, 0.9], [0.35, height + 0.18, 0], 0.04)
    return tower
  })
  model.box(root, p.cream, [2.05, 0.65, 0.78], [0, 0.83, 1.25], 0.12)
  model.box(root, accent, [1.15, 0.5, 0.06], [0, 0.78, 1.65], 0.04)
  for (let index = 0; index < 5; index++) {
    model.box(root, p.roof, [0.07, 0.026, 0.35], [-1.5 + index * 0.75, 0.22, 2.2], 0)
  }
  return (amount: number) => {
    towers.forEach((tower, index) => {
      tower.scale.y = 1 + amount * [0.26, 0.12, 0.19][index]
    })
    signal.emissiveIntensity = 0.08 + amount * 0.4
  }
}

function buildObservatory({ model, palette: p, root, accent, signal }: BuildingContext) {
  model.cylinder(root, p.limestone, 2.75, 0.24, [0, 0.32, 0])
  model.cylinder(root, p.cream, 2.53, 1.18, [0, 1.03, 0])
  model.dome(root, p.cream, 2.5, [0, 1.62, 0])
  const rim = model.ring(root, p.roof, 2.54, 0.07, [0, 1.62, 0])
  rim.rotation.x = Math.PI / 2
  const rib = model.ring(root, p.roof, 2.515, 0.028, [0, 1.62, 0], Math.PI)
  rib.rotation.y = -0.35
  for (let index = 0; index < 10; index++) {
    const angle = (index / 10) * Math.PI * 2
    const window = model.box(
      root,
      p.glass,
      [0.55, 0.3, 0.075],
      [Math.sin(angle) * 2.51, 1.05, Math.cos(angle) * 2.51],
      0.035
    )
    window.rotation.y = angle
  }
  model.box(root, p.limestone, [1.6, 1.3, 0.5], [0, 0.87, 2.46], 0.16)
  model.box(root, accent, [1.07, 0.95, 0.06], [0, 0.72, 2.72], 0.11)
  const orbit = part(root, 'observatory-orbit', [0, 3.45, 0])
  const tilted = part(orbit, 'observatory-orbit-plane')
  tilted.rotation.x = Math.PI / 2 - 0.4
  model.ring(tilted, p.gold, 2.85, 0.032, [0, 0, 0])
  for (const angle of [0.35, 1.5, 2.8, 4.5, 5.7]) {
    model.sphere(
      tilted,
      signal,
      [Math.cos(angle) * 2.85, Math.sin(angle) * 2.85, 0],
      [0.085, 0.085, 0.085]
    )
  }
  return (amount: number) => {
    orbit.rotation.y = amount * 0.48
    signal.emissiveIntensity = 0.08 + amount * 0.8
  }
}

function buildLab({ model, palette: p, root, accent, signal }: BuildingContext) {
  for (const [x, height] of [
    [-1.65, 3.55],
    [1.65, 4.5]
  ]) {
    model.box(root, p.cream, [2.15, height, 2.85], [x, 0.2 + height / 2, -0.25], 0.2)
    model.box(root, p.roof, [2.24, 0.2, 2.96], [x, height + 0.2, -0.25], 0.07)
    model.box(root, p.glass, [1.45, 0.4, 0.07], [x, height - 0.48, 1.2], 0.04)
    model.box(root, p.limestone, [1.65, 1.16, 0.16], [x, 2.02, 1.26], 0.1)
    model.box(root, signal, [1.3, 0.81, 0.055], [x, 2.02, 1.36], 0.06)
    model.box(root, p.cream, [0.85, 0.035, 0.03], [x, 1.86, 1.4], 0)
    model.box(root, p.cream, [0.45, 0.035, 0.03], [x - 0.2, 2.05, 1.4], 0)
  }
  model.box(root, p.limestone, [1.48, 0.32, 1.36], [0, 2.73, -0.2], 0.08)
  model.box(root, p.glass, [1.47, 0.42, 0.085], [0, 3.02, 0.42], 0.035)
  model.box(root, p.cream, [1.48, 0.11, 1.36], [0, 3.26, -0.2], 0.04)
  model.box(root, accent, [0.88, 1.05, 0.08], [-1.65, 0.76, 1.21], 0.055)
  model.box(root, accent, [0.88, 1.05, 0.08], [1.65, 0.76, 1.21], 0.055)
  model.box(root, p.roof, [5.65, 0.15, 0.85], [0, 1.43, 1.47], 0.065)
  return (amount: number) => {
    signal.emissiveIntensity = 0.08 + amount * 1.15
  }
}

function buildArcade({ model, palette: p, root, accent, signal }: BuildingContext) {
  model.box(root, p.cream, [5.2, 2.05, 3.6], [0, 1.225, -0.2], 0.24)
  model.box(root, p.dark, [4.45, 1.55, 0.1], [0, 1.05, 1.62], 0.14)
  model.box(root, p.roof, [5.5, 0.23, 3.85], [0, 2.27, -0.2], 0.1)
  model.box(root, p.limestone, [4.85, 0.77, 0.35], [0, 2.28, 1.7], 0.14)
  model.box(root, p.dark, [4.45, 0.53, 0.06], [0, 2.28, 1.9], 0.07)
  const pixels = part(root, 'arcade-pixel-sign', [0, 2.28, 1.95])
  const glyph = ['00110', '01100', '11111', '00010', '00100']
  glyph.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '1')
        model.box(pixels, signal, [0.075, 0.075, 0.05], [(x - 2) * 0.09, (2 - y) * 0.09, 0], 0.01)
    }
  })
  for (const x of [-1.8, -1.35, -0.9, 0.9, 1.35, 1.8]) {
    model.box(pixels, signal, [0.14, 0.14, 0.05], [x, 0, 0], 0.025)
  }
  for (const x of [-1.5, 1.5]) {
    model.box(root, p.limestone, [0.58, 0.72, 0.4], [x, 0.62, 1.73], 0.07)
    model.box(root, p.glass, [0.4, 0.3, 0.065], [x, 0.87, 1.96], 0.025)
    model.box(root, p.roof, [0.63, 0.09, 0.49], [x, 0.61, 1.83], 0.025)
  }
  model.box(root, accent, [1.14, 1.25, 0.07], [0, 0.87, 1.7], 0.05)
  model.box(root, p.cream, [0.07, 1.25, 0.09], [0, 0.87, 1.75], 0.02)
  for (const x of [-1.65, 0, 1.65]) {
    model.box(root, p.limestone, [0.6, 0.16, 0.65], [x, 2.48, -0.7], 0.06)
  }
  return (amount: number) => {
    pixels.scale.setScalar(1 + amount * 0.06)
    signal.emissiveIntensity = 0.08 + amount * 1.3
  }
}

function buildLibrary({ model, palette: p, root, accent, signal }: BuildingContext) {
  const court = model.cylinder(root, p.limestone, 2.95, 0.1, [0, 0.25, 0])
  court.castShadow = false
  for (const angle of [-1.8, -0.9, 0, 0.9, 1.8]) {
    const wing = part(root, 'library-reading-wing', [
      Math.sin(angle) * 2.15,
      0.3,
      -Math.cos(angle) * 2.15
    ])
    wing.rotation.y = -angle
    model.box(wing, p.cream, [1.48, 1.65, 1.37], [0, 0.825, 0], 0.14)
    model.box(wing, p.roof, [1.64, 0.16, 1.52], [0, 1.7, 0], 0.055)
    model.box(wing, p.glass, [1.06, 0.85, 0.06], [0, 0.88, 0.7], 0.055)
    for (const x of [-0.32, 0.32]) {
      model.box(wing, p.cream, [0.09, 0.92, 0.1], [x, 0.88, 0.74], 0.025)
    }
    model.bake(wing)
  }
  const books = part(root, 'library-book-tower', [0, 0.3, -0.1])
  for (let index = 0; index < 6; index++) {
    const book = part(books, `library-book-${index}`, [
      index % 2 === 0 ? -0.08 : 0.08,
      index * 0.65,
      0
    ])
    book.rotation.y = index % 2 === 0 ? -0.12 : 0.08
    model.box(book, p.cream, [1.82, 0.52, 1.5], [0, 0.32, 0], 0.085)
    model.box(book, p.roof, [1.96, 0.085, 1.65], [0, 0.61, 0], 0.035)
    model.box(book, p.limestone, [1.96, 0.085, 1.65], [0, 0.035, 0], 0.035)
    for (const y of [0.24, 0.4]) {
      model.box(book, p.limestone, [1.54, 0.025, 0.018], [0, y, 0.756], 0)
    }
    model.bake(book)
  }
  model.box(root, p.cream, [1.65, 0.8, 0.54], [0, 0.66, 1.01], 0.09)
  model.box(root, accent, [1.08, 0.63, 0.06], [0, 0.6, 1.3], 0.05)
  const graph = part(root, 'library-atlas-graph')
  const nodes: Point3[] = [
    [-1.4, 1.4, 1.65],
    [0, 2.05, 2.15],
    [1.4, 1.3, 1.8],
    [2.3, 2.65, 0.55]
  ]
  for (let index = 0; index < nodes.length; index++) {
    model.sphere(graph, signal, nodes[index], [0.09, 0.09, 0.09])
    if (index > 0) model.segment(graph, p.gold, nodes[index - 1], nodes[index], 0.017)
  }
  return (amount: number) => {
    graph.position.y = amount * 0.24
    books.rotation.y = amount * 0.09
    signal.emissiveIntensity = 0.08 + amount * 0.75
  }
}

function buildHud({ model, palette: p, root, accent, signal }: BuildingContext) {
  model.box(root, p.limestone, [5.9, 0.2, 4.2], [0, 0.3, 0], 0.14)
  for (const x of [-2.57, 2.57]) {
    model.box(root, p.cream, [0.7, 2.7, 3.7], [x, 1.7, -0.12], 0.16)
    model.box(root, accent, [0.075, 1.13, 0.07], [x > 0 ? 2.18 : -2.18, 1.12, 1.78], 0.025)
  }
  model.box(root, p.cream, [5.35, 2.7, 0.5], [0, 1.7, -1.7], 0.16)
  model.box(root, p.cream, [6.15, 0.35, 4.15], [0, 3.12, -0.12], 0.15)
  model.box(root, p.roof, [5.8, 0.075, 3.8], [0, 3.315, -0.12], 0.035)
  model.box(root, p.dark, [4.42, 2.23, 0.12], [0, 1.59, 1.32], 0.07)
  const hud = part(root, 'hud-reticle', [0, 1.62, 1.41])
  signal.color.setHex(COLORS.gold)
  signal.emissive.setHex(COLORS.gold)
  const outer = model.ring(hud, signal, 0.79, 0.021, [0, 0, 0], Math.PI * 1.55)
  outer.rotation.z = -Math.PI * 0.3
  const inner = model.ring(hud, p.gold, 0.61, 0.018, [0, 0, 0], Math.PI * 1.6)
  inner.rotation.z = Math.PI * 0.65
  model.segment(hud, p.gold, [-0.22, 0, 0], [0.22, 0, 0], 0.013)
  model.segment(hud, p.gold, [0, -0.22, 0], [0, 0.22, 0], 0.013)
  for (const side of [-1, 1]) {
    const x = side * 1.58
    model.segment(root, p.gold, [x, 0.86, 1.42], [x, 2.33, 1.42], 0.016)
    for (const y of [0.86, 2.33]) {
      model.segment(root, p.gold, [x, y, 1.42], [x - side * 0.29, y, 1.42], 0.016)
    }
    for (let index = 0; index < 3; index++) {
      model.box(
        root,
        p.gold,
        [0.28 + index * 0.1, 0.028, 0.025],
        [side * 1.16, 1.35 + index * 0.19, 1.42],
        0
      )
    }
  }
  return (amount: number) => {
    hud.rotation.z = amount * 0.24
    signal.emissiveIntensity = 0.08 + amount * 0.7
  }
}

function plantTree(
  model: DistrictModeling,
  root: THREE.Group,
  p: Palette,
  x: number,
  z: number,
  height: number,
  scale = 1
) {
  model.cylinder(root, p.limestone, 0.46 * scale, 0.1, [x, 0.06, z])
  model.cylinder(root, p.trunk, 0.065 * scale, height, [x, height / 2 + 0.09, z], 0.045)
  model.canopy(root, p.tree, [x, height + 0.26, z], [0.53 * scale, 0.68 * scale, 0.5 * scale])
  model.canopy(
    root,
    p.tree,
    [x + 0.16 * scale, height + 0.62, z - 0.04],
    [0.35 * scale, 0.48 * scale, 0.36 * scale]
  )
}

function buildBench(
  model: DistrictModeling,
  root: THREE.Group,
  p: Palette,
  x: number,
  z: number,
  rotation: number
) {
  const bench = part(root, 'district-bench', [x, 0, z])
  bench.rotation.y = rotation
  model.box(bench, p.wood, [1.42, 0.12, 0.44], [0, 0.48, 0], 0.05)
  model.box(bench, p.roof, [1.42, 0.3, 0.09], [0, 0.78, -0.2], 0.03)
  for (const leg of [-0.54, 0.54]) {
    model.box(bench, p.trunk, [0.08, 0.44, 0.34], [leg, 0.24, 0], 0.02)
  }
}

function buildWaterfront(model: DistrictModeling, root: THREE.Group, p: Palette) {
  const apron = model.box(root, p.apron, [60, 0.16, 56], [0, -0.1, -2], 0.34)
  apron.castShadow = false
  const trim = model.box(root, p.limestone, [60.7, 0.1, 56.7], [0, -0.2, -2], 0.2)
  trim.castShadow = false

  const river: readonly Point3[] = [
    [-26, 0, -24],
    [-24, 0, -16],
    [-21, 0, -8],
    [-20, 0, 0],
    [-21, 0, 8],
    [-25, 0, 16],
    [-24, 0, 23]
  ]
  const shore = model.ribbon(root, p.shore, river, 4.35, 0.006)
  shore.receiveShadow = false
  const depth = model.ribbon(root, p.waterDeep, river, 3.3, 0.012)
  depth.receiveShadow = false
  const water = model.ribbon(root, p.water, river, 3.1, 0.017)
  water.receiveShadow = false

  const promenade: readonly Point3[] = [
    [-19.4, 0, -23.5],
    [-18, 0, -16],
    [-16, 0, -8],
    [-15.2, 0, 0],
    [-16, 0, 8],
    [-19.5, 0, 16],
    [-18.5, 0, 22.5]
  ]
  model.ribbon(root, p.paving, promenade, 1.1, 0.022)

  // 浅拱桥：桥面平缓，拱圈压扁后只露出河岸之间的一小段弧线。
  const bridgeX = -20.3
  const bridgeZ = -1.5
  model.box(root, p.paving, [11, 0.24, 2.1], [bridgeX, 0.72, bridgeZ], 0.1)
  for (const [x, rotation] of [
    [-26.2, 0.11],
    [-14.4, -0.11]
  ] as const) {
    const ramp = model.box(root, p.limestone, [3.2, 0.15, 2.1], [x, 0.42, bridgeZ], 0.06)
    ramp.rotation.z = rotation
  }
  for (const side of [-1, 1]) {
    const arch = model.ring(
      root,
      p.shore,
      4.7,
      0.15,
      [bridgeX, 0.06, bridgeZ + side * 0.58],
      Math.PI
    )
    arch.scale.y = 0.12
    for (const x of [-25, -22.5, -20, -17.5, -15.2]) {
      model.box(root, p.roof, [0.075, 0.8, 0.075], [x, 1.26, bridgeZ + side * 0.9], 0.02)
    }
    model.box(root, p.roof, [10.1, 0.08, 0.08], [bridgeX, 1.68, bridgeZ + side * 0.9], 0.025)
    for (const x of [-26.1, -14.5]) {
      model.cylinder(root, p.trunk, 0.04, 0.74, [x, 1.28, bridgeZ + side * 0.9])
      model.cylinder(root, p.lamp, 0.13, 0.12, [x, 1.67, bridgeZ + side * 0.9])
    }
  }

  // 小码头与一只停泊的木船，给河道一个可读的使用场景。
  model.box(root, p.wood, [3.3, 0.1, 1.25], [-17.9, 0.12, -5.8], 0.025)
  for (const x of [-19.2, -16.6]) {
    for (const z of [-6.3, -5.3]) {
      model.cylinder(root, p.trunk, 0.04, 0.32, [x, -0.02, z])
    }
  }
  const boat = part(root, 'district-boat', [-21.9, 0.15, -10.6])
  boat.rotation.y = 0.35
  model.box(boat, p.wood, [2.2, 0.34, 0.82], [0, 0, 0], 0.28)
  model.box(boat, p.waterDeep, [1.55, 0.11, 0.5], [0, 0.18, 0], 0.12)
  model.segment(boat, p.trunk, [-0.72, 0.27, 0.12], [0.72, 0.27, -0.12], 0.018)

  for (const [x, z, radius, rotation] of [
    [-19.2, -14, 0.62, 0.2],
    [-22.3, -3.8, 0.48, 1.4],
    [-19.3, 4.3, 0.7, 2.1],
    [-23.1, 12.4, 0.55, 0.8],
    [-17.4, -6.9, 0.38, 1.8]
  ] as const) {
    const ripple = model.ring(root, p.ripple, radius, 0.014, [x, 0.027, z], Math.PI * 1.35)
    ripple.rotation.x = Math.PI / 2
    ripple.rotation.z = rotation
    ripple.castShadow = false
  }

  for (const [x, z, count] of [
    [-17.2, -17.5, 4],
    [-16.1, 6.4, 3],
    [-19.2, 19.2, 5],
    [-22.8, -20.5, 3]
  ] as const) {
    for (let index = 0; index < count; index++) {
      const offset = (index - (count - 1) / 2) * 0.22
      const height = 0.48 + (index % 3) * 0.1
      model.cylinder(root, p.reed, 0.018, height, [x + offset, height / 2 + 0.02, z], 0.006)
      model.sphere(root, p.reed, [x + offset, height + 0.06, z], [0.032, 0.09, 0.032])
    }
  }
  for (const [x, z, size] of [
    [-18.2, -9.5, 0.28],
    [-17.5, 2.3, 0.2],
    [-20.8, 15.7, 0.24]
  ] as const) {
    model.sphere(root, p.shore, [x, 0.04, z], [size, size * 0.48, size * 0.8])
  }

  plantTree(model, root, p, -18.9, -18.9, 1.12, 0.9)
  plantTree(model, root, p, -16.8, -11.5, 0.95, 0.78)
  plantTree(model, root, p, -17.4, 11.4, 1.2, 0.94)
  plantTree(model, root, p, -20.2, 20.3, 1.1, 0.9)

  // 右侧口袋公园，平衡河道造成的左重右轻。
  const lawn = model.cylinder(root, p.lawn, 3.7, 0.065, [18.2, 0.04, 13], 3.7)
  lawn.castShadow = false
  const curb = model.ring(root, p.shore, 3.74, 0.055, [18.2, 0.075, 13], Math.PI * 2)
  curb.rotation.x = Math.PI / 2
  curb.castShadow = false
  model.ribbon(
    root,
    p.paving,
    [
      [11.6, 0, 13.4],
      [14.5, 0, 12.8],
      [16.8, 0, 13]
    ],
    0.72,
    0.026
  )
  plantTree(model, root, p, 16.4, 10.7, 1.28, 1)
  plantTree(model, root, p, 20.1, 14.1, 1.05, 0.82)
  plantTree(model, root, p, 17.8, 15.6, 1.45, 1.08)
  buildBench(model, root, p, 15.2, 13.9, -Math.PI * 0.45)
  buildBench(model, root, p, 19, 11.5, Math.PI * 0.65)
}

function buildHorizon(model: DistrictModeling, root: THREE.Group, p: Palette) {
  // 两层连续缓丘：前后缘落回地面，低频起伏让轮廓不再像重复的椭圆贴片。
  model.ridge(root, p.hillFar, [-34, 34, -32, -24], 3.4, 0.8)
  model.ridge(root, p.hillNear, [-33, 33, -27, -19], 2.2, 2.6)
  for (const [x, z, height, scale] of [
    [-18.5, -18.6, 1.2, 0.82],
    [-15, -19.1, 1.4, 0.9],
    [-10, -18.8, 1.1, 0.8],
    [-5, -19.2, 1.5, 0.95],
    [0, -18.7, 1.2, 0.85],
    [5, -19.2, 1.45, 0.92],
    [10, -18.9, 1.1, 0.8],
    [15, -19.2, 1.5, 0.95],
    [20, -18.8, 1.2, 0.85],
    [25, -18.4, 1.35, 0.88]
  ] as const) {
    plantTree(model, root, p, x, z, height, scale)
  }
}

function buildStreets(model: DistrictModeling, root: THREE.Group, p: Palette) {
  const ground = model.box(root, p.ground, [37, 0.4, 35], [0, -0.2, 0], 0.18)
  ground.castShadow = false
  const roads = [
    { x: -3.7, z: -2.95, length: 18.7, width: 1.5, vertical: true },
    { x: 5.5, z: -7.3, length: 10, width: 1.05, vertical: true },
    { x: -0.1, z: -12.3, length: 33.6, width: 1.25, vertical: false },
    { x: -5.65, z: -2.3, length: 22.3, width: 1.1, vertical: false },
    { x: -6.7, z: 6.4, length: 20.4, width: 1, vertical: false },
    { x: 10.05, z: 5.7, length: 13.1, width: 1, vertical: false }
  ]
  for (const road of roads) {
    const lane = part(root, 'district-street', [road.x, 0, road.z])
    if (!road.vertical) lane.rotation.y = Math.PI / 2
    model.box(lane, p.road, [road.width, 0.035, road.length], [0, 0.02, 0], 0.014).castShadow =
      false
    for (const side of [-1, 1]) {
      model.box(
        lane,
        p.paving,
        [0.46, 0.085, road.length],
        [side * (road.width / 2 + 0.23), 0.0425, 0],
        0.035
      ).castShadow = false
    }
    for (let z = -road.length / 2 + 0.9; z < road.length / 2 - 0.5; z += 2.6) {
      model.box(lane, p.cream, [0.035, 0.008, 0.43], [0, 0.043, z], 0).castShadow = false
    }
    model.bake(lane)
  }
  model.box(root, p.road, [1.1, 0.035, 1.7], [3.5, 0.02, 6.05], 0.014).castShadow = false
  for (const [x, z] of [
    [-3.7, -2.3],
    [-3.7, 6.4],
    [5.5, -12.3]
  ]) {
    for (let stripe = 0; stripe < 4; stripe++) {
      model.box(
        root,
        p.cream,
        [1.05, 0.012, 0.12],
        [x, 0.09, z - 0.44 + stripe * 0.29],
        0
      ).castShadow = false
    }
  }
  model.cylinder(root, p.paving, 1.7, 0.085, [0.4, 0.0425, 11.2]).castShadow = false
  const plazaRing = model.ring(root, p.roof, 1.43, 0.023, [0.4, 0.092, 11.2])
  plazaRing.rotation.x = Math.PI / 2
  plazaRing.castShadow = false
  model.cylinder(root, p.limestone, 0.48, 0.24, [0.4, 0.2, 11.2])
  const sculpture = model.ring(root, p.cream, 0.5, 0.12, [0.4, 0.93, 11.2])
  sculpture.rotation.y = -0.35
}

function buildLandscape(model: DistrictModeling, root: THREE.Group, p: Palette) {
  const trees: readonly (readonly [number, number])[] = [
    [-14.3, -10.5],
    [-13.8, -4.1],
    [-14.7, 4.2],
    [-13.8, 10],
    [-12.5, 13.9],
    [-9, 14.6],
    [-1.3, -14],
    [4.3, -14],
    [7.3, -10.2],
    [12.3, -10.5],
    [14.5, -5.5],
    [14.6, 3.7],
    [14.3, 10.5],
    [11.8, 13.8],
    [6, 13.8],
    [1, 14.5]
  ]
  trees.forEach(([x, z], index) => {
    const height = 1.15 + (index % 3) * 0.16
    model.cylinder(root, p.limestone, 0.53, 0.16, [x, 0.08, z])
    model.cylinder(root, p.trunk, 0.075, height, [x, height / 2 + 0.1, z], 0.045)
    model.canopy(root, p.tree, [x, height + 0.3, z], [0.56, 0.7, 0.53])
    model.canopy(root, p.tree, [x + 0.17, height + 0.67, z - 0.05], [0.37, 0.51, 0.38])
  })
  for (const [x, z] of [
    [-4.8, -9.9],
    [-4.8, -4.2],
    [-4.8, 2],
    [4.5, -10.1],
    [4.5, -4.8],
    [-11, 7.35],
    [2, 7.35],
    [12.7, 4.75]
  ]) {
    model.cylinder(root, p.trunk, 0.035, 1.8, [x, 0.94, z])
    model.box(root, p.roof, [0.43, 0.065, 0.25], [x + 0.12, 1.84, z], 0.03)
    model.box(root, p.lamp, [0.3, 0.035, 0.19], [x + 0.12, 1.8, z], 0.015).castShadow = false
  }
  for (const [x, z] of [
    [-11, 13.5],
    [0.3, 13.3],
    [2.5, 10],
    [12.8, 12.8],
    [-14.2, 7.4]
  ]) {
    model.box(root, p.roof, [1.12, 0.13, 0.42], [x, 0.42, z], 0.06)
    model.box(root, p.limestone, [1.12, 0.36, 0.11], [x, 0.66, z - 0.19], 0.04)
    for (const dx of [-0.38, 0.38]) {
      model.box(root, p.trunk, [0.1, 0.34, 0.3], [x + dx, 0.19, z], 0.025)
    }
  }
  const background = [
    [-14.6, -15.3, 2.5],
    [-11, -15.1, 2.9],
    [-7.6, -15.3, 2.2],
    [-3.9, -15.5, 2.8],
    [1, -15.5, 2.15],
    [7.5, -15.3, 2.8],
    [11.1, -15.2, 2.35],
    [14.6, -15.1, 1.85],
    [-16.6, -7.2, 1.85],
    [-16.6, 0.3, 1.6],
    [-16.4, 9.8, 1.25],
    [16.2, -8.2, 1.2],
    [16.2, 0, 1.15]
  ]
  background.forEach(([x, z, height], index) => {
    const width = index < 8 ? 2.2 : 1.5
    model.box(root, p.limestone, [width, height, 1.75], [x, height / 2, z], 0.13)
    model.box(root, p.roof, [width + 0.09, 0.12, 1.83], [x, height + 0.02, z], 0.045)
    model.box(root, p.paving, [width * 0.57, 0.15, 0.88], [x - 0.1, height + 0.15, z - 0.08], 0.04)
    for (let y = 0.65; y < height - 0.25; y += 0.7) {
      model.box(root, p.glass, [width * 0.66, 0.2, 0.04], [x, y, z + 0.887], 0.018)
    }
  })
}

/** 创建约 37 × 35 的无纹理沙盘；不依赖 DOM，也不注册动画或事件循环。 */
export function createDistrict(ids: readonly string[]): District {
  const group = new THREE.Group()
  group.name = 'cream-product-district'
  const model = new DistrictModeling()
  const pickables: THREE.Object3D[] = []
  const anchors = new Map<string, THREE.Vector3>()
  const buildings = new Map<string, BuildingState>()
  let selected: string | null = null
  let hovered: string | null = null
  let animated: string | null = null
  let waterTime = { value: 0 }
  let disposed = false

  function resetAnimation() {
    if (animated) buildings.get(animated)?.pose(0)
    animated = null
  }

  function updateHighlights() {
    for (const [id, building] of buildings) {
      const isSelected = id === selected
      const isHovered = id === hovered
      const color = isSelected ? 0x4f91ce : isHovered ? 0x87adc2 : 0xa6bdc5
      building.accent.color.setHex(color)
      building.accent.emissive.setHex(color)
      building.accent.emissiveIntensity = isSelected ? 0.3 : isHovered ? 0.13 : 0.025
      building.border.visible = isSelected || isHovered
      building.outline.color.setHex(isSelected ? 0x669fce : 0x9ab6c5)
      building.outline.emissiveIntensity = isSelected ? 0.18 : 0.04
    }
  }

  function dispose() {
    if (disposed) return
    disposed = true
    resetAnimation()
    model.dispose()
    group.removeFromParent()
    group.clear()
    buildings.clear()
    anchors.clear()
    pickables.length = 0
  }

  try {
    const water = createWaterMaterial(model)
    waterTime = water.time
    const p: Palette = {
      cream: model.material(COLORS.cream),
      limestone: model.material(COLORS.limestone),
      roof: model.material(COLORS.roof, { roughness: 0.65, metalness: 0.16 }),
      glass: model.material(COLORS.glass, { roughness: 0.4, metalness: 0.08 }),
      dark: model.material(COLORS.dark, { roughness: 0.75 }),
      ground: model.material(COLORS.ground),
      road: model.material(COLORS.road),
      paving: model.material(COLORS.paving),
      tree: model.material(COLORS.tree, { roughness: 0.95 }),
      trunk: model.material(COLORS.trunk),
      gold: model.material(COLORS.gold, { metalness: 0.4, roughness: 0.5 }),
      lamp: model.material(COLORS.lamp, { emissive: COLORS.lamp, emissiveIntensity: 0.4 }),
      apron: model.material(COLORS.apron),
      shore: model.material(COLORS.shore),
      water: water.material,
      waterDeep: model.material(COLORS.waterDeep, { roughness: 0.4 }),
      ripple: model.material(COLORS.ripple),
      lawn: model.material(COLORS.lawn, { roughness: 0.95 }),
      hillNear: model.material(COLORS.hillNear, { roughness: 0.96, vertexColors: true }),
      hillFar: model.material(COLORS.hillFar, { roughness: 0.96, vertexColors: true }),
      wood: model.material(COLORS.wood, { roughness: 0.88 }),
      reed: model.material(COLORS.reed, { roughness: 0.9 })
    }
    const surroundings = part(group, 'district-surroundings')
    buildWaterfront(model, surroundings, p)
    buildHorizon(model, surroundings, p)
    buildStreets(model, surroundings, p)
    buildLandscape(model, surroundings, p)

    for (const id of new Set(ids)) {
      if (
        !Object.prototype.hasOwnProperty.call(LANDMARKS, id) ||
        !Object.prototype.hasOwnProperty.call(BUILDINGS, id)
      )
        continue
      const landmark = LANDMARKS[id]
      const spec = BUILDINGS[id]
      const [x, z] = landmark.position
      const root = part(group, id, [x, 0, z])
      root.userData.toolId = id
      const accent = model.material(0xa6bdc5, {
        roughness: 0.42,
        emissive: 0xa6bdc5,
        emissiveIntensity: 0.025
      })
      const signal = model.material(0xc8d5d4, {
        emissive: 0x82b2c2,
        emissiveIntensity: 0.08,
        roughness: 0.45
      })
      const outline = model.material(0x669fce, { emissive: 0x669fce, emissiveIntensity: 0.18 })
      model.box(root, p.paving, [spec.width, 0.2, spec.depth], [0, 0.1, 0], 0.09).castShadow = false
      const border = part(root, 'landmark-selection-border')
      border.visible = false
      for (const side of [-1, 1]) {
        model.box(
          border,
          outline,
          [spec.width - 0.2, 0.025, 0.034],
          [0, 0.22, side * (spec.depth / 2 - 0.1)],
          0.01
        ).castShadow = false
        model.box(
          border,
          outline,
          [0.034, 0.025, spec.depth - 0.2],
          [side * (spec.width / 2 - 0.1), 0.22, 0],
          0.01
        ).castShadow = false
      }
      const pose = spec.build({ model, palette: p, root, accent, signal })
      buildings.set(id, { accent, outline, border, pose })
      anchors.set(id, new THREE.Vector3(x, spec.anchorHeight, z))
    }

    model.finish(group)
    group.updateMatrixWorld(true)
    for (const child of group.children) {
      if (typeof child.userData.toolId !== 'string') continue
      child.traverse((object) => {
        if (object instanceof THREE.Mesh) pickables.push(object)
      })
    }
    updateHighlights()
  } catch (error) {
    dispose()
    throw error
  }

  return {
    group,
    pickables,
    anchors,
    setSelection(id) {
      if (disposed) return
      const next = id !== null && buildings.has(id) ? id : null
      if (next === selected) return
      resetAnimation()
      selected = next
      updateHighlights()
    },
    setHover(id) {
      if (disposed) return
      const next = id !== null && buildings.has(id) ? id : null
      if (next === hovered) return
      hovered = next
      updateHighlights()
    },
    animate(id, progress) {
      if (disposed || id !== selected) return
      const building = buildings.get(id)
      if (!building) return
      if (animated !== null && animated !== id) resetAnimation()
      const clamped = Number.isFinite(progress) ? THREE.MathUtils.clamp(progress, 0, 1) : 1
      /** 两端显式置零，避免 sin(π) 的浮点余量留下残余位移。 */
      const amount = clamped === 0 || clamped === 1 ? 0 : Math.sin(clamped * Math.PI) ** 2
      building.pose(amount)
      animated = amount === 0 ? null : id
    },
    update(elapsed) {
      if (!disposed) waterTime.value = elapsed
    },
    dispose
  }
}

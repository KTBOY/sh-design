import * as THREE from 'three'
import { COLORS } from './district'
import { DistrictModeling } from './district-modeling'

export interface Walker {
  /** 脚底定位；地面高度与朝向由外部驱动。 */
  group: THREE.Group
  setPosition(x: number, y: number, z: number): void
  setHeading(angle: number): void
  /** 0 隐藏、1 完整出现，进入/退出漫游时做生长过渡。 */
  setAppear(progress: number): void
  /** elapsed 为秒；moving 为 false 时只做轻微呼吸。 */
  update(elapsed: number, moving: boolean): void
  dispose(): void
}

const SKIN = 0xf0e3d0

/** 漫游小人：低多边形、无面部，奶油白配金色围巾与工帽，身高约 1.16 世界单位。 */
export function createWalker(): Walker {
  const model = new DistrictModeling()
  const group = new THREE.Group()
  group.name = 'district-walker'
  const rig = new THREE.Group()
  group.add(rig)

  const body = model.material(COLORS.cream)
  const limb = model.material(COLORS.limestone, { roughness: 0.88 })
  const skin = model.material(SKIN, { roughness: 0.85 })
  const gold = model.material(COLORS.gold, { metalness: 0.35, roughness: 0.5 })

  const legs = [-1, 1].map((side) => {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.088, 0.46, 0)
    rig.add(pivot)
    model.box(pivot, limb, [0.095, 0.4, 0.115], [0, -0.2, 0], 0.03)
    return pivot
  })
  const arms = [-1, 1].map((side) => {
    const pivot = new THREE.Group()
    pivot.position.set(side * 0.225, 0.83, 0)
    pivot.rotation.z = side * -0.08
    rig.add(pivot)
    model.box(pivot, limb, [0.08, 0.36, 0.1], [0, -0.16, 0], 0.026)
    return pivot
  })
  model.box(rig, body, [0.36, 0.44, 0.24], [0, 0.665, 0], 0.09)
  model.sphere(rig, skin, [0, 1, 0], [0.155, 0.16, 0.155])
  model.cylinder(rig, gold, 0.162, 0.055, [0, 1.115, 0], 0.142)
  model.box(rig, gold, [0.19, 0.022, 0.13], [0, 1.092, 0.15], 0.01)
  const scarf = model.ring(rig, gold, 0.115, 0.035, [0, 0.895, 0])
  scarf.rotation.x = Math.PI / 2
  const tail = model.box(rig, gold, [0.07, 0.2, 0.03], [0.05, 0.79, -0.145], 0.01)
  tail.rotation.x = 0.12

  function setPosition(x: number, y: number, z: number) {
    group.position.set(x, y, z)
  }

  function setHeading(angle: number) {
    group.rotation.y = angle
  }

  function setAppear(progress: number) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1)
    group.visible = clamped > 0.001
    group.scale.setScalar(Math.max(0.001, clamped))
  }

  function update(elapsed: number, moving: boolean) {
    const stride = moving ? Math.sin(elapsed * 9.5) : 0
    legs[0].rotation.x = stride * 0.62
    legs[1].rotation.x = -stride * 0.62
    arms[0].rotation.x = -stride * 0.5
    arms[1].rotation.x = stride * 0.5
    rig.position.y = moving
      ? Math.abs(Math.sin(elapsed * 9.5)) * 0.045
      : Math.sin(elapsed * 1.6) * 0.006
    tail.rotation.x = 0.12 + (moving ? Math.sin(elapsed * 4.2) * 0.08 : 0)
  }

  function dispose() {
    model.dispose()
    group.removeFromParent()
    group.clear()
  }

  return { group, setPosition, setHeading, setAppear, update, dispose }
}

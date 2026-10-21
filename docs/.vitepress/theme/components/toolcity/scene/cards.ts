import * as THREE from 'three'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import type { Tool, ToolGroup } from '../../products/meta'
import { createToolIcon } from './icons'
import { CARD_DESIGNS, type ToolCardDesign } from './cardMeta'

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

interface CardItem {
  tool: Tool
  design: ToolCardDesign
  group: THREE.Group
  icon: THREE.Group
  host: HTMLButtonElement
  textObject: CSS3DObject
  iconBaseY: number
  hover: number
  hoverTarget: number
  focus: number
  focusTarget: number
  press: number
  dim: number
}

export interface CardRail {
  group: THREE.Group
  layout(width: number): void
  setScroll(progress: number): void
  refine(): void
  groundFootprints(): { x: number; z: number; r: number }[]
  update(elapsed: number, camera: THREE.Camera, introElapsed: number): void
  dispose(): void
}

function roundedShape(width: number, height: number, radius: number) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  shape.moveTo(x + radius, y)
  shape.lineTo(x + width - radius, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + radius)
  shape.lineTo(x + width, y + height - radius)
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  shape.lineTo(x + radius, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - radius)
  shape.lineTo(x, y + radius)
  shape.quadraticCurveTo(x, y, x + radius, y)
  return shape
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62)
    gradient.addColorStop(0, 'rgba(17, 42, 74, 0.55)')
    gradient.addColorStop(0.45, 'rgba(17, 42, 74, 0.22)')
    gradient.addColorStop(1, 'rgba(17, 42, 74, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function iconY(design: ToolCardDesign) {
  return design.worldH * 0.15
}

function cardSizeClass(design: ToolCardDesign) {
  if (design.lead) return 'lead'
  if (design.worldW > 13) return 'large'
  if (design.worldW > 10) return 'medium'
  return 'small'
}

function renderCardFace(
  host: HTMLButtonElement,
  tool: Tool,
  design: ToolCardDesign,
  index: number,
  zoneName: string
) {
  const top = document.createElement('span')
  top.className = 't3-card__top'
  const number = document.createElement('span')
  number.className = 't3-card__no'
  number.textContent = String(index + 1).padStart(2, '0')
  const arrow = document.createElement('span')
  arrow.className = 't3-card__arrow'
  arrow.setAttribute('aria-hidden', 'true')
  arrow.textContent = '↗'
  top.append(number, arrow)

  const body = document.createElement('span')
  body.className = 't3-card__body'
  const title = document.createElement('span')
  title.className = 't3-card__title'
  title.textContent = design.displayName
  const nameZh = document.createElement('em')
  nameZh.textContent = tool.nameZh
  title.append(nameZh)
  const zone = document.createElement('span')
  zone.className = 't3-card__zone'
  zone.textContent = zoneName
  const stack = document.createElement('span')
  stack.className = 't3-card__stack'
  const chip = document.createElement('span')
  chip.textContent = tool.tags[0] ?? ''
  stack.append(chip)
  body.append(zone, title, stack)

  host.append(top, body)
}

export function createCardRail(
  tools: Tool[],
  groups: ToolGroup[],
  onPick?: (tool: Tool) => void,
  onHover?: (index: number | null) => void
): CardRail {
  const touchOnly = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  const zoneNames = tools.map((tool) => {
    const group = groups.find((entry) => entry.items.some((item) => item.name === tool.name))
    return group ? group.zh : ''
  })
  const group = new THREE.Group()
  group.name = 'tool-cards'
  const items: CardItem[] = []
  const shadowTexture = makeShadowTexture()
  const panelMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })
  const iconShadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    opacity: 0.2,
    depthWrite: false,
    color: 0x54759c
  })
  const ownedMaterials: THREE.Material[] = [panelMaterial, iconShadowMaterial]
  const laneMaterials: THREE.MeshBasicMaterial[] = []
  let scroll = 0
  let active = -1
  const ownedGeometries: THREE.BufferGeometry[] = []

  const count = Math.min(tools.length, CARD_DESIGNS.length)
  for (let i = 0; i < count; i++) {
    const tool = tools[i]
    const design = CARD_DESIGNS[i]
    const cardGroup = new THREE.Group()
    cardGroup.position.set(design.x, design.y, design.z)
    cardGroup.userData.base = { x: design.x, y: design.y, z: design.z }

    const radius = Math.min(1.2, design.worldW * 0.07)
    const shape = roundedShape(design.worldW, design.worldH, radius)
    const panelGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.06,
      curveSegments: 8
    })
    panelGeometry.translate(0, 0, -0.15)
    const positionAttribute = panelGeometry.getAttribute('position') as THREE.BufferAttribute
    const colors = new Float32Array(positionAttribute.count * 3)
    // 面板取值向城市借色，渐变轴沿 key light（0.38, 0.66, 0.65）在面板平面上的投影
    const topColor = new THREE.Color(0xf7fbff)
    const bottomColor = new THREE.Color(0xdfeaf6)
    const mixed = new THREE.Color()
    for (let v = 0; v < positionAttribute.count; v++) {
      const y = positionAttribute.getY(v)
      const x = positionAttribute.getX(v)
      const ux = (x + design.worldW / 2) / design.worldW
      const uy = (y + design.worldH / 2) / design.worldH
      const t = Math.max(0, Math.min(1, (ux * 0.5 + uy * 0.87) / 1.37))
      mixed.copy(bottomColor).lerp(topColor, t)
      colors[v * 3] = mixed.r
      colors[v * 3 + 1] = mixed.g
      colors[v * 3 + 2] = mixed.b
    }
    panelGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const laneMaterial = panelMaterial.clone()
    laneMaterials.push(laneMaterial)
    ownedMaterials.push(laneMaterial)
    const panel = new THREE.Mesh(panelGeometry, laneMaterial)
    panel.renderOrder = 1
    cardGroup.add(panel)
    ownedGeometries.push(panelGeometry)

    const icon = createToolIcon(design.kind)
    const scale = design.worldW * 0.082
    icon.position.set(0, iconY(design), 0.62)
    icon.scale.setScalar(scale)
    icon.userData.baseY = iconY(design)
    icon.userData.phase = i * 0.9
    icon.traverse((child) => {
      if (child instanceof THREE.Mesh) child.renderOrder = 3
    })
    cardGroup.add(icon)

    const iconShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), iconShadowMaterial)
    iconShadow.position.set(0, iconY(design) - design.worldW * 0.24, 0.43)
    iconShadow.scale.set(design.worldW * 0.5, design.worldW * 0.14, 1)
    iconShadow.renderOrder = 2
    cardGroup.add(iconShadow)
    ownedGeometries.push(iconShadow.geometry)

    const host = document.createElement('button')
    host.type = 'button'
    host.className = `t3-card t3-card--${cardSizeClass(design)}`
    host.style.width = `${design.pxW}px`
    host.style.height = `${design.pxH}px`
    host.style.zIndex = String(200 - i)
    host.setAttribute('aria-label', `定位到 ${tool.name} 项目卡片`)
    renderCardFace(host, tool, design, i, zoneNames[i])
    host.addEventListener('click', () => {
      const item = items[i]
      if (item) item.press = 1
      if (touchOnly && active !== i) {
        for (const other of items) other.hoverTarget = 0
        if (item) item.hoverTarget = 1
        return
      }
      onPick?.(tool)
    })
    host.addEventListener('focus', () => {
      const item = items[i]
      if (item) item.focusTarget = 1
    })
    host.addEventListener('blur', () => {
      const item = items[i]
      if (item) item.focusTarget = 0
    })
    host.addEventListener('pointerenter', () => {
      const item = items[i]
      if (item) item.hoverTarget = 1
    })
    host.addEventListener('pointerleave', () => {
      const item = items[i]
      if (item) item.hoverTarget = 0
    })

    const textObject = new CSS3DObject(host)
    textObject.position.set(0, 0, 0.42)
    textObject.scale.setScalar(design.worldW / design.pxW)
    cardGroup.add(textObject)

    group.add(cardGroup)
    items.push({
      tool,
      design,
      group: cardGroup,
      icon,
      host,
      textObject,
      iconBaseY: iconY(design),
      hover: 0,
      hoverTarget: 0,
      focus: 0,
      focusTarget: 0,
      press: 0,
      dim: 1
    })
  }

  function layout(width: number) {
    const mode = width >= 1180 ? 'desktop' : width >= 768 ? 'tablet' : 'mobile'
    const visibleCount = mode === 'desktop' ? 7 : mode === 'tablet' ? 5 : 1
    const tablet = [
      { x: -19, y: 27.5, z: 12 },
      { x: -3.85, y: 26.5, z: 6 },
      { x: 9, y: 25.8, z: 2 },
      { x: 20.1, y: 25.2, z: -2 },
      { x: 31.5, y: 24.8, z: -5 }
    ]
    const mobile = [{ x: 0, y: 26, z: 10 }]
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const visible = i < visibleCount
      item.group.visible = visible
      item.textObject.visible = visible
      item.host.style.display = visible ? '' : 'none'
      item.host.style.pointerEvents = visible ? 'auto' : 'none'
      item.host.style.clipPath = ''
      item.host.style.paddingLeft = ''
      item.icon.position.x = 0
      if (!visible) continue
      let position = { x: item.design.x, y: item.design.y, z: item.design.z }
      let scale = mode === 'desktop' && i > 0 ? 0.9 : 1
      if (mode === 'tablet') {
        position = tablet[i] ?? position
        scale = 0.86
      } else if (mode === 'mobile') {
        position = mobile[0]
        scale = 0.86
      }
      item.group.position.set(position.x, position.y, position.z)
      item.group.scale.setScalar(scale)
      item.group.userData.scale = scale
      item.group.userData.base = position
    }
  }

  function refine() {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      item.host.style.clipPath = ''
      item.host.style.paddingLeft = ''
      item.icon.position.x = 0
      if (!item.group.visible || i === 0) continue
      const previous = items[i - 1]
      if (!previous.group.visible) continue

      const previousRect = previous.host.getBoundingClientRect()
      const rect = item.host.getBoundingClientRect()
      const overlap = previousRect.right - rect.left + 8
      if (overlap <= 2) continue

      const cssScale = rect.width / item.design.pxW || 1
      const inset = overlap / cssScale
      const base = item.design.lead ? 30 : item.design.worldW > 10 ? 26 : 21
      item.host.style.clipPath = `inset(0 0 0 ${inset.toFixed(1)}px)`
      item.host.style.paddingLeft = `${(base + inset).toFixed(1)}px`

      const screenPerWorld = rect.width / (item.design.worldW * item.group.scale.x)
      item.icon.position.x = overlap / Math.max(screenPerWorld, 0.01) / 2
    }
  }

  function syncActive() {
    let next = -1
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (!item.group.visible) continue
      if (item.hover > 0.5 || item.focus > 0.5) {
        next = i
        break
      }
    }
    if (next === active) return
    active = next
    onHover?.(active >= 0 ? active : null)
  }

  function update(elapsed: number, camera: THREE.Camera, introElapsed: number) {
    for (let i = 0; i < items.length; i++) {
      syncActive()
      const item = items[i]
      if (!item.group.visible) continue
      item.hover += (item.hoverTarget - item.hover) * 0.12
      item.focus += (item.focusTarget - item.focus) * 0.12
      item.press *= 0.86
      const strength = Math.max(item.hover, item.focus * 0.8)
      const base = item.group.userData.base as { x: number; y: number; z: number }
      const intro = clamp01((introElapsed - 0.12 - i * 0.07) / 0.52)
      const eased = 1 - Math.pow(1 - intro, 3)
      if (intro < 1) item.host.style.opacity = eased.toFixed(3)
      else if (item.host.style.opacity !== '1') item.host.style.opacity = '1'
      item.group.position.set(
        base.x,
        base.y - (1 - eased) * 2.6 + Math.sin(elapsed * 0.5 + i * 0.8) * 0.055 + strength * 0.12,
        base.z + strength * 0.55
      )
      item.group.lookAt(camera.position)
      item.group.rotateY(item.design.yaw)
      item.icon.position.y =
        item.iconBaseY + Math.sin(elapsed * 0.72 + item.icon.userData.phase) * 0.12
      item.icon.rotation.y = Math.sin(elapsed * (0.24 + strength * 0.36) + i) * 0.16
      const dim = active >= 0 && active !== i ? 0.94 : 1
      if (dim !== item.dim) {
        item.dim = dim
        laneMaterials[i]?.color.setScalar(dim)
      }
      const laneScale = (item.group.userData.scale as number) ?? 1
      item.group.scale.setScalar(laneScale * (1 - item.press * 0.015))
    }
  }

  function setScroll(progress: number) {
    scroll = progress
    group.position.set(0, -scroll * 2.6, -scroll * 24)
  }

  function groundFootprints() {
    const out: { x: number; z: number; r: number }[] = []
    for (const item of items) {
      if (!item.group.visible) continue
      const base = item.group.userData.base as { x: number; y: number; z: number }
      const scale = (item.group.userData.scale as number) ?? 1
      out.push({
        x: group.position.x + base.x - 3,
        z: group.position.z + base.z - 4.5,
        r: item.design.worldW * 0.72 * scale
      })
    }
    return out
  }

  function dispose() {
    for (const item of items) {
      item.host.remove()
      item.group.remove(item.textObject)
      item.group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry.dispose()
        }
      })
    }
    for (const geometry of ownedGeometries) geometry.dispose()
    for (const material of ownedMaterials) material.dispose()
    shadowTexture.dispose()
    items.length = 0
    group.removeFromParent()
  }

  return { group, layout, setScroll, refine, groundFootprints, update, dispose }
}

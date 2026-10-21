import type { IconKind } from './icons'

export interface ToolCardDesign {
  kind: IconKind
  displayName: string
  pxW: number
  pxH: number
  worldW: number
  worldH: number
  x: number
  y: number
  z: number
  yaw: number
  lead?: boolean
}

const aspectHeight = (width: number, pxW: number, pxH: number) => (width * pxH) / pxW

const lead = { pxW: 360, pxH: 460, worldW: 20 }

export const CARD_DESIGNS: ToolCardDesign[] = [
  {
    kind: 'layers',
    displayName: 'sh-design',
    ...lead,
    worldH: aspectHeight(lead.worldW, lead.pxW, lead.pxH),
    x: -27.4,
    y: 28.5,
    z: 14,
    yaw: 0.05,
    lead: true
  },
  {
    kind: 'chart',
    displayName: 'sk-chart-duo',
    pxW: 280,
    pxH: 360,
    worldW: 14.5,
    worldH: aspectHeight(14.5, 280, 360),
    x: -10.8,
    y: 27.2,
    z: 8,
    yaw: -0.04
  },
  {
    kind: 'code',
    displayName: 'Coral Coder',
    pxW: 250,
    pxH: 325,
    worldW: 12.6,
    worldH: aspectHeight(12.6, 250, 325),
    x: 2,
    y: 26.2,
    z: 4,
    yaw: 0.04
  },
  {
    kind: 'cloud',
    displayName: 'shukelab',
    pxW: 225,
    pxH: 290,
    worldW: 11.2,
    worldH: aspectHeight(11.2, 225, 290),
    x: 13.6,
    y: 25.4,
    z: 0,
    yaw: -0.04
  },
  {
    kind: 'flash',
    displayName: 'Flash',
    pxW: 210,
    pxH: 270,
    worldW: 10.4,
    worldH: aspectHeight(10.4, 210, 270),
    x: 24.8,
    y: 24.8,
    z: -3,
    yaw: 0.035
  },
  {
    kind: 'book',
    displayName: 'NovelAtlas',
    pxW: 198,
    pxH: 255,
    worldW: 9.7,
    worldH: aspectHeight(9.7, 198, 255),
    x: 35.7,
    y: 24.4,
    z: -6,
    yaw: -0.035
  },
  {
    kind: 'gem',
    displayName: 'Resonance',
    pxW: 188,
    pxH: 242,
    worldW: 9.2,
    worldH: aspectHeight(9.2, 188, 242),
    x: 46.4,
    y: 24.1,
    z: -9,
    yaw: 0.035
  }
]

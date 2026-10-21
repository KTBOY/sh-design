export interface CityPalette {
  fog: number
  roadNear: number
  avenue: number
  roadFar: number
  sidewalk: number
  lot: number
  park: number
  plaza: number
  wall: number
  glass: number
  lit: number
  roof: number
  cap: number
  mech: number
  edge: number
  frame: number
  sky: number
  marking: number
  accent: number
  lamp: number
  lampGlow: number
  tree: number
  trunk: number
  carWarm: number
  carCool: number
  shadow: number
  litChance: number
}

export const LIGHT_PALETTE: CityPalette = {
  fog: 0xf4f7fa,
  roadNear: 0xb9c6d6,
  avenue: 0x9dacbd,
  roadFar: 0xdde5ee,
  sidewalk: 0xdbe4ee,
  lot: 0xe6edf5,
  park: 0xdfe9e4,
  plaza: 0xeaeff6,
  wall: 0xf8fafd,
  glass: 0xdce7f4,
  lit: 0x6ea6ef,
  roof: 0xffffff,
  cap: 0xffffff,
  mech: 0xe9eff7,
  edge: 0xc7d5e6,
  frame: 0xdfe9f5,
  sky: 0xe9f1fb,
  marking: 0xffffff,
  accent: 0x3b82f6,
  lamp: 0xe8f1fb,
  lampGlow: 0xbfd9f7,
  tree: 0xc9dcd5,
  trunk: 0xdde6ef,
  carWarm: 0x3b82f6,
  carCool: 0x93c5fd,
  shadow: 0x7f9ab8,
  litChance: 0.05
}

export const DARK_PALETTE: CityPalette = {
  fog: 0x14161a,
  roadNear: 0x191d24,
  avenue: 0x141820,
  roadFar: 0x14171d,
  sidewalk: 0x1e242e,
  lot: 0x222935,
  park: 0x1b2a26,
  plaza: 0x252d3a,
  frame: 0x3c4b60,
  sky: 0x22303f,
  wall: 0x202938,
  glass: 0x2c3b52,
  lit: 0x7cc4ff,
  roof: 0x2b3648,
  cap: 0x3a4658,
  mech: 0x28313f,
  edge: 0x3f5170,
  marking: 0x8fa6c4,
  accent: 0x60a5fa,
  lamp: 0x33415a,
  lampGlow: 0x60a5fa,
  tree: 0x24413a,
  trunk: 0x33405a,
  carWarm: 0xfde68a,
  carCool: 0x9ecbff,
  shadow: 0x000000,
  litChance: 0.3
}

export function getPalette(dark: boolean): CityPalette {
  return dark ? DARK_PALETTE : LIGHT_PALETTE
}

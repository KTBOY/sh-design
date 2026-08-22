/**
 * 组件 + 源码注册表（仅浏览器端使用，可自由 import .vue）。
 *
 * 每个演示通过 `?raw` 同时拿到组件本身和它的源码字符串——
 * 详情页展示的 HTML / CSS 就是从这份源码里切出来的，永远和实际渲染一致。
 */
import type { Component } from 'vue'

import SkillNeonButton from './demos/skill-neon-button.vue'
import SkillNeonButtonSource from './demos/skill-neon-button.vue?raw'

import FxCube3d from './demos/fx-cube-3d.vue'
import FxCube3dSource from './demos/fx-cube-3d.vue?raw'

import type { ShowcaseKind } from './meta'

export interface ShowcaseDemo {
  component: Component
  /** .vue 单文件组件的原始源码 */
  source: string
}

export const SKILL_DEMOS: Record<string, ShowcaseDemo> = {
  'neon-button': { component: SkillNeonButton, source: SkillNeonButtonSource }
}

export const EFFECT_DEMOS: Record<string, ShowcaseDemo> = {
  'cube-3d': { component: FxCube3d, source: FxCube3dSource }
}

export function getDemoMap(kind: ShowcaseKind): Record<string, ShowcaseDemo> {
  return kind === 'skills' ? SKILL_DEMOS : EFFECT_DEMOS
}

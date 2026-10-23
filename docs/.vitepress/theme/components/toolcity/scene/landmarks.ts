export interface LandmarkSpec {
  /** 建筑的功能名称，不重复维护产品说明。 */
  title: string
  /** 街区中的固定地块坐标，独立于产品排列顺序。 */
  position: readonly [number, number]
  /** 铭牌短名称，完整名称仍来自产品数据。 */
  label: string
}

export const LANDMARKS: Readonly<Record<string, LandmarkSpec>> = {
  'sh-design': { title: '组件中心', position: [-9, 3], label: 'sh-design' },
  'sk-chart-duo': { title: '图表塔群', position: [2, 2], label: 'sk-chart-duo' },
  'coral-coder': { title: '星空观测馆', position: [1, -8], label: 'Coral Coder' },
  shukelab: { title: '跨端实验室', position: [-9, -7], label: 'shukelab' },
  flash: { title: '街机游艺馆', position: [-5, 11], label: '闪电Flash' },
  'novel-atlas': { title: '设定图书馆', position: [10, -5], label: 'NovelAtlas' },
  'resonance-hud': { title: '交互设计馆', position: [8, 9], label: 'Resonance HUD' }
}

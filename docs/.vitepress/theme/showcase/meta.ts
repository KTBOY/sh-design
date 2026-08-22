/**
 * showcase 元数据（纯数据，禁止 import .vue 组件）。
 *
 * 该文件同时被两端消费：
 *  - Node 端：skills/[id].paths.ts / css/[id].paths.ts 动态路由生成器（构建期执行）；
 *  - 浏览器端：ShowcaseGallery 卡片列表 / ShowcaseDetail 详情内容。
 *
 * 组件与源码注册表在 demos.ts（仅浏览器端引用）。
 */
export type ShowcaseKind = 'skills' | 'effects'

export interface ShowcaseMeta {
  /** 路由 id，同时是详情页 URL 的一段 */
  id: string
  title: string
  desc: string
  tags: string[]
}

export interface KindConfig {
  kind: ShowcaseKind
  /** 站点路由目录 */
  dir: string
  eyebrow: string
  name: string
  slogan: string
  desc: string
}

export const KIND_CONFIG: Record<ShowcaseKind, KindConfig> = {
  skills: {
    kind: 'skills',
    dir: 'skills',
    eyebrow: 'sh-design · CSS Skill Cards',
    name: 'Skill 技能秀',
    slogan: '每一张卡片，都是一次纯 CSS 的炫技',
    desc: '纯 CSS 技能卡片：零 JS、零依赖，点击卡片即可查看完整效果与可复制的源码。',
  },
  effects: {
    kind: 'effects',
    dir: 'css',
    eyebrow: 'sh-design · CSS Effects Lab',
    name: 'CSS 特效实验室',
    slogan: '把星空装进 CSS：一颗会呼吸的魔法星核',
    desc: '深空之上，白色星核呼吸明灭，青紫星云旋转流转，线框星轨托着一颗星点巡行——页面背景本身就是特效。点击卡片查看完整效果与源码。'
  }
}

export const SKILLS: ShowcaseMeta[] = [
  {
    id: 'neon-button',
    title: '霓虹发光按钮',
    desc: '多层 box-shadow 叠加出霓虹光晕，呼吸灯常亮，hover 时瞬间点亮。',
    tags: ['box-shadow', 'animation', 'hover']
  }
]

export const EFFECTS: ShowcaseMeta[] = [
  {
    id: 'cube-3d',
    title: '3D 旋转立方体',
    desc: '六个面用 translateZ 拼装，rotate3d 让它永不停歇地翻滚。',
    tags: ['preserve-3d', 'rotate3d', 'translateZ']
  }
]

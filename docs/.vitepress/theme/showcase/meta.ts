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
  /** 技能对应的 GitHub 仓库（详情页展示源码链接） */
  repo?: string
  /** 安装命令（详情页展示在完整源码上方） */
  install?: string
  /** 「已使用的项目」画廊条目（详情页展示 gif 演示） */
  usedIn?: UsedProject[]
}

export interface UsedProject {
  /** 项目名称 */
  name: string
  /** 一句话说明 */
  desc?: string
  /** 演示媒体：gif 或 mp4，路径相对于站点根（如 /img/xxx.gif），组件内自动 withBase */
  media: string
  /** 图片加载失败/读屏时的替代描述，默认使用「{name} 效果演示」 */
  alt?: string
  /** 可选的项目链接（有链接时卡片可点击，右上角悬浮「查看」角标） */
  link?: string
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
    eyebrow: 'KTBOY · Personal Skills',
    name: 'Skill',
    slogan: '一些用纯 CSS 完成的小练习',
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
    id: 'resonance-hud',
    title: '共鸣 HUD · 深色金调设计语言',
    desc: '一套深色金调游戏 HUD 设计语言：角标括号、菱形标记、发丝分隔线全由 CSS 与内联 SVG 绘制，零图片素材、零 Web 字体，任意 DPI 下都锐利。',
    tags: ['css-tokens', 'inline-svg', 'zero-asset'],
    repo: 'https://github.com/KTBOY/resonance-hud',
    install: 'npx skills add https://github.com/KTBOY/resonance-hud --skill resonance-hud',
    usedIn: [
      {
        name: '桌面精灵',
        desc: '深色金调桌面宠物，呼吸明灭的 HUD 质感',
        media: '/img/desktop-pet.mp4'
      },
      {
        name: '墨枢 NovelAtlas',
        desc: 'AI 小说创作一致性工作台，把设定沉淀为知识图谱',
        media: '/img/moshu-demo.webp'
      },
      {
        name: '闪电Flash 游戏修改器',
        desc: '通用 Flash 游戏修改器：Ruffle 内存扫描 · 变速齿轮',
        media: '/img/flash-trainer.webp'
      }
    ]
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

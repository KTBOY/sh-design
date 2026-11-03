/**
 * 个人主页（/guide/about）内容数据。
 * 替换简历/项目信息时只需修改本文件，无需改动页面组件。
 */

export interface ProfileLink {
  label: string
  href: string
  /** 站内链接（组件内自动 withBase、不新开标签页）；缺省视为外链 */
  internal?: boolean
}

export interface Project {
  no: string
  name: string
  nameZh: string
  desc: string
  tags: string[]
  links: ProfileLink[]
  /** GitHub 仓库 owner/name，用于在卡片上取星标数；无仓库则省略 */
  repo?: string
  /** 下架标记：数据保留，只是不在主页精选项目区出现 */
  hidden?: boolean
}

export interface ExperienceItem {
  period: string
  role: string
  org: string
  desc: string
}

export interface SkillGroup {
  title: string
  titleZh: string
  items: string[]
}

export const PROFILE = {
  overline: 'Portfolio · Selected Works',
  name: 'KTBOY',
  role: 'Frontend Engineer · Vue Ecosystem',
  roleZh: '前端工程师 / 组件库作者',
  tagline: 'Crafting warm, performant interfaces with code.',
  taglineZh: '用代码构建有温度、高性能的界面。',
  links: [
    { label: 'GitHub', href: 'https://github.com/KTBOY' },
    { label: 'npm', href: 'https://www.npmjs.com/package/sh-design' },
  ] as ProfileLink[]
}

export const PROJECTS: Project[] = [
  {
    no: '01',
    name: 'sh-design',
    nameZh: 'Vue3 业务组件库',
    desc: '面向业务场景的 Vue 3 组件库：高性能瀑布流（虚拟列表 / 无限滚动）、图片懒加载、无缝滚动、骨架屏，TypeScript 友好，支持按需引入，已发布 npm。',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'pnpm Monorepo'],
    repo: 'KTBOY/sh-design',
    links: [
      { label: 'GitHub', href: 'https://github.com/KTBOY/sh-design' },
      { label: 'npm', href: 'https://www.npmjs.com/package/sh-design' },
      { label: 'Docs', href: 'https://ktboy.github.io/sh-design/' }
    ]
  },

  {
    no: '02',
    name: 'Coral Coder',
    nameZh: '珊瑚打码小程序',
    desc: '微信小程序：图片瀑布流浏览与打码工具，基于 uni-app 与自研瀑布流组件，兼顾性能与体验。',
    tags: ['WeChat Mini Program', 'uni-app'],
    links: [{ label: 'Docs', href: 'https://ktboy.github.io/sh-design/mini/sk-image-waterfall' }]
  },
  {
    no: '03',
    name: 'sk-faster-ant',
    nameZh: 'Ant Design Vue 增强',
    hidden: true,
    desc: '针对 Ant Design Vue 的效率增强工具集，沉淀业务表格 / 表单的高频封装，减少重复代码。',
    tags: ['Ant Design Vue', '效率工具'],
    repo: 'KTBOY/sk-faster-ant',
    links: [{ label: 'GitHub', href: 'https://github.com/KTBOY/sk-faster-ant' }]
  },
  {
    no: '04',
    name: 'Resonance HUD-ui skill',
    nameZh: '共鸣 HUD 设计语言',
    desc: '深色金调的游戏 HUD 设计语言，打包为 Agent Skill：零图片素材、零 Web 字体，全部装饰由 CSS / 内联 SVG 绘制，任意 DPI 下都锐利。',
    tags: ['CSS 设计语言', 'Agent Skill', 'npx skills add'],
    repo: 'KTBOY/resonance-hud',
    links: [
      { label: 'GitHub', href: 'https://github.com/KTBOY/resonance-hud' },
      { label: 'Gallery', href: 'https://ktboy.github.io/sh-design/skills/' }
    ]
  },
  {
    no: '05',
    name: 'Driver Console UI',
    nameZh: '司机端双模界面设计',
    hidden: true,
    desc: '网约车司机端小程序的完整界面设计：白班与夜班两套光环境共用一套系统，16 张设计稿、两支 30 秒动效片，附 token 表与 TDesign 主题覆写规范。',
    tags: ['UI Design', 'Design System', 'TDesign', 'Motion Graphics'],
    links: [{ label: 'Spec', href: '/design/driver', internal: true }]
  },
  {
    no: '06',
    name: 'shuke-lab-flux',
    nameZh: 'FLUX 流体颜色生成器',
    desc: '零依赖 WebGL 流体颜色实验室与手写的 Vue 3 内容仪表盘：六块画布共用一套 FBM 噪声材质，玻璃胶囊里的烟雾持续流动，不接任何 UI 组件库。',
    tags: ['Vue 3', 'WebGL', 'TypeScript', 'Vite'],
    links: [
      { label: 'GitHub', href: 'https://github.com/KTBOY/shuke-lab-flux' },
      { label: 'Preview', href: 'https://ktboy.github.io/shuke-lab-flux/' }
    ],
    repo: 'KTBOY/shuke-lab-flux'
  }
]

// 以下为示例经历，请替换为真实简历内容
export const EXPERIENCE: ExperienceItem[] = [
  {
    period: '2024 — Now',
    role: 'Independent Developer & Open-source Author',
    org: 'sh-design',
    desc: '主导组件库架构、文档站与发布流程；独立产品从设计到上线的完整闭环。'
  },
  {
    period: '2021 — 2024',
    role: 'Frontend Engineer',
    org: '（公司名称待填写）',
    desc: '负责业务系统前端开发，沉淀业务组件与工程化实践，支撑多端交付。'
  },
  {
    period: 'Before',
    role: 'The Beginning',
    org: 'Web · JavaScript · CSS',
    desc: '从一行 console.log 开始，持续构建至今。'
  }
]

export const SKILLS: SkillGroup[] = [
  {
    title: 'Core',
    titleZh: '核心',
    items: ['Vue 3', 'React18', 'TypeScript', 'JavaScript ESNext', 'HTML5', 'CSS3 / Sass','java','node','Flash动画']
  },
  {
    title: 'Engineering',
    titleZh: '工程化',
    items: ['Vite', 'VitePress', 'pnpm Monorepo', 'ESLint / Prettier', 'Git / CI']
  },
  {
    title: 'Ecosystem',
    titleZh: '生态',
    items: ['uni-app', 'WeChat Mini Program', 'Ant Design Vue', 'Node.js']
  },
  {
    title: 'Design',
    titleZh: '设计',
    items: ['Design System', 'Responsive Layout', 'Motion & Micro-interaction']
  }
]

/** 设计稿条目：src 为站点内路径（不含 base），组件内 withBase */
export interface UiScreen {
  id: string
  label: string
  src: string
  alt: string
}

export interface UiMode {
  id: 'day' | 'night'
  label: string
  labelEn: string
  /** 一句话说明这一套光环境在解决什么问题 */
  note: string
  /** 3:4 双模对照板 */
  lead: UiScreen
  /** 375×812 手机屏，一行样张墙 */
  screens: UiScreen[]
  /** 3:4 系统规范板 */
  board: UiScreen
}

export interface UiFilm {
  id: string
  title: string
  titleZh: string
  /** 动效风格流派，来自影片 treatment */
  style: string
  video: string
  poster: string
  alt: string
  spec: string[]
  credit: string
}

export interface UiDesign {
  name: string
  nameZh: string
  desc: string
  chips: string[]
  /** 完整设计规范的站内页 */
  specHref: string
  modes: UiMode[]
  films: UiFilm[]
}

/**
 * 个人主页 03 UI Design 区块的作品数据。
 * 媒体资源在 docs/public/design/driver/，由源仓库设计稿离线转 WebP、影片转 CRF30 得到。
 */
export const UI_DESIGN: UiDesign = {
  name: 'Driver Console, Two Light Conditions',
  nameZh: '司机端小程序 · 白班与夜班',
  desc: '面向城市网约车司机的工具型小程序设计。使用场景在车内：单手、强光、时间敏感，所以一屏只留一个主操作，订单信息必须在三秒内读完。白班与夜班共用同一套系统，只换表面层级与信号色。',
  chips: ['375 × 812 基准', 'TDesign 主题覆写', '4 级表面，2 个信号色', '一屏一个主操作'],
  specHref: '/design/driver',
  modes: [
    {
      id: 'day',
      label: '白班',
      labelEn: 'Day',
      note: '暖白 canvas 配墨黑主操作，车内强光下靠明度差而不是颜色分层。',
      lead: {
        id: 'cover',
        label: '双模对照板',
        src: '/design/driver/day/cover.webp',
        alt: '司机端小程序白班与夜班双模对照板，白天是工具夜里是搭档'
      },
      screens: [
        {
          id: 'hall',
          label: '接单大厅',
          src: '/design/driver/day/hall.webp',
          alt: '白班接单大厅：收入概览卡与附近订单卡片列表，黑色胶囊接单按钮'
        },
        {
          id: 'detail',
          label: '订单详情与路线',
          src: '/design/driver/day/detail.webp',
          alt: '白班订单详情：地图路线与底部路线面板，起终点和价格'
        },
        {
          id: 'mine',
          label: '我的',
          src: '/design/driver/day/mine.webp',
          alt: '白班个人中心：司机资料卡与入口列表'
        },
        {
          id: 'records',
          label: '接单记录',
          src: '/design/driver/day/records.webp',
          alt: '白班接单记录：进行中与已完成分段切换的订单列表'
        },
        {
          id: 'edit',
          label: '编辑资料',
          src: '/design/driver/day/edit.webp',
          alt: '白班编辑资料：表单字段与保存按钮'
        },
        {
          id: 'login',
          label: '微信登录',
          src: '/design/driver/day/login.webp',
          alt: '白班微信登录页：品牌标记、登录按钮与协议勾选'
        }
      ],
      board: {
        id: 'system',
        label: '系统规范板',
        src: '/design/driver/day/system.webp',
        alt: '白班系统规范板：颜色、字号、间距与圆角的取值说明'
      }
    },
    {
      id: 'night',
      label: '夜班',
      labelEn: 'Night',
      note: '四级表面逐级提亮把卡片从背景里拉开，荧光绿只给主操作和夜间单。',
      lead: {
        id: 'cover',
        label: '双模对照板',
        src: '/design/driver/night/cover.webp',
        alt: '司机端小程序夜班双模对照板，黑底荧光绿的接单大厅'
      },
      screens: [
        {
          id: 'hall',
          label: '接单大厅',
          src: '/design/driver/night/hall.webp',
          alt: '夜班接单大厅：深色卡片列表与荧光绿立即接单按钮'
        },
        {
          id: 'detail',
          label: '订单详情与路线',
          src: '/design/driver/night/detail.webp',
          alt: '夜班订单详情：暗色地图路线与底部面板'
        },
        {
          id: 'mine',
          label: '我的',
          src: '/design/driver/night/mine.webp',
          alt: '夜班个人中心：深色资料卡与入口列表'
        },
        {
          id: 'records',
          label: '接单记录',
          src: '/design/driver/night/records.webp',
          alt: '夜班接单记录：进行中与已完成列表'
        },
        {
          id: 'edit',
          label: '编辑资料',
          src: '/design/driver/night/edit.webp',
          alt: '夜班编辑资料：暗色表单与保存按钮'
        },
        {
          id: 'login',
          label: '微信登录',
          src: '/design/driver/night/login.webp',
          alt: '夜班微信登录页：黑底白字与荧光绿按钮'
        }
      ],
      board: {
        id: 'system',
        label: '系统规范板',
        src: '/design/driver/night/system.webp',
        alt: '夜班系统规范板：四级表面色阶与两个信号色的取值说明'
      }
    }
  ],
  films: [
    {
      id: 'day',
      title: 'Day Shift, Nine Rides',
      titleZh: '白班：九单',
      style: 'Swiss Motion Graphics',
      video: '/design/driver/film/day-30s.mp4',
      poster: '/design/driver/film/day-poster.webp',
      alt: '白班三十秒动效片封面：排班表网格与落进格子的订单块',
      spec: ['1080 × 1920', '24 fps', '30 s', '无旁白'],
      credit: 'Design, direction, code and sound: 舒克-KTBOY'
    },
    {
      id: 'night',
      title: 'Night Is the Partner',
      titleZh: '夜里是搭档',
      style: 'Dark Tech Keynote',
      video: '/design/driver/film/night-30s.mp4',
      poster: '/design/driver/film/night-poster.webp',
      alt: '夜班三十秒动效片封面：黑场中唯一亮着的听单状态点',
      spec: ['1080 × 1920', '24 fps', '30 s', '无旁白'],
      credit: 'Design, direction, code and sound: 舒克-KTBOY'
    }
  ]
}

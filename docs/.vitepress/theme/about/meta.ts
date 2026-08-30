/**
 * 个人主页（/guide/about）内容数据。
 * 替换简历/项目信息时只需修改本文件，无需改动页面组件。
 */

export interface ProfileLink {
  label: string
  href: string
}

export interface Project {
  no: string
  name: string
  nameZh: string
  desc: string
  tags: string[]
  links: ProfileLink[]
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
  overline: 'Portfolio · Kyoto Remix',
  name: 'KTBOY',
  role: 'Frontend Engineer · Vue Ecosystem',
  roleZh: '前端工程师 / 组件库作者',
  tagline: 'Crafting warm, performant interfaces with code.',
  taglineZh: '用代码构建有温度、高性能的界面。',
  links: [
    { label: 'GitHub', href: 'https://github.com/KTBOY' },
    { label: 'npm', href: 'https://www.npmjs.com/package/sh-design' },
    { label: '粤工具', href: 'https://www.ps521.asia/' }
  ] as ProfileLink[]
}

export const PROJECTS: Project[] = [
  {
    no: '01',
    name: 'sh-design',
    nameZh: 'Vue3 业务组件库',
    desc: '面向业务场景的 Vue 3 组件库：高性能瀑布流（虚拟列表 / 无限滚动）、图片懒加载、无缝滚动、骨架屏，TypeScript 友好，支持按需引入，已发布 npm。',
    tags: ['Vue 3', 'TypeScript', 'Vite', 'pnpm Monorepo'],
    links: [
      { label: 'GitHub', href: 'https://github.com/KTBOY/sh-design' },
      { label: 'npm', href: 'https://www.npmjs.com/package/sh-design' },
      { label: 'Docs', href: 'https://ktboy.github.io/sh-design/' }
    ]
  },
  {
    no: '02',
    name: 'Yue Tools',
    nameZh: '粤工具',
    desc: '面向粤语地区用户的在线工具箱站点，覆盖日常高频小工具场景，独立完成设计、开发与部署。',
    tags: ['Web App', '独立开发'],
    links: [{ label: 'Visit', href: 'https://www.ps521.asia/' }]
  },
  {
    no: '03',
    name: 'Coral Coder',
    nameZh: '珊瑚打码小程序',
    desc: '微信小程序：图片瀑布流浏览与打码工具，基于 uni-app 与自研瀑布流组件，兼顾性能与体验。',
    tags: ['WeChat Mini Program', 'uni-app'],
    links: [{ label: 'Docs', href: 'https://ktboy.github.io/sh-design/mini/sk-image-waterfall' }]
  },
  {
    no: '04',
    name: 'sk-faster-ant',
    nameZh: 'Ant Design Vue 增强',
    desc: '针对 Ant Design Vue 的效率增强工具集，沉淀业务表格 / 表单的高频封装，减少重复代码。',
    tags: ['Ant Design Vue', '效率工具'],
    links: [{ label: 'GitHub', href: 'https://github.com/KTBOY/sk-faster-ant' }]
  }
]

// 以下为示例经历，请替换为真实简历内容
export const EXPERIENCE: ExperienceItem[] = [
  {
    period: '2024 — Now',
    role: 'Independent Developer & Open-source Author',
    org: 'sh-design / 粤工具',
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
    items: ['Vue 3', 'TypeScript', 'JavaScript ESNext', 'HTML5', 'CSS3 / Sass']
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

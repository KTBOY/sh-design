/**
 * /products/ 更多工具页 + 个人主页「More Tools」区块共用的内容数据。
 * 新增工具时只需在本文件追加，两个页面自动同步。
 */

export interface ToolLink {
  label: string
  href: string
  /** 站内链接（自动 withBase、不新开标签页）；缺省视为外链 */
  internal?: boolean
  /** 主操作（下载等）：按钮做蓝色强调样式 */
  primary?: boolean
}

export interface Tool {
  name: string
  nameZh: string
  desc: string
  tags: string[]
  links: ToolLink[]
}

export interface ToolGroup {
  id: string
  title: string
  zh: string
  items: Tool[]
}

export const TOOL_GROUPS: ToolGroup[] = [
  {
    id: 'web',
    title: 'Products & Sites',
    zh: '精选项目',
    items: [
      {
        name: 'Yue Tools',
        nameZh: '粤电玩',
        desc: '在线工具箱站点，覆盖日常高频小工具场景。',
        tags: ['Web App', '独立开发'],
        links: [{ label: 'Visit', href: 'https://www.ps521.asia/' }]
      },
      {
        name: 'sh-design',
        nameZh: 'Vue3 业务组件库',
        desc: '高性能瀑布流（虚拟列表 / 无限滚动）、图片懒加载、无缝滚动、骨架屏，TypeScript 友好，已发布 npm。你正在看的文档站就是它。',
        tags: ['Vue 3', 'TypeScript', 'pnpm Monorepo'],
        links: [
          { label: 'GitHub', href: 'https://github.com/KTBOY/sh-design' },
          { label: 'npm', href: 'https://www.npmjs.com/package/sh-design' },
          { label: 'Docs', href: '/components/lazy-image', internal: true }
        ]
      },
      {
        name: 'Coral Coder',
        nameZh: '珊瑚打码小程序',
        desc: 'NASA壁纸+工具，累计用户2000+',
        tags: ['WeChat Mini Program', 'uni-app'],
        links: [{ label: '在线演示', href: '/mini', internal: true }]
      },
      {
        name: 'shukelab',
        nameZh: '组件实验室',
        desc: 'uni-app 多端实验组件收容所：联动菜单、底部导航等业务向小组件的在线演示场。',
        tags: ['uni-app', 'H5'],
        links: [{ label: '在线演示', href: '/lab/sk-linkage-menu', internal: true }]
      }
    ]
  },
  {
    id: 'oss',
    title: 'Open Source & Desktop',
    zh: '其他项目',
    items: [
      {
        name: '闪电Flash',
        nameZh: '通用 Flash 游戏修改器',
        desc: '通用 Flash 游戏修改器：内置 Ruffle(WASM) 模拟器运行 SWF，直接对其内存扫描 / 修改 / 锁定，支持变速齿轮、游戏库与配置存档，无需针对单个游戏做任何配置。',
        tags: ['Electron', 'React', 'Ruffle WASM', '内存扫描'],
        links: [
          { label: 'GitHub', href: 'https://github.com/KTBOY/flash-edit' },
          {
            label: '下载 ZIP',
            href: 'https://github.com/KTBOY/flash-edit/releases/latest/download/FlashGameTrainer-Portable-v0.1.0-win64.zip',
            primary: true
          }
        ]
      },
      {
        name: 'NovelAtlas',
        nameZh: '墨枢 · AI 小说一致性工作台',
        desc: '把小说设定沉淀为知识图谱，在写作的每一步校验一致性，并把「恰好够用」的设定喂给 AI——让任何模型写长篇都不崩人设。纯前端，数据 100% 存本地。',
        tags: ['React 18', 'D3 力导向图', 'Zustand'],
        links: [
          { label: 'GitHub', href: 'https://github.com/KTBOY/sk-ms' },
          {
            label: '下载 ZIP',
            href: 'https://github.com/KTBOY/sk-ms/releases/latest/download/NovelAtlas-Portable-v1.0.0-win64.zip',
            primary: true
          }
        ]
      },
      {
        name: 'Resonance HUD-ui skill',
        nameZh: '共鸣 HUD 设计语言',
        desc: '深色金调的游戏 HUD 设计语言，打包为 Agent Skill：零图片素材、零 Web 字体，全部装饰由 CSS / 内联 SVG 绘制，任意 DPI 下都锐利。',
        tags: ['CSS 设计语言', 'Agent Skill', 'npx skills add'],
        links: [
          { label: 'GitHub', href: 'https://github.com/KTBOY/resonance-hud' },
          { label: '画廊', href: '/skills/', internal: true }
        ]
      },
      {
        name: 'Fengyu Desktop Pet',
        nameZh: '漂泊者桌面精灵',
        desc: 'Electron + Canvas 的 Windows 桌面精灵：呼吸摆动、鼠标跟随、点击反馈与星光特效，多角色画廊一键整体换肤，支持缩放、托盘菜单与配置记忆。',
        tags: ['Electron', 'Canvas', '桌面应用'],
        links: [
          { label: 'GitHub', href: 'https://github.com/KTBOY/fengyu-desktop-pet' },
          {
            label: '下载 ZIP',
            href: 'https://github.com/KTBOY/fengyu-desktop-pet/releases/latest/download/FengyuDesktopPet-Portable-v1.0.0-win64.zip',
            primary: true
          }
        ]
      }
    ]
  }
]

export const ALL_TOOLS: Tool[] = TOOL_GROUPS.flatMap((g) => g.items)

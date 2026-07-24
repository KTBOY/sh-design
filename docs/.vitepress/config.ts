import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'sh-design',
  description: 'A functional & business-oriented Vue 3 component library',
  lang: 'zh-CN',
  // GitHub Pages project site: https://ktboy.github.io/sh-design/
  base: '/sh-design/',
  lastUpdated: true,
  cleanUrls: true,
  head: [['meta', { name: 'theme-color', content: '#2563eb' }]],
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: '组件', link: '/components/copy-button', activeMatch: '/components/' },
      {
        text: '0.0.1',
        items: [
          { text: 'npm', link: 'https://www.npmjs.com/package/sh-design' },
          { text: '更新日志', link: 'https://github.com/KTBOY/sh-design/releases' }
        ]
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '安装', link: '/guide/installation' },
            { text: '快速上手', link: '/guide/quickstart' }
          ]
        }
      ],
      '/components/': [
        {
          text: '业务组件',
          items: [{ text: 'CopyButton 复制按钮', link: '/components/copy-button' }]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/KTBOY/sh-design' }],
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 shukezlc'
    },
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一页', next: '下一页' }
  },
  vite: {
    resolve: {
      // Use the library source directly so demos stay live without a build step.
      alias: [
        {
          find: /^sh-design$/,
          replacement: fileURLToPath(
            new URL('../../packages/sh-design/src/index.ts', import.meta.url)
          )
        }
      ]
    }
  }
})

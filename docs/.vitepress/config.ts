import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'sh-design',
  description:
    'sh-design — 面向业务场景的 Vue3 组件库：高性能瀑布流（虚拟列表/无限滚动）、图片懒加载、无缝滚动、一键复制等开箱即用组件，TypeScript 友好，支持按需引入',
  lang: 'zh-CN',
  // GitHub Pages project site: https://ktboy.github.io/sh-design/
  base: '/sh-design/',
  lastUpdated: true,
  cleanUrls: true,
  // SEO: 生成 sitemap.xml，供 Google/百度站长平台提交收录
  sitemap: { hostname: 'https://ktboy.github.io/sh-design/' },
  head: [
    ['meta', { name: 'theme-color', content: '#2563eb' }],
    // SEO: 关键词与作者
    [
      'meta',
      {
        name: 'keywords',
        content:
          'Vue3 组件库, 瀑布流组件, 虚拟列表, 虚拟滚动, 图片懒加载, 无缝滚动, 无限滚动, 分页加载, masonry, waterfall, lazyload, sh-design'
      }
    ],
    ['meta', { name: 'author', content: 'shukezlc' }],
    // Open Graph：社交/IM 分享卡片
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'sh-design' }],
    ['meta', { property: 'og:title', content: 'sh-design · 面向业务场景的 Vue3 组件库' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          '高性能瀑布流（虚拟列表 + 分页加载）、图片懒加载、无缝滚动等开箱即用组件，TypeScript 友好。'
      }
    ],
    ['meta', { property: 'og:image', content: 'https://ktboy.github.io/sh-design/logo2.png' }],
    ['meta', { property: 'og:url', content: 'https://ktboy.github.io/sh-design/' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],
  themeConfig: {
    siteTitle: false,
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      { text: '组件', link: '/components/lazy-image', activeMatch: '/components/' },
      { text: '简历', link: '/components/lazy-image', activeMatch: '/components/' },
      {
        text: '更多产品',
        items: [
          { text: '粤工具', link: 'https://www.ps521.asia/' },
          { text: '组件实验室', link: '/lab/sk-linkage-menu' },
          { text: '珊瑚打码小程序', link: '/mini/sk-image-waterfall' },
        ]
      },
      {
        text: '0.0.7',
        items: [
          { text: 'npm', link: 'https://www.npmjs.com/package/sh-design' }
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
        },
        {
          text: '更多',
          items: [{ text: '更新日志', link: '/guide/changelog' }]
        }
      ],
      '/components/': [
        {
          text: 'sh-design组件',
          items: [
            { text: 'LazyImage 懒加载图片', link: '/components/lazy-image' },
            { text: 'SeamlessScroll 无缝滚动', link: '/components/seamless-scroll' },
            { text: 'Waterfall 瀑布流', link: '/components/waterfall' }
          ]
        }
      ],
      '/mini/': [
        {
          text: '珊瑚打码小程序',
          link: '/mini/'
        },
        {
          text: '组件',
          items: [
            { text: 'ImageWaterfall 图片瀑布流', link: '/mini/sk-image-waterfall' }
          ]
        }
      ],
      '/lab/': [
        {
          text: 'shukelab 实验室组件（uni-app）',
          items: [
            { text: 'sk-linkage-menu 左右联动菜单', link: '/lab/sk-linkage-menu' }
          ]
        }
      ]
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/KTBOY/sh-design' }],
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 shukezlc 思涵'
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

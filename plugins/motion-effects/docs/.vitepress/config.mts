import { defineConfig } from 'vitepress'
import { CATEGORIES, EFFECTS } from './data/effects.mjs'

const repo = 'https://github.com/zardlove1991/zard-plugin-marketplace'
const base = process.env.DOCS_BASE || '/'

const effectSidebar = CATEGORIES.slice(1).map(category => ({
  text: category,
  collapsed: false,
  items: EFFECTS
    .filter(effect => effect.cat === category)
    .map(effect => ({
      text: `${effect.zh} · ${effect.name}`,
      link: `/effects/${effect.id}`
    }))
}))

const referenceRoot = `${repo}/blob/main/plugins/motion-effects/skills/motion-effects/references`

export default defineConfig({
  lang: 'zh-CN',
  title: 'Motion Effects',
  description: '20 个高保真交互动效：Vue 3 预览、源码与接入文档',
  base,
  appearance: 'force-dark',
  cleanUrls: false,
  srcExclude: ['README.md', 'public/**'],
  lastUpdated: true,
  sitemap: {
    hostname: 'https://zardlove1991.github.io/zard-plugin-marketplace/',
    // 供 iframe 加载的裸页面，不进站点地图
    transformItems: items => items.filter(item => !/^\/?live\//.test(item.url))
  },
  head: [
    ['meta', { name: 'theme-color', content: '#09090c' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Motion Effects',
    nav: [
      { text: '特效', link: '/effects/' },
      { text: '指南', link: '/guide/' },
      { text: 'Gallery', link: '/gallery.html', target: '_blank' },
      { text: 'GitHub', link: repo }
    ],
    sidebar: {
      '/effects/': effectSidebar,
      '/guide/': [
        {
          text: '接入指南',
          items: [
            { text: '概览', link: '/guide/' },
            { text: 'Vue 组件（0.1）', link: '/guide/vue-components' },
            { text: '本地运行与部署', link: '/guide/deploy' },
            { text: '维护者：新增特效', link: '/guide/add-effect' }
          ]
        },
        {
          text: '参考文档（GitHub）',
          items: [
            { text: '完整特效目录', link: `${referenceRoot}/catalog.md` },
            { text: 'React → Vue 3 移植手册', link: `${referenceRoot}/vue-porting.md` },
            { text: '生产验收清单', link: `${referenceRoot}/production-checklist.md` }
          ]
        }
      ]
    },
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: '本页'
    },
    docFooter: {
      prev: '上一个',
      next: '下一个'
    },
    lastUpdated: {
      text: '最后更新'
    },
    editLink: {
      pattern: `${repo}/edit/main/plugins/motion-effects/docs/:path`,
      text: '在 GitHub 编辑此页'
    },
    socialLinks: [
      { icon: 'github', link: repo }
    ],
    footer: {
      message: 'Vue 3 优先 · 从 React 源码与 vanilla 演示出发做保真移植',
      copyright: 'Motion Effects · 20 effects'
    }
  },
  transformPageData(pageData) {
    const id = pageData.params?.id
    if (!id) return
    const effect = EFFECTS.find(item => item.id === id)
    if (!effect) return
    pageData.title = `${effect.zh} · ${effect.name}`
    pageData.description = effect.desc
    // 动态页由 data/effects.mjs 驱动，不提供模板文件的 editLink
    pageData.frontmatter.editLink = false
  }
})
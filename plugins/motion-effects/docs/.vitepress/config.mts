import { defineConfig } from 'vitepress'
import { EFFECTS } from './data/effects.mjs'
import { REPO } from './data/nav.mjs'

const base = process.env.DOCS_BASE || '/'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Motion Effects',
  description: `${EFFECTS.length} 个高保真交互动效：Vue 3 预览、源码与接入文档`,
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
    ['meta', { name: 'theme-color', content: '#09090b' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Motion Effects',
    // 外壳（顶栏 / 侧栏）由 theme/Layout.vue 自己画，菜单数据见 data/nav.mjs；
    // 这里只保留搜索、页脚文案等配置型字段
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询',
            backButtonTitle: '返回',
            noResultsText: '无法找到相关结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '向上箭头',
              navigateDownKeyAriaLabel: '向下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc'
            }
          }
        }
      }
    },
    docFooter: { prev: '上一个', next: '下一个' },
    lastUpdated: { text: '最后更新' },
    editLink: {
      pattern: `${REPO}/edit/main/plugins/motion-effects/docs/:path`,
      text: '在 GitHub 编辑此页'
    },
    socialLinks: [{ icon: 'github', link: REPO }],
    footer: {
      message: 'Vue 3 优先 · 从 React 源码与 vanilla 演示出发做保真移植',
      copyright: `Motion Effects · ${EFFECTS.length} effects`
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

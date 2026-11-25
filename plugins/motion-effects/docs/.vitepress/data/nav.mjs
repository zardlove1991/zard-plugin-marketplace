/**
 * 站点导航数据：仓库地址、指南菜单、参考文档、分类图标。
 * config.mts 与主题组件共用，避免两处各写一份。
 */

export const REPO = 'https://github.com/zardlove1991/zard-plugin-marketplace'

const PLUGIN_ROOT = `${REPO}/blob/main/plugins/motion-effects`

export const GUIDE_NAV = [
  { text: '概览', link: '/guide/' },
  { text: 'Vue 组件', link: '/guide/vue-components' },
  { text: '本地运行与部署', link: '/guide/deploy' },
  { text: '维护者：新增特效', link: '/guide/add-effect' }
]

export const REFERENCES_ROOT = `${PLUGIN_ROOT}/skills/motion-effects/references`

export const REFERENCES = [
  { text: '完整特效目录', link: `${REFERENCES_ROOT}/catalog.md` },
  { text: 'React → Vue 3 移植手册', link: `${REFERENCES_ROOT}/vue-porting.md` },
  { text: '生产验收清单', link: `${REFERENCES_ROOT}/production-checklist.md` }
]

/** 总览页与侧栏共用的分类 → 图标名（见 MeIcon.vue） */
export const CATEGORY_ICONS = {
  全部: 'grid',
  导航与页面: 'nav',
  卡片与容器: 'card',
  操作与反馈: 'pointer',
  列表与内容: 'list',
  氛围与装饰: 'sparkle'
}

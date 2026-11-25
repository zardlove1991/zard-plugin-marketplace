/**
 * 生成站内链接：按站点是否开启 cleanUrls 决定要不要补 `.html`。
 * 以 `/` 结尾的目录链接和已带 `.html` 的原样返回。
 */
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

export function useHref() {
  const { site } = useData()
  const clean = computed(() => Boolean((site.value as { cleanUrls?: boolean }).cleanUrls))

  function href(path: string) {
    if (path.endsWith('/') || path.endsWith('.html')) return withBase(path)
    return withBase(path + (clean.value ? '' : '.html'))
  }

  return { href }
}

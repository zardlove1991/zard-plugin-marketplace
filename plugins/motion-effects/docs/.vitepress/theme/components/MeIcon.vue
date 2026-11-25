<script setup lang="ts">
/* 站内自绘的线性图标集（24 栅格）。GitHub 标志是 16 栅格的填充路径。 */
defineProps<{ name: string; size?: number }>()

const ICONS: Record<string, string> = {
  grid: 'M3.5 3.5h7v7h-7z M13.5 3.5h7v7h-7z M3.5 13.5h7v7h-7z M13.5 13.5h7v7h-7z',
  nav: 'M3 5.5h18v13H3z M3 10h18 M6.5 7.75h.01',
  card: 'M3.5 6h17v12h-17z M3.5 10.5h17 M16.5 14.25h1.5',
  pointer: 'M5.5 3.5L19 11l-6.2 1.6-3.2 6z',
  list: 'M9 6h11 M9 12h11 M9 18h11 M4.5 6h.01 M4.5 12h.01 M4.5 18h.01',
  sparkle: 'M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M16.5 16.5l4 4',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  close: 'M6 6l12 12 M18 6L6 18',
  'arrow-up-right': 'M7 17L17 7 M8.5 7H17v8.5',
  'arrow-right': 'M4 12h16 M13 5l7 7-7 7',
  'chevron-down': 'M6 9.5l6 6 6-6',
  'chevron-right': 'M9.5 6l6 6-6 6',
  monitor: 'M3.5 5h17v11.5h-17z M9 20.5h6 M12 16.5v4',
  smartphone: 'M7 2.5h10a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1z M10.5 18.5h3',
  refresh: 'M20 12a8 8 0 1 1-2.6-5.9 M20 4.5V9h-4.5',
  copy: 'M9 9h11v11H9z M5 15H4V4h11v1',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z M4 18.5A2.5 2.5 0 0 1 6.5 16H20 M8 7h8',
  sliders: 'M4 7h10 M18 7h2 M4 17h4 M12 17h8 M14 4.5v5 M8 14.5v5',
  external: 'M14 4h6v6 M20 4l-9 9 M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5'
}

const GITHUB =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z'
</script>

<template>
  <svg
    v-if="name === 'github'"
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path :d="GITHUB" />
  </svg>
  <svg
    v-else
    :width="size ?? 16"
    :height="size ?? 16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="ICONS[name] ?? ICONS.sparkle" />
  </svg>
</template>

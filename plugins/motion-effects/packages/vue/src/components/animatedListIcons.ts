import { h, type Component } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
  CodeIcon,
  FigmaIcon,
  File01Icon,
  FileZipIcon,
  Folder01Icon,
  Image01Icon,
  MusicNote01Icon,
  Note01Icon,
  Pdf01Icon,
  Presentation01Icon,
  Table01Icon,
  Video01Icon
} from '@hugeicons/core-free-icons'
import type { AnimatedListItem } from '../types'

const glyph = (icon: unknown): Component => () => h(HugeiconsIcon, { icon, size: 18, strokeWidth: 1.8 })

/** React 默认项的图标数据；在 Vue 里改成图标组件，放进响应式数据时无需 markRaw（这里是模块常量） */
export const ANIMATED_LIST_ICONS = {
  code: glyph(CodeIcon),
  figma: glyph(FigmaIcon),
  file: glyph(File01Icon),
  zip: glyph(FileZipIcon),
  folder: glyph(Folder01Icon),
  image: glyph(Image01Icon),
  music: glyph(MusicNote01Icon),
  note: glyph(Note01Icon),
  pdf: glyph(Pdf01Icon),
  presentation: glyph(Presentation01Icon),
  table: glyph(Table01Icon),
  video: glyph(Video01Icon)
}

export const ANIMATED_LIST_ITEMS: AnimatedListItem[] = [
  { icon: ANIMATED_LIST_ICONS.folder, title: 'Brand assets', description: '24 files', meta: '2m' },
  { icon: ANIMATED_LIST_ICONS.image, title: 'Launch hero.png', description: '2.4 MB', meta: '18m' },
  { icon: ANIMATED_LIST_ICONS.video, title: 'Product tour.mp4', description: '148 MB', meta: '1h' },
  { icon: ANIMATED_LIST_ICONS.note, title: 'Pricing notes', description: '1,240 words', meta: '3h' },
  { icon: ANIMATED_LIST_ICONS.code, title: 'landing-page.tsx', description: '12 KB', meta: '5h' },
  { icon: ANIMATED_LIST_ICONS.figma, title: 'Onboarding flow', description: '38 frames', meta: '8h' },
  { icon: ANIMATED_LIST_ICONS.music, title: 'Ambient loop.wav', description: '9.1 MB', meta: '1d' },
  { icon: ANIMATED_LIST_ICONS.table, title: 'Q3 forecast', description: '4 sheets', meta: '1d' },
  { icon: ANIMATED_LIST_ICONS.pdf, title: 'Brand guidelines.pdf', description: '6.8 MB', meta: '2d' },
  { icon: ANIMATED_LIST_ICONS.presentation, title: 'Investor update', description: '22 slides', meta: '3d' },
  { icon: ANIMATED_LIST_ICONS.zip, title: 'Icon set.zip', description: '1.2 MB', meta: '4d' },
  { icon: ANIMATED_LIST_ICONS.image, title: 'Moodboard.jpg', description: '3.6 MB', meta: '5d' },
  { icon: ANIMATED_LIST_ICONS.file, title: 'Release notes', description: 'Version 2.4', meta: '1w' },
  { icon: ANIMATED_LIST_ICONS.folder, title: 'Archive', description: '118 files', meta: '2w' },
  { icon: ANIMATED_LIST_ICONS.video, title: 'Teaser cut.mov', description: '86 MB', meta: '3w' }
]

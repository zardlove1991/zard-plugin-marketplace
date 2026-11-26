import type { PillNavItem } from '../types'

// 默认条目放在模块作用域，withDefaults 才能引用。
export const DEFAULT_ITEMS: PillNavItem[] = [
  { label: 'Home', href: '#' },
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' }
]

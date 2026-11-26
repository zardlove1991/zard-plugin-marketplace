<script setup lang="ts">
import { computed, ref, useSlots, useTemplateRef } from 'vue'
import { usePillNav } from '../composables/usePillNav'
import type { PillNavItem } from '../types'
import { DEFAULT_ITEMS } from './pillNavItems'

type Theme = 'dark' | 'light'
type Size = 'sm' | 'md' | 'lg'

const THEMES: Record<Theme, Record<string, string>> = {
  dark: {
    '--pn-surface': 'rgba(38, 35, 46, 0.66)', '--pn-solid': '#26232e',
    '--pn-edge': 'rgba(255, 255, 255, 0.08)', '--pn-rim': 'rgba(255, 255, 255, 0.07)',
    '--pn-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--pn-text': 'rgba(244, 244, 245, 0.64)', '--pn-strong': '#f4f4f5',
    '--pn-pill': 'linear-gradient(180deg, #ffffff 0%, #ebebf0 100%)', '--pn-pill-ink': '#121016',
    '--pn-pill-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 16px -6px rgba(0, 0, 0, 0.6)',
    '--pn-dot': '#f4f4f5', '--pn-ring': 'rgba(244, 244, 245, 0.55)',
    '--pn-row-hover': 'rgba(255, 255, 255, 0.06)',
    '--pn-tile': 'linear-gradient(180deg, #3a3644 0%, #27242f 100%)',
    '--pn-tile-rim': 'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)'
  },
  light: {
    '--pn-surface': 'rgba(240, 240, 243, 0.8)', '--pn-solid': '#f0f0f3',
    '--pn-edge': 'rgba(24, 24, 27, 0.07)', '--pn-rim': 'rgba(255, 255, 255, 0.95)',
    '--pn-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--pn-text': 'rgba(24, 24, 27, 0.6)', '--pn-strong': '#18181b',
    '--pn-pill': 'linear-gradient(180deg, #2c2c31 0%, #18181b 100%)', '--pn-pill-ink': '#ffffff',
    '--pn-pill-shadow': 'inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 6px 14px -6px rgba(24, 24, 27, 0.45)',
    '--pn-dot': '#18181b', '--pn-ring': 'rgba(24, 24, 27, 0.45)',
    '--pn-row-hover': 'rgba(24, 24, 27, 0.05)',
    '--pn-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--pn-tile-rim': 'inset 0 0 0 1px rgba(24, 24, 27, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.25)'
  }
}
const SIZES: Record<Size, Record<string, string>> = {
  sm: { '--pn-h': '36px', '--pn-pad': '3px', '--pn-inner': '30px', '--pn-x': '12px', '--pn-font': '13px', '--pn-gap': '6px', '--pn-mark': '18px' },
  md: { '--pn-h': '44px', '--pn-pad': '4px', '--pn-inner': '36px', '--pn-x': '16px', '--pn-font': '14px', '--pn-gap': '8px', '--pn-mark': '22px' },
  lg: { '--pn-h': '52px', '--pn-pad': '5px', '--pn-inner': '42px', '--pn-x': '20px', '--pn-font': '15px', '--pn-gap': '10px', '--pn-mark': '26px' }
}
const contrastInk = (color: string): string | null => {
  const hex = String(color || '').trim().replace('#', '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return null
  const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex
  const channel = (index: number) => {
    const value = Number.parseInt(full.slice(index, index + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
  return luminance > 0.36 ? '#121016' : '#ffffff'
}

interface Props {
  logo?: string
  logoAlt?: string
  logoHref?: string
  items?: PillNavItem[]
  activeHref?: string
  defaultActiveIndex?: number
  theme?: Theme
  layout?: 'split' | 'joined'
  size?: Size
  surface?: 'glass' | 'solid' | 'none'
  itemStyle?: 'pill' | 'underline'
  hoverEffect?: 'fill' | 'glide'
  indicator?: 'dot' | 'pill'
  highlightColor?: string
  highlightTextColor?: string
  barColor?: string
  textColor?: string
  bounce?: number
  stretch?: number
  intro?: boolean
  collapse?: 'auto' | 'always' | 'never'
  ariaLabel?: string
  className?: string
  style?: Record<string, string | number>
}

const props = withDefaults(defineProps<Props>(), {
  logo: undefined,
  logoAlt: 'Logo',
  logoHref: '#',
  items: () => DEFAULT_ITEMS,
  activeHref: undefined,
  defaultActiveIndex: 0,
  theme: 'dark',
  layout: 'split',
  size: 'md',
  surface: 'glass',
  itemStyle: 'pill',
  hoverEffect: 'fill',
  indicator: 'dot',
  highlightColor: undefined,
  highlightTextColor: undefined,
  barColor: undefined,
  textColor: undefined,
  bounce: 0.3,
  stretch: 0.5,
  intro: true,
  collapse: 'auto',
  ariaLabel: 'Main',
  className: '',
  style: () => ({})
})

const emit = defineEmits<{
  'item-click': [item: PillNavItem, index: number, event: Event]
  'menu-toggle': [open: boolean]
  'update:activeHref': [href: string]
}>()
const model = defineModel<string | undefined>('activeHref')
const slots = useSlots()
const selected = ref(props.defaultActiveIndex)
const activeIndex = computed(() => {
  const controlledHref = model.value ?? props.activeHref
  return controlledHref !== undefined
    ? props.items.findIndex(item => item.href === controlledHref)
    : selected.value
})
const joined = computed(() => props.layout === 'joined')
const hasLogo = computed(() => Boolean(props.logo || slots.logo))
const fill = computed(() => props.hoverEffect === 'fill')
const glide = computed(() => !fill.value && (props.hoverEffect === 'glide' || props.indicator === 'pill'))
const panelId = `pill-nav-${Math.random().toString(36).slice(2, 9)}`

const root = useTemplateRef<HTMLElement>('root')
const track = useTemplateRef<HTMLElement>('track')
const glideEl = useTemplateRef<HTMLElement>('glide')
const ink = useTemplateRef<HTMLElement>('ink')
const dot = useTemplateRef<HTMLElement>('dot')
const logoEl = useTemplateRef<HTMLElement>('logoEl')
const mark = useTemplateRef<HTMLElement>('mark')
const toggle = useTemplateRef<HTMLButtonElement>('toggle')
const panel = useTemplateRef<HTMLElement>('panel')
const measure = useTemplateRef<HTMLElement>('measure')
const measureList = useTemplateRef<HTMLElement>('measureList')
const itemEls: (HTMLElement | null)[] = []
const setItemRef = (index: number) => (el: unknown) => { itemEls[index] = (el as HTMLElement | null) ?? null }

const { collapsed, open, panelShown, engine, spin, choose, toggleMenu, selectFromPanel } = usePillNav({
  root, track, glide: glideEl, ink, dot, logo: logoEl, mark, toggle, panel, measure, measureList,
  itemEls,
  activeIndex: () => activeIndex.value,
  hoverEffect: () => props.hoverEffect,
  indicator: () => props.indicator,
  bounce: () => props.bounce,
  stretch: () => props.stretch,
  collapse: () => props.collapse,
  joined: () => joined.value,
  hasLogo: () => hasLogo.value,
  intro: () => props.intro,
  onItemClick: (item, index, event) => {
    const entry = item as PillNavItem
    emit('item-click', entry, index, event)
    if (model.value === undefined && props.activeHref === undefined) {
      selected.value = index
      if (entry.href) model.value = entry.href
    }
  },
  onMenuToggle: value => emit('menu-toggle', value)
})

const vars = computed(() => {
  const palette = THEMES[props.theme] ?? THEMES.dark
  const out: Record<string, string> = { ...palette, ...(SIZES[props.size] ?? SIZES.md) }
  if (props.surface === 'glass') out['--pn-blur'] = 'blur(20px) saturate(1.6)'
  if (props.surface === 'solid') {
    out['--pn-surface'] = palette['--pn-solid']
    out['--pn-blur'] = 'none'
  }
  if (props.surface === 'none') {
    out['--pn-surface'] = 'transparent'
    out['--pn-shadow'] = 'none'
    out['--pn-blur'] = 'none'
    out['--pn-edge'] = 'transparent'
    out['--pn-rim'] = 'transparent'
  }
  if (props.barColor) {
    out['--pn-surface'] = props.barColor
    out['--pn-solid'] = props.barColor
  }
  if (props.textColor) {
    out['--pn-strong'] = props.textColor
    out['--pn-text'] = `color-mix(in srgb, ${props.textColor} 64%, transparent)`
  }
  if (props.highlightColor) {
    out['--pn-pill'] = props.highlightColor
    out['--pn-dot'] = props.highlightColor
    out['--pn-pill-shadow'] = 'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 6px 16px -6px rgba(0, 0, 0, 0.45)'
    out['--pn-pill-ink'] = props.highlightTextColor || contrastInk(props.highlightColor) || palette['--pn-pill-ink']
  } else if (props.highlightTextColor) {
    out['--pn-pill-ink'] = props.highlightTextColor
  }
  return { ...out, ...props.style }
})
const face = (item: PillNavItem) => [item.icon, item.label]
</script>

<template>
  <nav
    ref="root"
    :class="['pill-nav', joined ? 'pill-nav__surface' : '', className].filter(Boolean)"
    :data-layout="layout"
    :data-items="itemStyle"
    :data-collapsed="collapsed ? '' : undefined"
    :data-open="open ? '' : undefined"
    :data-panel="panelShown ? '' : undefined"
    :style="vars"
    :aria-label="ariaLabel"
  >
    <span v-if="hasLogo" ref="logoEl" :class="['pill-nav__logo', joined ? '' : 'pill-nav__surface'].filter(Boolean)">
      <component
        :is="props.logoHref ? 'a' : 'span'"
        class="pill-nav__logo-link"
        :href="props.logoHref"
        :aria-label="logoAlt"
        @pointerenter="spin"
      >
        <span ref="mark" class="pill-nav__mark">
          <slot name="logo"><img v-if="props.logo" :src="props.logo" alt="" draggable="false" /></slot>
        </span>
      </component>
      <span v-if="!joined" class="pill-nav__rim" />
    </span>

    <div v-if="!collapsed" :class="['pill-nav__bar', joined ? '' : 'pill-nav__surface'].filter(Boolean)">
      <div ref="track" class="pill-nav__track" @pointerleave="engine()?.leave()">
        <ul class="pill-nav__list">
          <li
            v-for="(item, index) in items"
            :key="`${item.label}-${index}`"
            :ref="setItemRef(index)"
            class="pill-nav__slot"
            :data-on="fill && indicator === 'pill' && index === activeIndex ? '' : undefined"
            @pointerenter="engine()?.enter(index, $event)"
            @pointerdown="engine()?.press($event)"
            @focus="engine()?.focus(index, $event)"
            @blur="engine()?.blur()"
          >
            <component
              :is="item.href ? 'a' : 'button'"
              :href="item.href"
              :type="item.href ? undefined : 'button'"
              class="pill-nav__item"
              :aria-current="index === activeIndex ? 'page' : undefined"
              :aria-label="item.ariaLabel"
              @click="choose(item, index, $event)"
            >
              <span v-if="fill" class="pill-nav__fill" aria-hidden="true" />
              <span class="pill-nav__face"><component :is="item.icon" v-if="item.icon" />{{ item.label }}</span>
              <span v-if="fill" class="pill-nav__face-alt" aria-hidden="true"><component :is="item.icon" v-if="item.icon" />{{ item.label }}</span>
            </component>
          </li>
        </ul>
        <span v-if="glide" ref="glideEl" class="pill-nav__glide" aria-hidden="true" />
        <div v-if="glide" ref="ink" class="pill-nav__ink" aria-hidden="true">
          <span v-for="(item, index) in items" :key="`ink-${item.label}-${index}`" class="pill-nav__ink-item">
            <component :is="item.icon" v-if="item.icon" />{{ item.label }}
          </span>
        </div>
        <span v-if="indicator === 'dot'" ref="dot" class="pill-nav__dot" aria-hidden="true" />
      </div>
      <span v-if="!joined" class="pill-nav__rim" />
    </div>

    <button
      v-if="collapsed"
      ref="toggle"
      type="button"
      :class="['pill-nav__toggle', joined ? 'pill-nav__toggle--bare' : 'pill-nav__surface']"
      :aria-expanded="open"
      :aria-controls="panelId"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      @click="toggleMenu"
    >
      <span class="pill-nav__burger" aria-hidden="true">
        <span class="pill-nav__line pill-nav__line--top" />
        <span class="pill-nav__line pill-nav__line--bottom" />
      </span>
      <span v-if="!joined" class="pill-nav__rim" />
    </button>

    <div v-if="collapsed && panelShown" :id="panelId" ref="panel" class="pill-nav__panel pill-nav__surface">
      <ul class="pill-nav__menu">
        <li v-for="(item, index) in items" :key="`menu-${item.label}-${index}`">
          <component
            :is="item.href ? 'a' : 'button'"
            :href="item.href"
            :type="item.href ? undefined : 'button'"
            class="pill-nav__row"
            :aria-current="index === activeIndex ? 'page' : undefined"
            :tabindex="open ? undefined : -1"
            @click="selectFromPanel(item, index, $event)"
          ><component :is="item.icon" v-if="item.icon" />{{ item.label }}</component>
        </li>
      </ul>
      <span class="pill-nav__rim" />
    </div>

    <div ref="measure" class="pill-nav__measure" aria-hidden="true">
      <div ref="measureList" class="pill-nav__list">
        <span v-for="(item, index) in items" :key="`m-${item.label}-${index}`" class="pill-nav__ink-item">
          <component :is="item.icon" v-if="item.icon" />{{ item.label }}
        </span>
      </div>
    </div>

    <span v-if="joined" class="pill-nav__rim pill-nav__rim--root" />
  </nav>
</template>

<style src="./PillNav.css"></style>

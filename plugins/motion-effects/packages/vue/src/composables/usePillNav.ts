// @ts-nocheck
// PillNav 弹簧指示条引擎 + 折叠 / 菜单逻辑，逐段照搬 React 原件。
import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const readVar = (element, name) => parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0

export interface UsePillNavOptions {
  root: Ref<HTMLElement | null>
  track: Ref<HTMLElement | null>
  glide: Ref<HTMLElement | null>
  ink: Ref<HTMLElement | null>
  dot: Ref<HTMLElement | null>
  logo: Ref<HTMLElement | null>
  mark: Ref<HTMLElement | null>
  toggle: Ref<HTMLButtonElement | null>
  panel: Ref<HTMLElement | null>
  measure: Ref<HTMLElement | null>
  measureList: Ref<HTMLElement | null>
  itemEls: (HTMLElement | null)[]
  activeIndex: () => number
  hoverEffect: () => string
  indicator: () => string
  bounce: () => number
  stretch: () => number
  collapse: () => 'auto' | 'always' | 'never'
  joined: () => boolean
  hasLogo: () => boolean
  intro: () => boolean
  onItemClick?: (item: unknown, index: number, event: Event) => void
  onMenuToggle?: (open: boolean) => void
}


export function usePillNav(options: UsePillNavOptions) {
  const {
    root: rootRef, track: trackRef, glide: glideRef, ink: inkRef, dot: dotRef,
    logo: logoRef, mark: markRef, toggle: toggleRef, panel: panelRef,
    measure: measureRef, measureList: measureListRef, itemEls,
    activeIndex, hoverEffect, indicator, bounce, stretch,
    collapse, joined, hasLogo, intro: introOption, onItemClick, onMenuToggle
  } = options

  const collapsed = ref(collapse() === 'always')
  const open = ref(false)
  const panelShown = ref(false)
  let hostEngine: {
    enter: (index: number, event?: PointerEvent) => void
    leave: () => void
    focus: (index: number, event?: FocusEvent) => void
    blur: () => void
    press: (event?: PointerEvent) => void
    release: () => void
    refresh: () => void
  } | null = null
  let teardown: (() => void) | null = null
  let introPending = introOption()
  let slidePending = false
  let pendingCollapse: boolean | null = null
  const opts = () => ({ hoverEffect: hoverEffect(), indicator: indicator(), activeIndex: activeIndex(),
    bounce: clamp(bounce(), 0, 1), stretch: clamp(stretch(), 0, 1) })

  function start() {
    teardown?.()
    teardown = null
    const root = rootRef.value;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = {
      x0: 0,
      x1: 0,
      v0: 0,
      v1: 0,
      alpha: 0,
      pop: 1,
      press: 1,
      pressVelocity: 0,
      dotX: 0,
      dotVelocity: 0,
      dotAlpha: 0,
      hover: -1,
      focus: false,
      sliding: false,
      pressing: false,
      waiting: slidePending && !reduce
    };
    slidePending = false;
    const rects = [];
    let trackWidth = 0;
    let trackHeight = 0;
    let raf = 0;
    let last = 0;

    const measure = () => {
      const track = trackRef.value;
      if (!track) return;
      trackWidth = track.offsetWidth;
      trackHeight = track.offsetHeight;
      itemEls.forEach((slot, index) => {
        if (!slot) return;
        rects[index] = { left: slot.offsetLeft, width: slot.offsetWidth };
        const reach = Math.ceil(2 * Math.sqrt((slot.offsetWidth / 2) ** 2 + slot.offsetHeight ** 2)) + 2;
        slot.style.setProperty('--pn-fill', `${reach}px`);
      });
    };

    const glideIndex = () => {
      const s = opts();
      if (s.hoverEffect === 'fill') return -1;
      if (s.hoverEffect === 'glide' && state.hover >= 0) return state.hover;
      return s.indicator === 'pill' ? s.activeIndex : -1;
    };

    const sync = () => {
      const s = opts();
      itemEls.forEach((slot, index) => {
        if (!slot) return;
        const hovered = state.hover === index;
        slot.toggleAttribute('data-lit', hovered);
        slot.toggleAttribute('data-hover', hovered && s.hoverEffect === 'fill');
      });
      root.toggleAttribute('data-focus', state.focus && state.hover >= 0);
      root.toggleAttribute(
        'data-dot-lit',
        s.hoverEffect === 'fill' && state.hover >= 0 && state.hover === s.activeIndex
      );
    };

    const render = () => {
      const glideEl = glideRef.value;
      const ink = inkRef.value;
      const dot = dotRef.value;
      const width = Math.max(0, state.x1 - state.x0);
      const scale = state.press * state.pop;
      const target = rects[glideIndex()];
      const squash = target ? 1 - clamp((width / Math.max(target.width, 1) - 1) * 0.3, 0, 0.14) : 1;
      if (glideEl) {
        glideEl.style.width = `${width}px`;
        glideEl.style.transform = `translate3d(${state.x0}px, 0, 0) scale(${scale}, ${scale * squash})`;
        glideEl.style.opacity = `${state.alpha}`;
      }
      if (ink) {
        const half = (width * scale) / 2;
        const center = (state.x0 + state.x1) / 2;
        const inset = (trackHeight * (1 - scale * squash)) / 2;
        ink.style.clipPath = `inset(${inset}px ${trackWidth - center - half}px ${inset}px ${center - half}px round ${trackHeight / 2}px)`;
        ink.style.opacity = `${state.alpha}`;
      }
      if (dot) {
        const pull = clamp(Math.abs(state.dotVelocity) / 700, 0, 2.2);
        dot.style.transform = `translate3d(${state.dotX}px, 0, 0) scaleX(${1 + pull})`;
        dot.style.opacity = `${state.dotAlpha}`;
      }
    };

    const tick = now => {
      raf = 0;
      const s = opts();
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const index = glideIndex();
      const target = rects[index];
      const zeta = 1 - 0.55 * s.bounce;
      const base = 520;
      let busy = false;

      if (target && !state.waiting) {
        const t0 = target.left;
        const t1 = target.left + target.width;
        if (state.alpha < 0.02 && !state.sliding) {
          state.x0 = t0;
          state.x1 = t1;
          state.v0 = 0;
          state.v1 = 0;
          state.pop = 0.9;
        }
        if (reduce) {
          state.x0 = t0;
          state.x1 = t1;
          state.v0 = 0;
          state.v1 = 0;
        } else {
          const direction = Math.sign((t0 + t1) / 2 - (state.x0 + state.x1) / 2);
          const lead = base * (1 + 0.9 * s.stretch);
          const trail = base * (1 - 0.5 * s.stretch);
          const k0 = direction < 0 ? lead : direction > 0 ? trail : base;
          const k1 = direction > 0 ? lead : direction < 0 ? trail : base;
          const steps = Math.ceil(dt / (1 / 240));
          const h = dt / steps;
          for (let i = 0; i < steps; i++) {
            state.v0 += (-k0 * (state.x0 - t0) - 2 * zeta * Math.sqrt(k0) * state.v0) * h;
            state.x0 += state.v0 * h;
            state.v1 += (-k1 * (state.x1 - t1) - 2 * zeta * Math.sqrt(k1) * state.v1) * h;
            state.x1 += state.v1 * h;
          }
        }
        state.alpha += (1 - state.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.06));
        busy =
          Math.abs(state.x0 - t0) > 0.05 ||
          Math.abs(state.x1 - t1) > 0.05 ||
          Math.abs(state.v0) > 0.5 ||
          Math.abs(state.v1) > 0.5 ||
          state.alpha < 0.999;
        if (!busy) state.sliding = false;
      } else {
        state.alpha += (0 - state.alpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.07));
        if (state.alpha > 0.002) busy = true;
        else state.alpha = 0;
      }

      state.pop += (1 - state.pop) * (reduce ? 1 : 1 - Math.exp(-dt / 0.09));
      if (Math.abs(1 - state.pop) > 0.001) busy = true;

      const pressTarget = state.pressing ? 0.95 : 1;
      if (reduce) {
        state.press = pressTarget;
        state.pressVelocity = 0;
      } else {
        state.pressVelocity += (-700 * (state.press - pressTarget) - 30 * state.pressVelocity) * dt;
        state.press += state.pressVelocity * dt;
      }
      if (Math.abs(state.press - pressTarget) > 0.0005 || Math.abs(state.pressVelocity) > 0.01) busy = true;

      const dotTarget = s.indicator === 'dot' ? rects[s.activeIndex] : null;
      if (dotTarget && !state.waiting) {
        const center = dotTarget.left + dotTarget.width / 2;
        if (state.dotAlpha < 0.02) {
          state.dotX = center;
          state.dotVelocity = 0;
        }
        if (reduce) {
          state.dotX = center;
          state.dotVelocity = 0;
        } else {
          const k = 360;
          const steps = Math.ceil(dt / (1 / 240));
          const h = dt / steps;
          for (let i = 0; i < steps; i++) {
            state.dotVelocity +=
              (-k * (state.dotX - center) - 2 * (1 - 0.5 * s.bounce) * Math.sqrt(k) * state.dotVelocity) * h;
            state.dotX += state.dotVelocity * h;
          }
        }
        state.dotAlpha += (1 - state.dotAlpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.1));
        if (Math.abs(state.dotX - center) > 0.05 || Math.abs(state.dotVelocity) > 0.5 || state.dotAlpha < 0.999)
          busy = true;
      } else {
        state.dotAlpha += (0 - state.dotAlpha) * (reduce ? 1 : 1 - Math.exp(-dt / 0.1));
        if (state.dotAlpha > 0.002) busy = true;
        else state.dotAlpha = 0;
      }

      render();
      if (busy) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const engine = {
      enter: (index, event) => {
        if (event?.pointerType === 'touch') return;
        state.hover = index;
        state.focus = false;
        sync();
        wake();
      },
      leave: () => {
        if (state.focus) return;
        state.hover = -1;
        sync();
        wake();
      },
      focus: (index, event) => {
        const target = event?.target;
        const visible = target instanceof Element && target.matches(':focus-visible');
        state.focus = visible;
        state.hover = visible ? index : state.hover;
        sync();
        wake();
      },
      blur: () => {
        if (!state.focus) return;
        state.focus = false;
        state.hover = -1;
        sync();
        wake();
      },
      press: event => {
        if (event && event.button > 0) return;
        state.pressing = true;
        wake();
      },
      release: () => {
        if (!state.pressing) return;
        state.pressing = false;
        wake();
      },
      refresh: () => {
        measure();
        sync();
        wake();
      }
    };
    hostEngine = engine;

    measure();
    sync();
    render();
    wake();

    let timer = 0;
    if (state.waiting) {
      state.x0 = 0;
      state.x1 = 0;
      timer = window.setTimeout(() => {
        state.waiting = false;
        if (glideIndex() >= 0) {
          state.alpha = 1;
          state.sliding = true;
        }
        wake();
      }, 420);
    }

    const resizeObserver = new ResizeObserver(() => {
      measure();
      render();
      wake();
    });
    if (trackRef.value) resizeObserver.observe(trackRef.value);
    document.fonts?.ready?.then(() => engine.refresh()).catch(() => {});
    window.addEventListener('pointerup', engine.release);
    window.addEventListener('pointercancel', engine.release);

    teardown = () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('pointerup', engine.release);
      window.removeEventListener('pointercancel', engine.release);
      hostEngine = null;
    };
  }

  onMounted(() => {
    start()
    evaluateCollapse()
  })
  watch([collapsed, () => options.itemEls.length], start, { flush: 'post' })
  watch([activeIndex, hoverEffect, indicator, bounce, stretch], () => hostEngine?.refresh(), { flush: 'post' })

  function evaluateCollapse() {
    const root = rootRef.value
    const measureEl = measureRef.value
    if (!root || !measureEl) return
    if (collapse() === 'always' || collapse() === 'never') {
      collapsed.value = collapse() === 'always'
      return
    }
    const parent = root.parentElement
    if (!parent) return
    const styles = getComputedStyle(parent)
    const available = parent.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0)
    const listWidth = measureListRef.value?.offsetWidth ?? 0
    const height = readVar(root, '--pn-h')
    const pad = readVar(root, '--pn-pad')
    const gap = readVar(root, '--pn-gap')
    const inner = readVar(root, '--pn-inner')
    const need = joined()
      ? pad * 2 + (hasLogo() ? inner + 2 : 0) + listWidth
      : (hasLogo() ? height + gap : 0) + listWidth + pad * 2
    const next = need > available + 0.5
    if (introPending && next !== collapsed.value) pendingCollapse = next
    collapsed.value = next
  }
  const collapseObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(evaluateCollapse) : null
  watch([collapse, joined, hasLogo, () => options.itemEls.length], () => {
    collapseObserver?.disconnect()
    const root = rootRef.value
    if (root?.parentElement) collapseObserver?.observe(root.parentElement)
    if (measureRef.value) collapseObserver?.observe(measureRef.value)
    evaluateCollapse()
  }, { immediate: true, flush: 'post' })

  function introAnimate() {
    const root = rootRef.value
    if (!root || !introPending) return
    if (pendingCollapse !== null && pendingCollapse !== collapsed.value) return
    pendingCollapse = null
    introPending = false
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const pop = (element, delay) => element?.animate?.([
      { opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }
    ], { duration: 700, delay, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'backwards' })
    const reveal = element => {
      if (!element?.animate) return
      const width = element.offsetWidth
      const height = element.offsetHeight
      element.animate([
        { clipPath: `inset(0px ${Math.max(0, width - height)}px 0px 0px round ${height / 2}px)` },
        { clipPath: `inset(0px 0px 0px 0px round ${height / 2}px)` }
      ], { duration: 760, delay: 90, easing: EASE_OUT, fill: 'backwards' })
    }
    pop(logoRef.value, 0)
    if (collapsed.value) {
      pop(toggleRef.value, 120)
      return
    }
    slidePending = true
    reveal(joined() ? root : document.querySelector('.pill-nav__bar'))
    itemEls.forEach((slot, index) => slot?.animate?.([
      { opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 560, delay: 200 + index * 50, easing: EASE_OUT, fill: 'backwards' }))
  }
  watch(collapsed, () => { introAnimate(); if (!collapsed.value && open.value) open.value = false }, { flush: 'post' })
  onMounted(introAnimate)

  watch(open, active => {
    if (active) panelShown.value = true
  })
  watch([open, panelShown], () => {
    const panel = panelRef.value
    const root = rootRef.value
    if (!panel || !root) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (!panel.animate) {
      if (!open.value) panelShown.value = false
      return
    }
    const width = panel.offsetWidth
    const height = panel.offsetHeight
    const header = joined() ? root.offsetHeight : (toggleRef.value?.offsetHeight ?? 44)
    const startClip = joined()
      ? `inset(0px 0px ${Math.max(0, height - header)}px 0px round ${header / 2}px)`
      : `inset(0px 0px ${Math.max(0, height - header)}px ${Math.max(0, width - header)}px round ${header / 2}px)`
    const endClip = 'inset(0px 0px 0px 0px round 24px)'
    const rows = panel.querySelectorAll('li')
    const running = []
    if (open.value) {
      if (reduce) return
      running.push(panel.animate([{ clipPath: startClip }, { clipPath: endClip }], { duration: 560, easing: EASE_OUT }))
      rows.forEach((row, index) => running.push(row.animate([
        { opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 420, delay: 90 + index * 40, easing: EASE_OUT, fill: 'backwards' })))
    } else {
      if (reduce) { panelShown.value = false; return }
      const morph = panel.animate([{ clipPath: endClip }, { clipPath: startClip }], {
        duration: 380, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards'
      })
      morph.onfinish = () => { panelShown.value = false }
      running.push(morph)
      rows.forEach(row => running.push(row.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' })))
    }
    return () => running.forEach(a => { a.onfinish = null; a.cancel() })
  }, { flush: 'post' })

  let outsideCleanup: (() => void) | null = null
  watch(open, active => {
    outsideCleanup?.()
    outsideCleanup = null
    if (!active) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && rootRef.value?.contains(target)) return
      open.value = false
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      open.value = false
      toggleRef.value?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    outsideCleanup = () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  })

  const spin = (event: PointerEvent) => {
    const mark = markRef.value
    if (!mark || event.pointerType === 'touch' || mark.getAnimations?.().length) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    mark.animate?.([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], {
      duration: 900, easing: 'cubic-bezier(0.65, 0, 0.25, 1)'
    })
  }
  const choose = (item, index, event) => {
    onItemClick?.(item, index, event)
  }
  const toggleMenu = () => {
    const next = !open.value
    if (next) panelShown.value = true
    open.value = next
    onMenuToggle?.(next)
  }
  const selectFromPanel = (item, index, event) => {
    choose(item, index, event)
    open.value = false
    onMenuToggle?.(false)
  }

  onBeforeUnmount(() => {
    teardown?.()
    collapseObserver?.disconnect()
    outsideCleanup?.()
  })

  return { collapsed, open, panelShown, slidePending, spin, choose, toggleMenu, selectFromPanel, engine: () => hostEngine }
}

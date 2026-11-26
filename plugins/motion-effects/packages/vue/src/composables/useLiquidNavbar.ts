import { onBeforeUnmount, onMounted, shallowRef, type ShallowRef } from 'vue'
import type { LiquidNavbarFx } from '../types'

/**
 * LiquidNavbar 的水体引擎：两段弹簧驱动的水团、离心飞出的小水珠、点击波纹与鼠标来弯，
 * 由一片很小的 WebGL 着色器画在导航条里；没有 WebGL 时由组件里的 CSS 水滴接管。
 * 物理、着色器与时间常量与 React 原件一一对应，只替换框架胶水。
 * 逐帧状态放在普通对象里，不走响应式（vue-porting §4.1）。
 */

/** 画布在导航条四周留出的出血，给阴影和波纹用 */
export const NAVBAR_PAD = 14
const PAD = NAVBAR_PAD

/* ---------- the water shader ---------- */
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `precision highp float;
uniform vec2 uRes;uniform float uDpr;uniform float uTime;uniform vec4 uPill;
uniform vec4 uBlob[6];uniform float uSy[6];uniform vec4 uRip[6];uniform vec3 uMouse;uniform float uDark;uniform float uAmb;
float sdRB(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float sdCap(vec2 p,vec4 B,float sy){p-=B.xy;p.y/=sy;p.x=max(abs(p.x)-B.z,0.);return(length(p)-B.w)*min(1.,sy);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float dropD(vec2 p){float d=1e4;for(int i=0;i<6;i++){if(uBlob[i].w>.5){d=smin(d,sdCap(p,uBlob[i],uSy[i]),13.);}}return d;}
float pillD(vec2 p){vec2 h=uPill.zw*.5;return sdRB(p-uPill.xy-h,h,h.y);}
float lens(float d,float w){float t=clamp(-d/w,0.,1.);return sqrt(1.-(1.-t)*(1.-t));}
float waves(vec2 p){float w=0.;
 for(int i=0;i<6;i++){vec4 R=uRip[i];if(R.w>0.){float x=length(p-R.xy)-R.z*240.;w+=R.w*exp(-R.z*1.7)*sin(x*.3)*exp(-x*x/700.);}}
 vec2 m=p-uMouse.xy;w+=uMouse.z*3.6*exp(-dot(m,m)/1000.);
 w+=uAmb*(sin(p.x*.05+uTime*1.2)*.45+sin(p.x*.13-uTime*.85+p.y*.2)*.25);return w;}
float H(vec2 p){float dp=pillD(p);return lens(dp,uPill.w*.36)*2.4+lens(dropD(p),11.)*7.5+waves(p)*smoothstep(0.,7.,-dp);}
float caus(vec2 p,float t){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.1+t),cos(q.x*1.3-t*.7))*.6;c+=1./(1.+16.*abs(sin(q.x)*sin(q.y)));}return c/3.;}
void main(){
 vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 float dp=pillD(p);float dd=dropD(p);
 float h0=H(p);vec3 n=normalize(vec3(h0-H(p+vec2(1.,0.)),h0-H(p+vec2(0.,1.)),1.));
 vec3 V=vec3(0.,0.,1.);
 float spec=pow(max(dot(reflect(-normalize(vec3(-.45,-.8,.85)),n),V),0.),70.);
 float spec2=pow(max(dot(reflect(-normalize(vec3(.6,.75,.7)),n),V),0.),22.)*.3;
 float fres=clamp((1.-n.z)*4.,0.,1.);
 vec3 irid=.5+.5*cos(6.2831*(vec3(0.,.33,.67)+fres*.85+p.x*.0028+uTime*.035));
 float pm=smoothstep(1.,-1.,dp);float dm=smoothstep(1.,-1.,dd)*smoothstep(1.,-2.,dp);
 float sh=smoothstep(9.,-9.,dropD(p-vec2(0.,5.)))*(1.-dm)*pm*(.11+.07*uDark);
 vec3 c=vec3(0.,.14,.36)*sh;float a=sh;
 float pa=clamp(pm*(fres*.5+spec*.9+spec2),0.,1.);
 c=mix(vec3(1.),irid,.5*fres)*pa+c*(1.-pa);a=pa+a*(1.-pa);
 float th=lens(dd,11.);
 float cs=caus((p+n.xy*th*18.)*.085,uTime*.9);
 vec3 tint=mix(vec3(.80,.95,1.),vec3(.55,.82,1.),uDark);
 float rim=dm*(1.-smoothstep(0.,8.,-dd));
 float cres=dm*smoothstep(.12,.55,dot(n.xy,normalize(vec2(.55,.85))))*smoothstep(0.,3.,-dd);
 float body=.5+.5*clamp(-n.y*3.,-1.,1.);
 float da=dm*(.26+.14*body)*(1.-.35*uDark);vec3 dc=mix(tint,vec3(1.),body*.6);
 float la=rim*.22;vec3 lc=mix(vec3(0.,.42,.78),vec3(.1,.55,.95),uDark);dc=lc*la+dc*da*(1.-la);da=la+da*(1.-la);
 la=clamp(cres*.7+smoothstep(.6,1.,cs)*.28*th*dm,0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=clamp(dm*(spec*1.2+spec2*.5),0.,1.);dc=vec3(1.)*la+dc*(1.-la);da=la+da*(1.-la);
 la=dm*smoothstep(-2.,0.,dd)*.4;dc=mix(vec3(1.),irid,.35)*la+dc*(1.-la);da=la+da*(1.-la);
 c=dc+c*(1.-da);a=da+a*(1.-da);
 gl_FragColor=vec4(c,a);
}`

type Body = { x: number; v: number }
type Sat = { x: number; y: number; vx: number; vy: number; r: number; k: number }
type Rip = { x: number; y: number; age: number; amp: number }

interface GlContext {
  gl: WebGLRenderingContext
  u: Record<string, WebGLUniformLocation | null>
}

interface NavbarState {
  a: Body
  b: Body
  sy: { s: number; v: number }
  lead: 0 | 1
  lagFrom: number
  sats: Sat[]
  rips: Rip[]
  t: { x: number; cy: number; q: number; r: number }
  q: number
  mouse: { x: number; y: number; s: number; on: boolean }
  moving: boolean
  split: boolean
  ready: boolean
  w: number
  h: number
  visible: boolean
  reduce: boolean
  raf: number
  last: number
  time: number
  glc: GlContext | null
}

function makeState(): NavbarState {
  return {
    a: { x: 0, v: 0 },
    b: { x: 0, v: 0 },
    sy: { s: 1, v: 0 },
    lead: 0,
    lagFrom: 0,
    sats: [],
    rips: [],
    t: { x: 0, cy: 0, q: 0, r: 21 },
    q: 0,
    mouse: { x: 0, y: 0, s: 0, on: false },
    moving: false,
    split: false,
    ready: false,
    w: 0,
    h: 0,
    visible: true,
    reduce: false,
    raf: 0,
    last: 0,
    time: 0,
    glc: null
  }
}

function initGL(canvas: HTMLCanvasElement): GlContext | null {
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: true,
    alpha: true,
    antialias: false
  }) as WebGLRenderingContext | null
  if (!gl) return null
  const sh = (type: number, src: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
  }
  const vs = sh(gl.VERTEX_SHADER, VERT)
  const fs = sh(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const attribute = gl.getAttribLocation(program, 'a')
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
  const u: Record<string, WebGLUniformLocation | null> = {}
  for (const name of ['uRes', 'uDpr', 'uTime', 'uPill', 'uBlob', 'uSy', 'uRip', 'uMouse', 'uDark', 'uAmb']) {
    u[name] = gl.getUniformLocation(program, name)
  }
  return { gl, u }
}

/** 用 SVG 滤镜做 backdrop 折射目前只有 Chromium 支持 */
function supportsRefraction() {
  if (typeof window === 'undefined' || typeof CSS === 'undefined') return false
  const ua = navigator.userAgent
  return (
    /Chrome\/|Chromium\/|Edg\//.test(ua) &&
    !/Firefox\//.test(ua) &&
    !!CSS.supports?.('backdrop-filter', 'url(#a)')
  )
}

export interface UseLiquidNavbarOptions {
  nav: Readonly<ShallowRef<HTMLElement | null>>
  canvas: Readonly<ShallowRef<HTMLCanvasElement | null>>
  drop: Readonly<ShallowRef<HTMLElement | null>>
  itemEls: (HTMLElement | null)[]
  iconEls: (HTMLElement | null)[]
  /** 当前项的下标；受控与否由组件决定，这里只惰性读取 */
  current: () => number
  dark: () => boolean
  sound: () => boolean
}

export function useLiquidNavbar(options: UseLiquidNavbarOptions) {
  const s = makeState()
  /** WebGL 水体是否在画；off 时由 CSS 水滴接管 */
  const gl = shallowRef<'on' | 'off'>('on')
  const refract = shallowRef(false)

  let audio: AudioContext | null = null
  let canvas: HTMLCanvasElement | null = null
  let resizeObserver: ResizeObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let dropTimer: ReturnType<typeof setTimeout> | undefined

  /* ---- drawing ---- */
  function draw() {
    const T = s.t
    const sep = Math.abs(s.a.x - s.b.x)
    const thin = Math.min(sep / (2 * (s.q + T.r) || 1), 1)
    const r = T.r * (1 - 0.3 * thin)
    if (s.glc) {
      const { gl: g, u } = s.glc
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight)
      g.uniform2f(u.uRes, s.w + PAD * 2, s.h + PAD * 2)
      g.uniform1f(u.uDpr, dpr)
      g.uniform1f(u.uTime, s.time)
      g.uniform4f(u.uPill, PAD, PAD, s.w, s.h)
      const blobs = new Float32Array(24)
      const sy = new Float32Array(6).fill(1)
      const head = s.lead === 0 ? s.a : s.b
      const tail = s.lead === 0 ? s.b : s.a
      blobs.set(
        [
          head.x, T.cy, s.q * (1 - 0.25 * thin), T.r * (1 - 0.12 * thin),
          tail.x, T.cy, s.q * (1 - 0.8 * thin), T.r * (1 - 0.5 * thin)
        ],
        0
      )
      sy[0] = sy[1] = s.sy.s
      s.sats.slice(0, 4).forEach((d, i) => blobs.set([d.x, d.y, 0, d.r], 8 + i * 4))
      g.uniform4fv(u.uBlob, blobs)
      g.uniform1fv(u.uSy, sy)
      const rips = new Float32Array(24)
      s.rips.slice(-6).forEach((p, i) => rips.set([p.x, p.y, p.age, p.amp], i * 4))
      g.uniform4fv(u.uRip, rips)
      g.uniform3f(u.uMouse, s.mouse.x, s.mouse.y, s.mouse.s)
      g.uniform1f(u.uDark, options.dark() ? 1 : 0)
      g.uniform1f(u.uAmb, s.reduce ? 0 : 1)
      g.clearColor(0, 0, 0, 0)
      g.clear(g.COLOR_BUFFER_BIT)
      g.drawArrays(g.TRIANGLES, 0, 3)
    } else if (options.drop.value) {
      const left = Math.min(s.a.x, s.b.x) - s.q - r - PAD
      const width = sep + 2 * (s.q + r)
      options.drop.value.style.width = `${width}px`
      options.drop.value.style.transform = `translateX(${left}px) scaleY(${s.sy.s})`
    }
  }

  /* ---- physics ---- */
  function step(dt: number, now: number) {
    const T = s.t
    s.time += dt
    s.q += (T.q - s.q) * Math.min(1, dt * 12)
    const bodies = [s.a, s.b]
    let still = true
    if (s.reduce) {
      s.a.x = s.b.x = T.x
      s.a.v = s.b.v = 0
      s.sy.s = 1
      s.sats = []
    } else {
      bodies.forEach((B, i) => {
        const lead = i === s.lead
        const k = lead ? 210 : 72
        const c = lead ? 25 : 13
        const f = !lead && now < s.lagFrom ? 0.08 : 1
        B.v += (k * (T.x - B.x) - c * B.v) * dt * f
        B.x += B.v * dt
        const lo = PAD + 6 + s.q + T.r - 3
        const hi = PAD + s.w - 6 - s.q - T.r + 3
        if (B.x < lo || B.x > hi) {
          s.sy.v -= Math.min(Math.abs(B.v), 900) * 0.0016
          B.x = Math.max(lo, Math.min(hi, B.x))
          B.v *= -0.25
        }
        if (Math.abs(T.x - B.x) > 0.3 || Math.abs(B.v) > 3) still = false
      })
      const L = bodies[s.lead]
      const syT = 1 - 0.2 * Math.min(Math.abs(L.v) / 1500, 1)
      s.sy.v += (280 * (syT - s.sy.s) - 9 * s.sy.v) * dt
      s.sy.s += s.sy.v * dt
      if (Math.abs(s.sy.s - 1) > 0.002 || Math.abs(s.sy.v) > 0.02) still = false
      // break the neck: spawn droplets between head and tail
      const sep = Math.abs(s.a.x - s.b.x)
      const r = T.r * (1 - 0.3 * Math.min(sep / (2 * (T.q + T.r) || 1), 1))
      if (!s.split && s.moving && sep - 2 * T.q - 2 * r > -6) {
        s.split = true
        const lo = bodies[1 - s.lead]
        const hi = bodies[s.lead]
        ;[0.3, 0.5, 0.72].forEach((t, j) => {
          s.sats.push({
            x: lo.x + (hi.x - lo.x) * t + (Math.random() - 0.5) * 6,
            y: T.cy + (Math.random() - 0.5) * 10,
            vx: (lo.v + hi.v) * 0.45,
            vy: (Math.random() - 0.5) * 60,
            r: 5 + Math.random() * 3 - j * 0.5,
            k: 70 + Math.random() * 90
          })
        })
      }
      s.sats = s.sats.filter(d => {
        d.vx += (d.k * (T.x - d.x) - 9 * d.vx) * dt
        d.vy += (90 * (T.cy - d.y) - 7 * d.vy) * dt
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.x = Math.max(PAD + 8 + d.r, Math.min(PAD + s.w - 8 - d.r, d.x))
        d.y = Math.max(T.cy - T.r + d.r, Math.min(T.cy + T.r - d.r, d.y))
        if (Math.abs(T.x - d.x) < T.q + T.r * 0.5) d.r -= dt * 26
        return d.r > 0.6
      })
      if (s.sats.length) still = false
    }
    if (s.moving && still) {
      s.moving = false
      if (s.split || !s.reduce) s.rips.push({ x: T.x, y: T.cy, age: 0, amp: s.split ? 1.2 : 0.7 })
    }
    s.rips.forEach(p => (p.age += dt))
    s.rips = s.rips.filter(p => p.age < 2.4)
    const target = s.mouse.on ? 1 : 0
    s.mouse.s += (target - s.mouse.s) * Math.min(1, dt * 7)
  }

  function loop() {
    if (s.raf) return
    s.last = performance.now()
    const tick = () => {
      // 帧时间统一取 performance.now()：last 与 lagFrom 也是它记的。rAF 回调的时间戳在部分宿主里
      // 不是同一个时钟，混用会算出负的 dt，弹簧直接发散（真实浏览器里两者一致，行为不变）
      const now = performance.now()
      const dt = Math.max(0, Math.min((now - s.last) / 1000, 1 / 30))
      s.last = now
      step(dt, now)
      draw()
      // 来弯用"是否还在过渡"判断，而不是"是否抬着"：抬着不动时画面不变，不需要继续画。
      // 上游用的是后者，reduced-motion 下只要指针停在导航条上就一直空转
      const meniscusMoving = s.mouse.on ? 1 - s.mouse.s > 0.01 : s.mouse.s > 0.01
      const busy = s.moving || s.rips.length > 0 || s.sats.length > 0 || meniscusMoving
      // ambient water keeps moving while visible; reduced-motion only animates on change
      if (s.visible && (!s.reduce || busy)) s.raf = requestAnimationFrame(tick)
      else s.raf = 0
    }
    s.raf = requestAnimationFrame(tick)
  }

  /* ---- layout ---- */
  function measure() {
    const nav = options.nav.value
    const el = options.itemEls[options.current()]
    if (!nav || !el) return
    s.w = nav.offsetWidth
    s.h = nav.offsetHeight
    const T = s.t
    T.r = el.offsetHeight / 2
    T.q = Math.max(0, el.offsetWidth / 2 - T.r)
    T.cy = PAD + el.offsetTop + el.offsetHeight / 2
    const nx = PAD + el.offsetLeft + el.offsetWidth / 2
    if (!s.ready) {
      s.a.x = s.b.x = nx
      s.q = T.q
      s.ready = true
    } else if (Math.abs(nx - T.x) > 0.5) {
      s.lead = Math.abs(nx - s.a.x) <= Math.abs(nx - s.b.x) ? 0 : 1
      s.lagFrom = performance.now() + 70
      s.moving = true
      s.split = false
    }
    T.x = nx
    if (canvas) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const W = s.w + PAD * 2
      const H = s.h + PAD * 2
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr)
        canvas.height = Math.round(H * dpr)
        canvas.style.width = `${W}px`
        canvas.style.height = `${H}px`
      }
    }
    loop()
  }

  /* ---- interaction ---- */
  function local(clientX: number, clientY: number) {
    const rect = options.nav.value?.getBoundingClientRect()
    return { x: clientX - (rect?.left ?? 0) + PAD, y: clientY - (rect?.top ?? 0) + PAD }
  }

  function ripple(x: number, y: number, amp: number) {
    if (s.reduce) return
    s.rips.push({ x, y, age: 0, amp })
    loop()
  }

  function iconCenter(i: number) {
    const el = options.iconEls[i]
    if (!el) return null
    const b = el.getBoundingClientRect()
    return local(b.left + b.width / 2, b.top + b.height / 2)
  }

  /** 合成的"叮"一声：一个正弦振荡器从 420Hz 左右滑到 1500Hz，不加载任何音频文件 */
  function plip() {
    if (!options.sound()) return
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      const ctx = (audio ||= new AC!())
      const t = ctx.currentTime
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.setValueAtTime(420 + Math.random() * 80, t)
      o.frequency.exponentialRampToValueAtTime(1500, t + 0.07)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(g).connect(ctx.destination)
      o.start(t)
      o.stop(t + 0.18)
    } catch {
      /* 没有 AudioContext（或被浏览器拒绝）：静默 */
    }
  }

  function pointerMove(clientX: number, clientY: number) {
    const p = local(clientX, clientY)
    s.mouse.x = p.x
    s.mouse.y = p.y
    s.mouse.on = true
    loop()
  }

  function pointerLeave() {
    s.mouse.on = false
    loop()
  }

  function pointerDown(clientX: number, clientY: number) {
    const p = local(clientX, clientY)
    ripple(p.x, p.y, 0.8)
  }

  /** 点击条目时的反馈：一声水滴；drop / plane 两种图标动画各带一圈波纹 */
  function play(i: number, kind: LiquidNavbarFx) {
    plip()
    const c = iconCenter(i)
    if (c && kind === 'drop') {
      // 水滴图标要先落到底，再溅起波纹
      clearTimeout(dropTimer)
      dropTimer = setTimeout(() => ripple(c.x, s.t.cy, 1.4), 430)
    }
    if (c && kind === 'plane') ripple(c.x, c.y, 0.6)
  }

  /* ---- lifecycle ---- */
  const onContextLost = (event: Event) => {
    event.preventDefault()
    s.glc = null
    gl.value = 'off'
  }
  // preventDefault 之后浏览器会恢复上下文，但恢复后的上下文里没有任何资源，要重新建一遍
  const onContextRestored = () => {
    s.glc = canvas ? initGL(canvas) : null
    gl.value = s.glc ? 'on' : 'off'
    loop()
  }
  const onVisibility = () => {
    s.visible = document.visibilityState === 'visible'
    if (s.visible) loop()
  }

  onMounted(() => {
    refract.value = supportsRefraction()
    s.reduce = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    canvas = options.canvas.value
    s.glc = canvas ? initGL(canvas) : null
    if (!s.glc) gl.value = 'off'
    canvas?.addEventListener('webglcontextlost', onContextLost)
    canvas?.addEventListener('webglcontextrestored', onContextRestored)

    if (options.nav.value && 'IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(([entry]) => {
        s.visible = entry.isIntersecting
        if (s.visible) loop()
      })
      intersectionObserver.observe(options.nav.value)
    }
    document.addEventListener('visibilitychange', onVisibility)

    if (options.nav.value && 'ResizeObserver' in window) {
      let lastW = -1
      resizeObserver = new ResizeObserver(() => {
        const w = options.nav.value?.offsetWidth ?? 0
        if (w !== lastW) {
          lastW = w
          s.ready = false
          measure()
        }
      })
      resizeObserver.observe(options.nav.value)
    }

    measure()
  })

  onBeforeUnmount(() => {
    canvas?.removeEventListener('webglcontextlost', onContextLost)
    canvas?.removeEventListener('webglcontextrestored', onContextRestored)
    intersectionObserver?.disconnect()
    resizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', onVisibility)
    cancelAnimationFrame(s.raf)
    s.raf = 0
    clearTimeout(dropTimer)
    // 上游卸载时不关音频上下文，这里关掉，免得卸载后还占着一路音频
    void audio?.close().catch(() => {})
    audio = null
    canvas = null
    s.glc = null
  })

  return { gl, refract, measure, pointerMove, pointerLeave, pointerDown, play }
}

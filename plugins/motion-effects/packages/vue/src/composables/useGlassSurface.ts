import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { GlassBackdrop, GlassSurfaceChannel, GlassSurfaceRenderer, GlassSurfaceSettings } from '../types'

/* ------------------------------------------------------------------ *
 * 纯计算层：GLSL / 距离场 / 模糊 / 形状描摹，逐段照搬 React 原件。
 * ------------------------------------------------------------------ */

const FAR = 1e20

const GLASS_VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const GLASS_FRAGMENT = `#version 300 es
precision highp float;
uniform sampler2D uBackdrop;
uniform sampler2D uMap;
uniform vec2 uCanvas;
uniform vec2 uSize;
uniform vec2 uOrigin;
uniform vec2 uStep;
uniform vec3 uScale;
uniform ivec2 uChannel;
uniform float uSpread;
uniform float uLod;
uniform float uSaturation;
out vec4 outColor;

vec4 bend(vec2 p) {
  vec4 map = texture(uMap, clamp(p / uSize, 0.0, 1.0));
  vec2 shift = vec2(map[uChannel.x], map[uChannel.y]) - 0.5;
  vec2 base = uOrigin + p * uStep;
  vec4 red = textureLod(uBackdrop, base + shift * uScale.r * uStep, uLod);
  vec4 green = textureLod(uBackdrop, base + shift * uScale.g * uStep, uLod);
  vec4 blue = textureLod(uBackdrop, base + shift * uScale.b * uStep, uLod);
  return vec4(red.r, green.g, blue.b, (red.a + green.a + blue.a) / 3.0);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y) / uCanvas * uSize;
  vec4 color = vec4(0.0);
  if (uSpread < 0.05) {
    color = bend(p);
  } else {
    float total = 0.0;
    for (int j = -2; j <= 2; j++) {
      for (int i = -2; i <= 2; i++) {
        vec2 offset = vec2(float(i), float(j)) * uSpread * 0.8;
        float weight = exp(-dot(offset, offset) / (2.0 * uSpread * uSpread));
        color += bend(p + offset) * weight;
        total += weight;
      }
    }
    color /= total;
  }
  vec3 rgb = color.a > 0.0 ? color.rgb / color.a : vec3(0.0);
  float s = uSaturation;
  mat3 tone = mat3(
    0.213 + 0.787 * s, 0.213 - 0.213 * s, 0.213 - 0.213 * s,
    0.715 - 0.715 * s, 0.715 + 0.285 * s, 0.715 - 0.715 * s,
    0.072 - 0.072 * s, 0.072 - 0.072 * s, 0.072 + 0.928 * s
  );
  rgb = clamp(tone * rgb, 0.0, 1.0);
  outColor = vec4(rgb * color.a, color.a);
}`

const CHANNELS: Record<GlassSurfaceChannel, number> = { R: 0, G: 1, B: 2, A: 3 }

type AnyNode = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement

const compileGlass = (gl: WebGL2RenderingContext): WebGLProgram | null => {
  const make = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
    gl.deleteShader(shader)
    return null
  }
  const vertex = make(gl.VERTEX_SHADER, GLASS_VERTEX)
  const fragment = make(gl.FRAGMENT_SHADER, GLASS_FRAGMENT)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.bindAttribLocation(program, 0, 'aPosition')
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program
  gl.deleteProgram(program)
  return null
}

/** React 收的是 ref 对象或 DOM；Vue 再兼容 Ref（.value），模板里通常传进来的就是 DOM。 */
export function resolveBackdrop(backdrop: GlassBackdrop): AnyNode | null {
  if (typeof window === 'undefined' || !backdrop) return null
  const node = typeof backdrop === 'object' && !('tagName' in backdrop)
    ? ('value' in backdrop ? backdrop.value : 'current' in backdrop ? backdrop.current : backdrop)
    : backdrop
  if (
    node instanceof HTMLImageElement ||
    node instanceof HTMLVideoElement ||
    node instanceof HTMLCanvasElement
  ) {
    return node
  }
  return null
}

const sourceSize = (node: AnyNode): [number, number] => {
  if (node instanceof HTMLImageElement) return [node.naturalWidth, node.naturalHeight]
  if (node instanceof HTMLVideoElement) return [node.videoWidth, node.videoHeight]
  return [node.width, node.height]
}

const placeAxis = (value: string | undefined, free: number): number => {
  if (!value) return free / 2
  if (value.endsWith('%')) return (parseFloat(value) / 100) * free
  const px = parseFloat(value)
  return Number.isFinite(px) ? px : free / 2
}

const contentBox = (node: AnyNode) => {
  const rect = node.getBoundingClientRect()
  const [naturalWidth, naturalHeight] = sourceSize(node)
  const style = getComputedStyle(node)
  const fit = style.objectFit || 'fill'
  if (!naturalWidth || !naturalHeight || fit === 'fill') {
    return { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
  }
  const contain = Math.min(rect.width / naturalWidth, rect.height / naturalHeight)
  const cover = Math.max(rect.width / naturalWidth, rect.height / naturalHeight)
  const scale = fit === 'cover' ? cover : fit === 'contain' ? contain : fit === 'none' ? 1 : Math.min(1, contain)
  const width = naturalWidth * scale
  const height = naturalHeight * scale
  const [px, py] = (style.objectPosition || '50% 50%').split(' ')
  return {
    x: rect.left + placeAxis(px, rect.width - width),
    y: rect.top + placeAxis(py ?? px, rect.height - height),
    width,
    height
  }
}

const distanceLine = (f: Float64Array, d: Float64Array, v: Int32Array, z: Float64Array, n: number) => {
  let k = 0
  v[0] = 0
  z[0] = -FAR
  z[1] = FAR
  for (let q = 1; q < n; q++) {
    let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    while (s <= z[k]) {
      k--
      s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    }
    k++
    v[k] = q
    z[k] = s
    z[k + 1] = FAR
  }
  k = 0
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++
    d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]
  }
}

const distanceGrid = (grid: Float32Array | Float64Array, w: number, h: number) => {
  const n = Math.max(w, h)
  const f = new Float64Array(n)
  const d = new Float64Array(n)
  const v = new Int32Array(n)
  const z = new Float64Array(n + 1)
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x]
    distanceLine(f, d, v, z, h)
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y]
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x]
    distanceLine(f, d, v, z, w)
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x]
  }
}

const blurLine = (src: Float32Array, dst: Float32Array, offset: number, stride: number, n: number, r: number) => {
  const scale = 1 / (2 * r + 1)
  let sum = src[offset] * (r + 1)
  for (let i = 1; i <= r; i++) sum += src[offset + Math.min(i, n - 1) * stride]
  for (let i = 0; i < n; i++) {
    dst[offset + i * stride] = sum * scale
    sum += src[offset + Math.min(i + r + 1, n - 1) * stride] - src[offset + Math.max(i - r, 0) * stride]
  }
}

const blurGrid = (grid: Float32Array, w: number, h: number, r: number) => {
  const tmp = new Float32Array(w * h)
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) blurLine(grid, tmp, y * w, 1, w, r)
    for (let x = 0; x < w; x++) blurLine(tmp, grid, x, w, h, r)
  }
}

const settle = (x: number) => 1 / (1 + Math.exp(-1.702 * x))

const paint = (w: number, h: number, fill: (data: Uint8ClampedArray) => void): string => {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d')!
  const image = context.createImageData(w, h)
  fill(image.data)
  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

const shade = (depth: Float32Array, w: number, h: number, falloff: (t: number) => number) =>
  paint(w, h, data => {
    data.fill(255)
    for (let i = 0; i < w * h; i++) data[i * 4 + 3] = 255 * (1 - falloff(depth[i]))
  })

const traceShape = (image: HTMLImageElement, width: number, height: number, ratio: number) => {
  const naturalWidth = image.naturalWidth || width
  const naturalHeight = image.naturalHeight || height
  const fit = Math.min(width / naturalWidth, height / naturalHeight)
  const box = {
    x: (width - naturalWidth * fit) / 2,
    y: (height - naturalHeight * fit) / 2,
    width: naturalWidth * fit,
    height: naturalHeight * fit
  }
  const w = Math.max(2, Math.round(width * ratio))
  const h = Math.max(2, Math.round(height * ratio))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d', { willReadFrequently: true })!
  context.drawImage(image, box.x * ratio, box.y * ratio, box.width * ratio, box.height * ratio)
  const pixels = context.getImageData(0, 0, w, h).data
  const outside = new Float32Array(w * h)
  const inside = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const edge = 0.5 - pixels[i * 4 + 3] / 255
    outside[i] = edge >= 0.5 ? FAR : Math.max(edge, 0) ** 2
    inside[i] = edge <= -0.5 ? FAR : Math.min(edge, 0) ** 2
  }
  distanceGrid(outside, w, h)
  distanceGrid(inside, w, h)
  const depth = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) depth[i] = (Math.sqrt(inside[i]) - Math.sqrt(outside[i])) / ratio
  return {
    box,
    depth,
    w,
    h,
    ratio,
    line: shade(depth, w, h, t => settle(t - 1)),
    glow: shade(depth, w, h, t => settle((t - 4) / 5))
  }
}

type ShapeTrace = ReturnType<typeof traceShape> & { image: HTMLImageElement; width: number; height: number }

const bendShape = (trace: ShapeTrace, edge: number, softness: number, calm: number, level: number) => {
  const { depth, w, h, ratio } = trace
  const reach = edge + softness * 2
  const field = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) field[i] = Math.min(Math.max(depth[i], -6), reach)
  blurGrid(field, w, h, Math.max(1, Math.round(Math.max(1.5, softness * 0.35) * ratio)))
  return paint(w, h, data => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        const dx = field[i + (x < w - 1 ? 1 : 0)] - field[i - (x > 0 ? 1 : 0)]
        const dy = field[i + (y < h - 1 ? w : 0)] - field[i - (y > 0 ? w : 0)]
        const still = calm * settle((depth[i] - edge) / softness)
        const bend = (1 - still) * ratio * 0.25
        const shift = still * (level - 0.5)
        data[i * 4] = 255 * (0.5 + dx * bend + shift)
        data[i * 4 + 1] = 255 * (0.5 + dy * bend + shift)
        data[i * 4 + 2] = 255 * (0.5 + shift)
        data[i * 4 + 3] = 255
      }
    }
  })
}

/* ------------------------------------------------------------------ *
 * Vue 侧状态与生命周期
 * ------------------------------------------------------------------ */

export interface GlassFilterRefs {
  feImage: SVGFEImageElement | null
  red: SVGFEDisplacementMapElement | null
  green: SVGFEDisplacementMapElement | null
  blue: SVGFEDisplacementMapElement | null
  blur: SVGFEGaussianBlurElement | null
}

export interface ShapeArt {
  src: string
  box: { x: number; y: number; width: number; height: number }
  line: string
  glow: string
  failed?: boolean
}

export interface UseGlassSurfaceOptions {
  /** 容器 / canvas 的模板 ref */
  root: Ref<HTMLElement | null>
  canvas: Ref<HTMLCanvasElement | null>
  /** 由 h() 渲染函数登记的滤镜原语（SVG 标签不在 Vue 模板白名单里） */
  filterRefs: GlassFilterRefs
  /** defineProps 返回的响应式对象（withDefaults 后所有项都有值） */
  settings: Required<GlassSurfaceSettings>
  filterId: string
}

const UNIFORMS = [
  'uBackdrop', 'uMap', 'uCanvas', 'uSize', 'uOrigin',
  'uStep', 'uScale', 'uChannel', 'uSpread', 'uLod', 'uSaturation'
] as const

export function useGlassSurface({ root, canvas, filterRefs, settings, filterId }: UseGlassSurfaceOptions) {
  const svgSupported = ref(false)
  const checked = ref(false)
  const webglFailed = ref(false)
  const boxSize = ref('')
  const loaded = ref<{ src: string; image: HTMLImageElement | null }>({ src: '', image: null })
  const art = ref<ShapeArt | null>(null)

  /** 高频逐帧状态用普通变量，不进响应式 */
  let mapUrl = ''
  let shapeMap = ''
  let trace: ShapeTrace | null = null
  let ro: ResizeObserver | null = null

  const generateDisplacementMap = (): string => {
    const rect = root.value?.getBoundingClientRect()
    const actualWidth = rect?.width || 400
    const actualHeight = rect?.height || 200
    const edgeSize = Math.min(actualWidth, actualHeight) * (settings.borderWidth * 0.5)
    const svgContent = `
      <svg width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="red-grad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
          <filter id="soft" filterUnits="userSpaceOnUse" x="0" y="0" width="${actualWidth}" height="${actualHeight}" color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="${settings.blur}" />
          </filter>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="black"></rect>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${settings.borderRadius}" fill="url(#red-grad)" />
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" rx="${settings.borderRadius}" fill="url(#blue-grad)" style="mix-blend-mode: ${settings.mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${settings.borderRadius}" fill="hsl(0 0% ${settings.brightness}% / ${settings.opacity})" filter="url(#soft)" />
      </svg>
    `
    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`
  }

  const updateDisplacementMap = () => {
    mapUrl = shapeMap || generateDisplacementMap()
    filterRefs.feImage?.setAttribute('href', mapUrl)
  }

  /** 对应 React 的第一个 effect：置换贴图 + 三个通道 + 高斯模糊 */
  const syncFilter = () => {
    updateDisplacementMap()
    ;([
      { ref: filterRefs.red, offset: settings.redOffset },
      { ref: filterRefs.green, offset: settings.greenOffset },
      { ref: filterRefs.blue, offset: settings.blueOffset }
    ] as const).forEach(({ ref, offset }) => {
      if (!ref) return
      ref.setAttribute('scale', String(settings.distortionScale + offset))
      ref.setAttribute('xChannelSelector', settings.xChannel)
      ref.setAttribute('yChannelSelector', settings.yChannel)
    })
    filterRefs.blur?.setAttribute('stdDeviation', String(settings.displace))
  }

  /** 对应 React 的 shape 描摹 effect */
  const updateShapeMap = () => {
    const element = root.value
    const w = element?.offsetWidth || 0
    const h = element?.offsetHeight || 0
    const shapeImage = settings.shape && loaded.value.src === settings.shape ? loaded.value.image : null
    let map = ''
    let nextTrace: ShapeTrace | null = null
    if (shapeImage && w && h && typeof window !== 'undefined') {
      const ratio = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(400000 / (w * h)))
      try {
        if (!trace || trace.image !== shapeImage || trace.width !== w || trace.height !== h || trace.ratio !== ratio) {
          nextTrace = { image: shapeImage, width: w, height: h, ...traceShape(shapeImage, w, h, ratio) }
          trace = nextTrace
        } else {
          nextTrace = trace
        }
        map = bendShape(nextTrace, Math.min(w, h) * settings.borderWidth * 0.5, Math.max(settings.blur, 0.5), settings.opacity, settings.brightness / 100)
      } catch {
        nextTrace = null
        trace = null
      }
    }
    shapeMap = map
    updateDisplacementMap()
    if (settings.shape && nextTrace) {
      art.value = { src: settings.shape, box: nextTrace.box, line: nextTrace.line, glow: nextTrace.glow }
    } else if (settings.shape && loaded.value.src === settings.shape) {
      art.value = { src: settings.shape, box: { x: 0, y: 0, width: 0, height: 0 }, line: '', glow: '', failed: true }
    }
  }

  const supportsSVGFilters = (): boolean => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    const isFirefox = /Firefox/.test(navigator.userAgent)
    if (isWebkit || isFirefox) return false
    const div = document.createElement('div')
    div.style.backdropFilter = `url(#${filterId})`
    return div.style.backdropFilter !== ''
  }

  const webgl = computed(
    () =>
      checked.value &&
      settings.refraction &&
      Boolean(settings.backdrop) &&
      !webglFailed.value &&
      (settings.renderer === 'webgl' || (settings.renderer === 'auto' && !svgSupported.value))
  )
  const refractive = computed(() => !webgl.value && svgSupported.value && settings.refraction)
  const frosted = computed(() => !webgl.value && !refractive.value)
  const modeClass = computed(() =>
    webgl.value ? 'glass-surface--webgl' : refractive.value ? 'glass-surface--svg' : 'glass-surface--fallback'
  )

  const outline = computed<ShapeArt | null>(() =>
    settings.shape && art.value?.src === settings.shape && !art.value.failed ? art.value : null
  )
  const maskUrl = computed(() =>
    outline.value ? `url("${outline.value.src.replace(/"/g, '%22').replace(/[\n\r]+/g, ' ')}")` : ''
  )
  const maskPlace = computed(() => {
    const box = outline.value?.box
    return box ? `${box.x}px ${box.y}px / ${box.width}px ${box.height}px no-repeat` : ''
  })

  const containerStyle = computed<Record<string, string | number>>(() => {
    const style: Record<string, string | number> = { ...(settings.style ?? {}) }
    style.width = typeof settings.width === 'number' ? `${settings.width}px` : settings.width
    style.height = typeof settings.height === 'number' ? `${settings.height}px` : settings.height
    style.borderRadius = `${settings.borderRadius}px`
    style['--glass-frost'] = settings.backgroundOpacity
    style['--glass-saturation'] = settings.saturation
    style['--filter-id'] = `url(#${filterId})`
    if (outline.value) {
      style.borderRadius = 0
      style.boxShadow = 'none'
      style.WebkitMask = `${maskUrl.value} ${maskPlace.value}`
      style.mask = `${maskUrl.value} ${maskPlace.value}`
    } else if (settings.shape && art.value?.src !== settings.shape) {
      style.opacity = 0
      style.transition = 'none'
    }
    return style
  })

  /* ---------- WebGL 渲染（可重放，供上下文恢复时重建） ---------- */

  let gl: WebGL2RenderingContext | null = null
  let program: WebGLProgram | null = null
  let vao: WebGLVertexArrayObject | null = null
  let buffer: WebGLBuffer | null = null
  let backdropTexture: WebGLTexture | null = null
  let mapTexture: WebGLTexture | null = null
  let uniforms: Record<string, WebGLUniformLocation | null> = {}
  let mapCanvas: HTMLCanvasElement | null = null
  let mapContext: CanvasRenderingContext2D | null = null
  let frame = 0
  let visible = true
  let drawn = ''
  let stopped = false
  const picture: { node: AnyNode | null; key: string; width: number; height: number; mipmapped: boolean; ready: boolean } = {
    node: null, key: '', width: 0, height: 0, mipmapped: false, ready: false
  }
  const mapState: { url: string; ready: boolean } = { url: '', ready: false }

  const createResources = (context: WebGL2RenderingContext): boolean => {
    program = compileGlass(context)
    if (!program) return false
    uniforms = {}
    for (const name of UNIFORMS) uniforms[name] = context.getUniformLocation(program, name)
    vao = context.createVertexArray()
    buffer = context.createBuffer()
    context.bindVertexArray(vao)
    context.bindBuffer(context.ARRAY_BUFFER, buffer)
    context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), context.STATIC_DRAW)
    context.enableVertexAttribArray(0)
    context.vertexAttribPointer(0, 2, context.FLOAT, false, 0, 0)
    context.pixelStorei(context.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)

    const makeTexture = (): WebGLTexture | null => {
      const texture = context.createTexture()
      context.bindTexture(context.TEXTURE_2D, texture)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, context.LINEAR)
      context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, context.LINEAR)
      return texture
    }
    backdropTexture = makeTexture()
    mapTexture = makeTexture()
    if (!backdropTexture || !mapTexture) return false
    mapCanvas = document.createElement('canvas')
    mapContext = mapCanvas.getContext('2d')
    mapState.url = ''
    mapState.ready = false
    picture.node = null
    picture.key = ''
    picture.ready = false
    drawn = ''
    return true
  }

  const loadMap = (url: string, element: HTMLElement, context: WebGL2RenderingContext) => {
    mapState.url = url
    const image = new Image()
    image.onload = () => {
      if (mapState.url !== url || !mapContext || !mapCanvas || !mapTexture || stopped) return
      const ratio = Math.min(2, window.devicePixelRatio || 1)
      mapCanvas.width = Math.max(1, Math.round(element.offsetWidth * ratio))
      mapCanvas.height = Math.max(1, Math.round(element.offsetHeight * ratio))
      mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height)
      mapContext.drawImage(image, 0, 0, mapCanvas.width, mapCanvas.height)
      context.bindTexture(context.TEXTURE_2D, mapTexture)
      context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, mapCanvas)
      mapState.ready = true
      drawn = ''
    }
    image.src = url
  }

  const upload = (node: AnyNode, context: WebGL2RenderingContext) => {
    const still = node instanceof HTMLImageElement
    context.bindTexture(context.TEXTURE_2D, backdropTexture)
    context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, node)
    if (still) context.generateMipmap(context.TEXTURE_2D)
    context.texParameteri(context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, still ? context.LINEAR_MIPMAP_LINEAR : context.LINEAR)
    ;[picture.width, picture.height] = sourceSize(node)
    picture.mipmapped = still
    picture.ready = true
  }

  const tick = () => {
    frame = 0
    if (!visible || document.hidden || !gl || !canvas.value || !root.value) return
    const context = gl
    frame = requestAnimationFrame(tick)
    if (mapUrl && mapUrl !== mapState.url) loadMap(mapUrl, root.value, context)
    const node = resolveBackdrop(settings.backdrop)
    if (!node) return
    let key = ''
    if (node instanceof HTMLImageElement) key = node.complete && node.naturalWidth ? node.currentSrc || node.src : ''
    else if (node instanceof HTMLVideoElement) key = node.readyState >= 2 ? `${node.currentSrc}|${node.currentTime}` : ''
    else key = `${node.width}x${node.height}|${performance.now()}`
    if (key && (node !== picture.node || key !== picture.key)) {
      try {
        upload(node, context)
      } catch {
        webglFailed.value = true
        return
      }
      picture.node = node
      picture.key = key
      drawn = ''
    }
    if (!picture.ready || !mapState.ready) return

    const element = root.value
    const layoutWidth = element.offsetWidth
    const layoutHeight = element.offsetHeight
    if (!layoutWidth || !layoutHeight) return
    const box = element.getBoundingClientRect()
    const content = contentBox(node)
    if (!content.width || !content.height) return
    const ratio = Math.min(2, window.devicePixelRatio || 1)
    const width = Math.max(1, Math.round(layoutWidth * ratio))
    const height = Math.max(1, Math.round(layoutHeight * ratio))
    const signature = [
      box.left, box.top, box.width, box.height,
      content.x, content.y, content.width, content.height,
      width, height, picture.key, mapState.url,
      settings.displace, settings.saturation, settings.distortionScale,
      settings.redOffset, settings.greenOffset, settings.blueOffset,
      settings.xChannel, settings.yChannel
    ].join('|')
    if (signature === drawn) return
    drawn = signature

    const surface = canvas.value
    if (surface.width !== width || surface.height !== height) {
      surface.width = width
      surface.height = height
    }
    const scaleX = box.width / layoutWidth
    const scaleY = box.height / layoutHeight
    const texelsPerPixel = (picture.width / content.width) * (scaleX / ratio)
    const spreadTexels = (picture.width / content.width) * scaleX * Math.max(0, settings.displace)
    const lod = picture.mipmapped
      ? Math.max(0, Math.log2(Math.max(texelsPerPixel, spreadTexels * 0.5, 0.000001)))
      : 0
    context.viewport(0, 0, width, height)
    context.useProgram(program)
    context.bindVertexArray(vao)
    context.activeTexture(context.TEXTURE0)
    context.bindTexture(context.TEXTURE_2D, backdropTexture)
    context.uniform1i(uniforms.uBackdrop, 0)
    context.activeTexture(context.TEXTURE1)
    context.bindTexture(context.TEXTURE_2D, mapTexture)
    context.uniform1i(uniforms.uMap, 1)
    context.uniform2f(uniforms.uCanvas, width, height)
    context.uniform2f(uniforms.uSize, layoutWidth, layoutHeight)
    context.uniform2f(uniforms.uOrigin, (box.left - content.x) / content.width, (box.top - content.y) / content.height)
    context.uniform2f(uniforms.uStep, scaleX / content.width, scaleY / content.height)
    context.uniform3f(
      uniforms.uScale,
      settings.distortionScale + settings.redOffset,
      settings.distortionScale + settings.greenOffset,
      settings.distortionScale + settings.blueOffset
    )
    context.uniform2i(uniforms.uChannel, CHANNELS[settings.xChannel] ?? 0, CHANNELS[settings.yChannel] ?? 1)
    context.uniform1f(uniforms.uSpread, Math.max(0, settings.displace))
    context.uniform1f(uniforms.uLod, lod)
    context.uniform1f(uniforms.uSaturation, settings.saturation)
    context.drawArrays(context.TRIANGLES, 0, 3)
  }

  const wake = () => {
    if (!frame && visible && !document.hidden && gl) frame = requestAnimationFrame(tick)
  }
  const onLost = (event: Event) => {
    event.preventDefault()
    cancelAnimationFrame(frame)
    frame = 0
  }
  const onRestored = () => {
    // 上游调了 preventDefault 却从不重建；这里随浏览器恢复上下文重建资源（见 README 差异）
    if (!gl || stopped) return
    if (!createResources(gl)) {
      webglFailed.value = true
      return
    }
    wake()
  }

  let intersection: IntersectionObserver | null = null
  let activeCanvas: HTMLCanvasElement | null = null

  const stopWebgl = () => {
    cancelAnimationFrame(frame)
    frame = 0
    intersection?.disconnect()
    intersection = null
    document.removeEventListener('visibilitychange', wake)
    activeCanvas?.removeEventListener('webglcontextlost', onLost)
    activeCanvas?.removeEventListener('webglcontextrestored', onRestored)
    activeCanvas = null
    if (gl) {
      gl.deleteTexture(backdropTexture)
      gl.deleteTexture(mapTexture)
      gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
    }
    gl = null
    program = null
  }

  const startWebgl = () => {
    const surface = canvas.value
    const element = root.value
    if (!surface || !element) return
    const context = surface.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    }) as WebGL2RenderingContext | null
    if (!context || !createResources(context)) {
      webglFailed.value = true
      return
    }
    gl = context
    activeCanvas = surface
    visible = true
    stopped = false
    intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting)
      wake()
    })
    intersection.observe(element)
    document.addEventListener('visibilitychange', wake)
    surface.addEventListener('webglcontextlost', onLost)
    surface.addEventListener('webglcontextrestored', onRestored)
    wake()
  }

  watch(
    webgl,
    active => {
      if (active) startWebgl()
      else stopWebgl()
    },
    { flush: 'post' }
  )

  /* ---------- 挂载与清理 ---------- */

  onMounted(() => {
    svgSupported.value = supportsSVGFilters()
    checked.value = true
    syncFilter()
    updateShapeMap()

    const element = root.value
    if (element) {
      ro = new ResizeObserver(() => {
        const node = root.value
        if (node) boxSize.value = `${node.offsetWidth}x${node.offsetHeight}`
      })
      ro.observe(element)
    }
    if (settings.shape) loadShape(settings.shape)
  })

  const loadShape = (src: string) => {
    let alive = true
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => { if (alive) loaded.value = { src, image } }
    image.onerror = () => { if (alive) loaded.value = { src, image: null } }
    image.src = src
    return () => { alive = false }
  }
  let cancelShape: (() => void) | undefined
  watch(() => settings.shape, src => {
    cancelShape?.()
    cancelShape = undefined
    if (!src) {
      loaded.value = { src: '', image: null }
      return
    }
    cancelShape = loadShape(src)
  })

  watch(
    () => [
      boxSize.value, settings.width, settings.height, settings.borderRadius, settings.borderWidth,
      settings.brightness, settings.opacity, settings.blur, settings.displace, settings.distortionScale,
      settings.redOffset, settings.greenOffset, settings.blueOffset, settings.xChannel, settings.yChannel,
      settings.mixBlendMode
    ].join('|'),
    syncFilter,
    { flush: 'post' }
  )

  watch(
    () => [
      settings.shape, loaded.value, boxSize.value, settings.borderWidth,
      settings.blur, settings.opacity, settings.brightness
    ],
    updateShapeMap,
    { flush: 'post' }
  )

  onBeforeUnmount(() => {
    stopped = true
    cancelShape?.()
    ro?.disconnect()
    stopWebgl()
  })

  return {
    webgl,
    refractive,
    frosted,
    modeClass,
    outline,
    containerStyle
  }
}

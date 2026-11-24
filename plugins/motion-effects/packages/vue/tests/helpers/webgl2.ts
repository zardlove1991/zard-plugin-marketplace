import { vi } from 'vitest'

interface Handle {
  kind: string
  /** 创建这份资源时的上下文代数。上下文丢失后恢复，代数 +1，之前的资源全部失效。 */
  generation: number
}

/** 组件用到的 WebGL2 枚举值（与规范一致） */
const CONSTANTS: Record<string, number> = {
  VERTEX_SHADER: 0x8b31,
  FRAGMENT_SHADER: 0x8b30,
  COMPILE_STATUS: 0x8b81,
  LINK_STATUS: 0x8b82,
  ACTIVE_UNIFORMS: 0x8b86,
  ARRAY_BUFFER: 0x8892,
  STATIC_DRAW: 0x88e4,
  FLOAT: 0x1406,
  HALF_FLOAT: 0x140b,
  TRIANGLES: 0x0004,
  TRIANGLE_STRIP: 0x0005,
  COLOR_BUFFER_BIT: 0x4000,
  BLEND: 0x0be2,
  ONE: 1,
  TEXTURE_2D: 0x0de1,
  TEXTURE0: 0x84c0,
  TEXTURE_MAG_FILTER: 0x2800,
  TEXTURE_MIN_FILTER: 0x2801,
  TEXTURE_WRAP_S: 0x2802,
  TEXTURE_WRAP_T: 0x2803,
  CLAMP_TO_EDGE: 0x812f,
  NEAREST: 0x2600,
  LINEAR: 0x2601,
  FRAMEBUFFER: 0x8d40,
  FRAMEBUFFER_COMPLETE: 0x8cd5,
  COLOR_ATTACHMENT0: 0x8ce0,
  R16F: 0x822d,
  RG16F: 0x822f,
  RGBA16F: 0x881a,
  RED: 0x1903,
  RG: 0x8227,
  RGBA: 0x1908
}

/** 参数里带资源对象的调用；真实上下文遇到失效资源时记 INVALID_OPERATION，而不是抛异常 */
const RESOURCE_CALLS = new Set([
  'attachShader',
  'bindAttribLocation',
  'linkProgram',
  'useProgram',
  'getUniformLocation',
  'bindBuffer',
  'bindVertexArray',
  'deleteShader',
  'deleteProgram',
  'deleteBuffer',
  'deleteVertexArray'
])

/**
 * 给 canvas 装一个记录调用的 WebGL2 上下文桩。
 *
 * jsdom 没有 WebGL，这是组件与 GPU 之间唯一的平台边界。桩只还原组件依赖的语义：
 * 能创建资源对象，以及"上下文恢复后旧资源失效"。
 */
export function installWebGL2Mock() {
  const calls: Array<{ name: string; args: unknown[] }> = []
  const errors: string[] = []
  let generation = 0

  const isStale = (value: unknown): boolean =>
    typeof value === 'object' && value !== null && 'generation' in value
      ? (value as Handle).generation !== generation
      : false

  const gl = new Proxy(
    {},
    {
      get: (_, key: string) => {
        if (key in CONSTANTS) return CONSTANTS[key]
        if (key === 'checkFramebufferStatus') return () => CONSTANTS.FRAMEBUFFER_COMPLETE
        if (key === 'getExtension') {
          return (name: string) =>
            name === 'WEBGL_lose_context' ? { loseContext: () => undefined } : null
        }
        return (...args: unknown[]) => {
          calls.push({ name: key, args })
          // 真实 WebGL 对丢失上下文里的对象执行 delete* 是静默 no-op，不应算作错误
          if (RESOURCE_CALLS.has(key) && !key.startsWith('delete') && args.some(isStale)) {
            errors.push(`${key}: object does not belong to this context`)
          }
          if (key.startsWith('uniform') && isStale(args[0])) {
            errors.push(`${key}: location is not from the associated program`)
          }
          if (key.startsWith('create')) return { kind: key, generation } satisfies Handle
          if (key === 'getShaderParameter' || key === 'getProgramParameter') return true
          if (key === 'getUniformLocation') return { kind: key, generation } satisfies Handle
          return undefined
        }
      }
    }
  )

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    ((type: string) => (type === 'webgl2' ? gl : null)) as typeof HTMLCanvasElement.prototype.getContext
  )

  return {
    /** 模拟浏览器恢复上下文：还是同一个上下文对象，但丢失前创建的资源全部失效 */
    restore: () => {
      generation += 1
    },
    /** 使用了失效资源的调用，正常应为空 */
    errors,
    count: (name: string) => calls.filter(call => call.name === name).length
  }
}

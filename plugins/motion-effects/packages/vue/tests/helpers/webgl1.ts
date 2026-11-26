import { vi } from 'vitest'

/**
 * 给 canvas 装一个记录调用的 WebGL（1）上下文桩。
 *
 * `LiquidNavbar` 的水体着色器用的是 GLSL ES 1.00，走 `getContext('webgl')`，
 * 和 webgl2.ts 那个桩互不影响。jsdom 没有 WebGL，这是组件与 GPU 之间唯一的平台边界；
 * 桩只还原组件依赖的语义：能编译/链接、能拿到 uniform 与 attribute 位置、能提交绘制。
 */
export function installWebGL1Mock() {
  const calls: Array<{ name: string; args: unknown[] }> = []
  let linkOk = true

  /** WebGL 1 与 WebGL 2 同值的常量 */
  const CONSTANTS: Record<string, number> = {
    VERTEX_SHADER: 0x8b31,
    FRAGMENT_SHADER: 0x8b30,
    COMPILE_STATUS: 0x8b81,
    LINK_STATUS: 0x8b82,
    ARRAY_BUFFER: 0x8892,
    STATIC_DRAW: 0x88e4,
    FLOAT: 0x1406,
    TRIANGLES: 0x0004,
    COLOR_BUFFER_BIT: 0x4000
  }

  const gl = new Proxy<Record<string, unknown>>(
    { drawingBufferWidth: 328, drawingBufferHeight: 82 },
    {
      get(target, key: string) {
        if (key in target) return target[key]
        if (key in CONSTANTS) return CONSTANTS[key]
        return (...args: unknown[]) => {
          calls.push({ name: key, args })
          if (key === 'createShader' || key === 'createProgram' || key === 'createBuffer') {
            return { kind: key }
          }
          if (key === 'getShaderParameter') return true
          if (key === 'getProgramParameter') return linkOk
          if (key === 'getAttribLocation') return 0
          if (key === 'getUniformLocation') return { kind: key, name: args[1] }
          return undefined
        }
      }
    }
  )

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    ((type: string) => (type === 'webgl' ? gl : null)) as typeof HTMLCanvasElement.prototype.getContext
  )

  const named = (name: string, uniform: string) =>
    calls.filter(call => call.name === name && (call.args[0] as { name?: string } | null)?.name === uniform)

  return {
    calls,
    /** 让下一次 linkProgram 失败，模拟着色器不支持的设备 */
    failLink: () => {
      linkOk = false
    },
    count: (name: string) => calls.filter(call => call.name === name).length,
    /** 某个 uniform 的最后一次提交，args 从 uniform 位置之后算起 */
    last: (method: string, uniform: string) => named(method, uniform).at(-1)?.args.slice(1)
  }
}

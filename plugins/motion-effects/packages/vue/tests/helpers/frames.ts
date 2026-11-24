/**
 * 等一帧真实动画帧。
 *
 * motion-dom 在模块加载时就捕获了 requestAnimationFrame（见其 frameloop/frame.mjs），
 * vi.useFakeTimers() 换掉的全局函数管不到它的帧循环，所以涉及动画的断言一律用真实帧推进。
 */
export const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

/** 依次推进 count 帧 */
export async function advanceFrames(count: number) {
  for (let frame = 0; frame < count; frame++) await nextFrame()
}

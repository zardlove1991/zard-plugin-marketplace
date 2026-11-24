import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    // 真实帧动画测试（PeakChart / Shredder / SpotlightCard）在并行负载下接近 5s 默认上限
    testTimeout: 15000
  }
})
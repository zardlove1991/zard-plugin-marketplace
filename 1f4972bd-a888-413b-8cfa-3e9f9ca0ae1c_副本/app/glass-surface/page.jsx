'use client';

import GlassSurface from '@/components/ui/GlassSurface';

export default function GlassSurfaceDemo() {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        padding: 56,
        background:
          'linear-gradient(180deg, rgba(5,7,13,.62), rgba(5,7,13,.34) 42%, rgba(5,7,13,.74)), url(/assets/sunset.jpg) center/cover no-repeat #0b0d12'
      }}
    >
      <GlassSurface
        width={360}
        height={76}
        borderRadius={38}
        distortionScale={-180}
        displace={0.5}
        backgroundOpacity={0.1}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 8px rgba(0,0,0,0.45)'
          }}
        >
          维链通 · 品牌 CI 中心
        </span>
      </GlassSurface>

      <GlassSurface width={320} height={190} borderRadius={20} displace={0.35} backgroundOpacity={0.08}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
          <strong style={{ fontSize: 16, textShadow: '0 1px 8px rgba(0,0,0,0.45)' }}>折射玻璃面板</strong>
          <span style={{ fontSize: 13, lineHeight: 1.7, textShadow: '0 1px 6px rgba(0,0,0,0.45)' }}>
            边缘弯折背后的画面，中心保持平静，色散沿边缘分出彩色。
          </span>
        </div>
      </GlassSurface>

      <GlassSurface
        shape="/assets/glass-shape.svg"
        width={260}
        height={260}
        borderWidth={0.09}
        blur={10}
        distortionScale={-200}
      />

      <GlassSurface width={300} height={64} borderRadius={32} refraction={false} backgroundOpacity={0.16}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            textShadow: '0 1px 8px rgba(0,0,0,0.45)'
          }}
        >
          雾面玻璃 · 无折射降级
        </span>
      </GlassSurface>
    </div>
  );
}

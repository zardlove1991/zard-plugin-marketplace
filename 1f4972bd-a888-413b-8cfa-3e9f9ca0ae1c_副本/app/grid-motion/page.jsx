'use client';

import GridMotion from '@/components/ui/GridMotion';

const items = [
  '/assets/sunset.jpg',
  '维链通',
  '/assets/landscape.jpg',
  '品牌 CI 中心',
  '/assets/city-poster.jpg',
  { src: '/assets/logo.png', alt: '维链通 Logo' },
  <div key="custom" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <strong style={{ fontSize: 18, fontWeight: 600 }}>GRID MOTION</strong>
    <span style={{ fontSize: 12, opacity: 0.7 }}>React Bits</span>
  </div>
];

export default function GridMotionDemo() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100svh' }}>
      <GridMotion
        items={items}
        rows={4}
        aspectRatio={1.33}
        gap={16}
        radius={14}
        angle={-12}
        tilt={0}
        speed={24}
        direction="alternate"
        parallax={0.5}
        spotlight={0.6}
        dim={0.35}
        fade={0.5}
        grayscale={false}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          pointerEvents: 'none'
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(242,244,248,0.66)',
            textShadow: '0 1px 10px rgba(0,0,0,0.55)'
          }}
        >
          Grid Motion
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(30px, 6vw, 56px)',
            lineHeight: 1.3,
            color: '#f2f4f8',
            textShadow: '0 2px 18px rgba(0,0,0,0.6)'
          }}
        >
          维链通
        </h1>
      </div>
    </div>
  );
}

'use client';

import TiltedCard, { TiltedCardLayer } from '@/components/ui/TiltedCard';

export default function TiltedCardDemo() {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 48,
        flexWrap: 'wrap',
        background: '#0d0d11',
        padding: 48
      }}
    >
      <TiltedCard
        imageSrc="/assets/sunset.jpg"
        altText="Sunset clouds"
        captionText="Afterglow"
        containerHeight="320px"
        containerWidth="320px"
        imageHeight="320px"
        imageWidth="320px"
        rotateAmplitude={12}
        scaleOnHover={1.05}
        glare={0.5}
        shadow={0.5}
        backContent={<p style={{ padding: 20 }}>The back of the card</p>}
      >
        <TiltedCardLayer depth={30}>
          <h3 style={{ position: 'absolute', left: 20, bottom: 16, color: '#fff' }}>Afterglow</h3>
        </TiltedCardLayer>
        <TiltedCardLayer depth={22}>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              width: 48,
              height: 48,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.16)',
              boxShadow:
                'inset 0 0 0 1px rgba(255, 255, 255, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 10px 24px -10px rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              color: '#fff',
              pointerEvents: 'none'
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="currentColor"
              style={{ display: 'block', filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45))' }}
            >
              <path d="M9 6.5v11l9-5.5z" />
            </svg>
          </span>
        </TiltedCardLayer>
      </TiltedCard>
    </div>
  );
}

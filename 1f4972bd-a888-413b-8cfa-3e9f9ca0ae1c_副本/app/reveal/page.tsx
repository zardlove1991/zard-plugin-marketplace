"use client"

import { GlassIconReveal } from "@/components/ui/liquid-glass-logo-reveal"

export default function GlassRevealDemo() {
  return (
    <GlassIconReveal
      logo="/assets/logo.png"
      label="维链通 Logo"
      look="light"
      background="#ffffff"
      originalColors
      logoScale={0.62}
      finalScale={0.78}
      tileSize={300}
      loop
      hold={1.6}
      className="h-dvh min-h-[420px] w-full"
    />
  )
}

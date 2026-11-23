"use client";

import { useState } from "react";
import FlipCard from "@/components/ui/FlipCard";

export default function FlipCardDemo() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "0 16px",
        background: "#f5f5f5",
      }}
    >
      <FlipCard
        front={
          <img
            src="/assets/landscape.jpg"
            alt="Wooded landscape"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        }
        back={
          <div style={{ padding: 24 }}>
            <h3 style={{ margin: "0 0 12px", font: "600 22px/1.2 ui-sans-serif, system-ui, sans-serif" }}>
              Wooded Landscape
            </h3>
            <p style={{ margin: 0, font: "400 14px/1.6 ui-sans-serif, system-ui, sans-serif", opacity: 0.72 }}>
              Nature · Study No. 04
            </p>
          </div>
        }
        axis="y"
        flipOnClick
        draggable
        dragDistance={0}
        tilt
        tiltMax={12}
        glare
        glareOpacity={0.22}
        hoverScale={1.03}
        perspective={1100}
        stiffness={170}
        damping={20}
        width={300}
        height={400}
        radius={22}
        background="#27272a"
        color="#f5f5f5"
        shadow
        shadowColor="#000000"
        shadowOpacity={0.45}
        onFlipChange={setFlipped}
      />
      <p
        style={{
          margin: 0,
          font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.01em",
          color: "#8c8c8c",
        }}
      >
        当前：{flipped ? "背面" : "正面"} · 点击、拖拽或按 Enter 翻面
      </p>
    </div>
  );
}

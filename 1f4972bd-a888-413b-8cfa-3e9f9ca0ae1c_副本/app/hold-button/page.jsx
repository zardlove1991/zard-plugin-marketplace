import { useState } from "react";
import HoldButton from "@/components/ui/HoldButton";

export default function HoldButtonDemo() {
  const [last, setLast] = useState("按住按钮 2 秒确认");

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
        background: "#f5f5f5",
        padding: "0 16px",
      }}
    >
      <HoldButton
        doneLabel="Deleted"
        backgroundColor="#27272a"
        fillColor="#5227FF"
        textColor="#f5f5f5"
        fillTextColor="#ffffff"
        size="md"
        radius={14}
        fillDirection="right"
        holdTime={2000}
        releaseTime={200}
        pressScale={0.97}
        wave
        waveAmplitude={6}
        glow
        resetAfter={1200}
        onHold={() => setLast("已确认：onHold 触发")}
        onTap={() => setLast("短按：onTap 触发")}
      >
        Hold to delete
      </HoldButton>
      <p
        style={{
          margin: 0,
          font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.01em",
          color: "#8c8c8c",
        }}
      >
        {last}
      </p>
    </div>
  );
}

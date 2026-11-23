import { useState } from "react";
import RubberSegment from "@/components/ui/RubberSegment";

export default function RubberSegmentDemo() {
  const [last, setLast] = useState("Week · 1");

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
      <RubberSegment
        items={["Day", "Week", "Month", "Year"]}
        defaultValue="Week"
        onChange={(value, index) => setLast(`${value} · ${index}`)}
        trackColor="#27272a"
        thumbColor="#fafafa"
        textColor="#fafafa"
        activeTextColor="#18181b"
        size="md"
        radius={10}
        inset={3}
        equalSlots
        stretch={100}
        squash={3}
        speed={1}
        glide={75}
        draggable
      />
      <p
        style={{
          margin: 0,
          font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.01em",
          color: "#8c8c8c",
        }}
      >
        当前：{last} · 可点击、拖拽或方向键切换
      </p>
    </div>
  );
}

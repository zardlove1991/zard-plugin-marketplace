import GhostCursor from "@/components/ui/GhostCursor";

export default function GhostCursorDemo() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "24px 16px",
        background: "#141416",
        color: "#E4E8F2",
      }}
    >
      <div style={{ width: "min(100%, 900px)", position: "relative", height: 600 }}>
        <GhostCursor
          color="#2563eb"
          size={80}
          trailLength={50}
          inertia={0.5}
          turbulence={0.5}
          drift={0.3}
          bloomStrength={0.6}
          grainIntensity={0.05}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <p style={{ margin: 0, font: "600 12px/1.4 ui-sans-serif, system-ui, sans-serif", letterSpacing: ".12em", textTransform: "uppercase", opacity: .5 }}>
            维链通 · 品牌 CI 中心
          </p>
          <h1 style={{ margin: 0, font: "600 clamp(28px,5vw,44px)/1.3 ui-sans-serif, system-ui, sans-serif", letterSpacing: 0 }}>
            移动光标，留下痕迹
          </h1>
          <p style={{ margin: 0, font: "400 14px/1.7 ui-sans-serif, system-ui, sans-serif", opacity: .6 }}>
            烟雾跟随指针漂移，点击可以释放一团烟
          </p>
        </div>
      </div>
    </main>
  );
}

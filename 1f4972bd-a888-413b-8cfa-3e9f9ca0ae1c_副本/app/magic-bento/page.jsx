import MagicBento from "@/components/ui/MagicBento";

export default function MagicBentoDemo() {
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
        padding: "32px 20px",
        background: "#0f0e13",
      }}
    >
      <div style={{ width: "min(100%, 1100px)" }}>
        <p style={{ margin: "0 0 8px", font: "600 12px/1.4 ui-sans-serif, system-ui, sans-serif", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,244,245,.5)" }}>
          维链通 · 品牌 CI 中心
        </p>
        <h1 style={{ margin: "0 0 28px", font: "600 clamp(26px,4vw,36px)/1.3 ui-sans-serif, system-ui, sans-serif", letterSpacing: 0, color: "#f4f4f5" }}>
          功能，一目了然
        </h1>
        <MagicBento
          columns={4}
          rowHeight={200}
          gap={12}
          radius={20}
          enableBorderGlow={true}
          enableSpotlight={true}
          spotlightRadius={300}
          clickEffect={true}
        />
      </div>
      <p style={{ margin: 0, font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif", color: "rgba(244,244,245,.55)", textAlign: "center" }}>
        移动光标，卡片边缘与内部会亮起；点击会有一道光环穿过整个网格
      </p>
    </main>
  );
}

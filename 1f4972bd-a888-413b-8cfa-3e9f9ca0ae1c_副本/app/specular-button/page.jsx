import SpecularButton from "@/components/ui/SpecularButton";

export default function SpecularButtonDemo() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "24px 16px",
        background: "#141416",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", font: "600 12px/1.4 ui-sans-serif, system-ui, sans-serif", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(228,232,242,.5)" }}>
          维链通 · 品牌 CI 中心
        </p>
        <h1 style={{ margin: 0, font: "600 clamp(26px,4vw,36px)/1.3 ui-sans-serif, system-ui, sans-serif", letterSpacing: 0, color: "#E4E8F2" }}>
          沿着边缘流动的光
        </h1>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "center" }}>
        <SpecularButton
          size="lg"
          radius={18}
          tint="#ffffff"
          tintOpacity={0.04}
          textColor="#f5f5f5"
          lineColor="#2563eb"
          baseColor="#525252"
          intensity={1}
          idleIntensity={0.35}
          shineSize={10}
          shineFade={34}
          thickness={1.2}
          glow={1}
          followMouse
          proximity={250}
        >
          Get Started
        </SpecularButton>

        <SpecularButton
          size="lg"
          radius={999}
          tint="#ffffff"
          tintOpacity={0.06}
          textColor="#f5f5f5"
          lineColor="#ffffff"
          baseColor="#525252"
          autoAnimate
          speed={0.35}
        >
          自动环绕
        </SpecularButton>
      </div>

      <p style={{ margin: 0, font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif", color: "rgba(228,232,242,.55)", textAlign: "center" }}>
        移动光标靠近按钮，光点会移到最近的边缘；按下时增亮
      </p>
    </main>
  );
}

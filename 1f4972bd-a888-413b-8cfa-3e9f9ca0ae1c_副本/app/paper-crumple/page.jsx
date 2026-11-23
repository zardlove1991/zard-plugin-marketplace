import PaperCrumple from "@/components/ui/PaperCrumple";

export default function PaperCrumpleDemo() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "24px 16px",
        background: "#f5f5f5",
      }}
    >
      <PaperCrumple
        src="/assets/landscape.jpg"
        alt="A landscape print to crumple"
        width={320}
        height={400}
        sceneHeight={560}
        releaseBehavior="restore"
        crumpleAmount={0.85}
        crumpleDuration={0.55}
        releaseDuration={0.4}
        foldCount={6}
        foldSharpness={0.6}
        wrinkleDepth={0.65}
        creaseStrength={0.18}
        paperColor="#f4f0e8"
        paperTexture={0.08}
        draggable
        returnToOrigin
      />
      <p
        style={{
          margin: 0,
          font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "0.01em",
          color: "#8c8c8c",
          textAlign: "center",
        }}
      >
        按住纸张揉皱并拖动，松手复原；键盘按住空格或回车，方向键移动，Escape 重置
      </p>
    </div>
  );
}

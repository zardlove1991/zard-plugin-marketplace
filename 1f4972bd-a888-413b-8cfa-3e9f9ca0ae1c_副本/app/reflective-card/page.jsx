import ReflectiveCard from "@/components/ui/ReflectiveCard";

export default function ReflectiveCardDemo() {
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
        background: "#0e0e11",
      }}
    >
      <ReflectiveCard
        name="维链通"
        role="品牌 CI 中心"
        badge="Verified"
        status="Active"
        statusColor="#22c55e"
        idLabel="品牌编号"
        idValue="8901 2345 6789"
        theme="dark"
        tint="#ffffff"
        metalness={1}
        roughness={0.3}
        blurStrength={6}
        shine={1}
        glare={0.5}
        width={320}
        height={500}
      />
      <p style={{ margin: 0, font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif", color: "rgba(244,244,245,.55)", textAlign: "center" }}>
        移动光标，金属面会随之倾斜并反射影棚光
      </p>
    </main>
  );
}

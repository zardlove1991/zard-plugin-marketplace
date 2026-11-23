import AnimatedList from "@/components/ui/AnimatedList";

const items = [
  { title: "Brand assets", description: "24 files", meta: "2m" },
  { title: "Launch hero.png", description: "2.4 MB", meta: "18m" },
  { title: "Product tour.mp4", description: "148 MB", meta: "1h" },
  { title: "Pricing notes", description: "1,240 words", meta: "3h" },
];

export default function AnimatedListDemo() {
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
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", font: "600 12px/1.4 ui-sans-serif, system-ui, sans-serif", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(244,244,245,.5)" }}>
          维链通 · 品牌 CI 中心
        </p>
        <h1 style={{ margin: 0, font: "600 clamp(26px,4vw,36px)/1.3 ui-sans-serif, system-ui, sans-serif", letterSpacing: 0, color: "#f4f4f5" }}>
          会依次浮现的文件列表
        </h1>
      </div>

      <AnimatedList
        items={items}
        onItemSelect={(item, index) => console.log(item, index)}
        animation="pop"
        theme="dark"
        accentColor="#2563eb"
        width={420}
      />

      <p style={{ margin: 0, font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif", color: "rgba(244,244,245,.55)", textAlign: "center" }}>
        悬停选择，方向键 / Home / End 移动，回车确认
      </p>
    </main>
  );
}

import PillNav from "@/components/ui/PillNav";

export default function PillNavDemo() {
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
      <div style={{ width: "min(100%, 720px)", display: "flex", justifyContent: "center" }}>
        <PillNav
          logo="/assets/logo.png"
          logoAlt="维链通"
          items={[
            { label: "Home", href: "/" },
            { label: "Journal", href: "/journal" },
            { label: "Photos", href: "/photos" },
            { label: "About", href: "/about" },
          ]}
          activeHref="/"
          itemStyle="pill"
          hoverEffect="fill"
          indicator="dot"
          highlightColor="#2563eb"
          theme="dark"
          size="md"
        />
      </div>
      <p style={{ margin: 0, font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif", color: "rgba(244,244,245,.55)", textAlign: "center" }}>
        悬停导航项，填充会从下方升起；窄屏自动折叠为菜单
      </p>
    </main>
  );
}

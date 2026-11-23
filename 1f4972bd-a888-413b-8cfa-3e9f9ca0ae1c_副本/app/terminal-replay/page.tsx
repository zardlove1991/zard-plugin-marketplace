import TerminalReplay, { PROJECT_SETUP_SCRIPT } from "@/components/ui/terminal-replay"

export default function TerminalReplayDemo() {
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
        background: "#f5f5f5",
      }}
    >
      <div style={{ width: "min(100%, 720px)", textAlign: "center" }}>
        <p style={{ margin: "0 0 8px", font: "600 12px/1.4 ui-sans-serif, system-ui, sans-serif", letterSpacing: "0.12em", textTransform: "uppercase", color: "#000000" }}>
          维链通 · 命令行回放
        </p>
        <h1 style={{ margin: 0, font: "600 clamp(26px,4vw,36px)/1.3 ui-sans-serif, system-ui, sans-serif", letterSpacing: 0, color: "#000000" }}>
          一段会自己敲完的终端会话
        </h1>
      </div>

      <TerminalReplay
        script={PROJECT_SETUP_SCRIPT}
        title="weiliantong — zsh"
        prompt="❯"
        directory="~"
        chrome="window"
        frame="inset"
        dots="mono"
        accentColor="#2563eb"
        fontSize={13}
        lineHeight={1.7}
        height={360}
        radius={16}
        typingSpeed={26}
        variance={0.5}
        lineDelay={70}
        startDelay={700}
        hold={3200}
        loop
        autoplay
        copyable
        interactive
      />

      <p style={{ margin: 0, font: "500 13px/1.5 ui-sans-serif, system-ui, sans-serif", color: "#000000", textAlign: "center" }}>
        点击终端可跳过当前步骤，结束后点击重播
      </p>
    </main>
  )
}

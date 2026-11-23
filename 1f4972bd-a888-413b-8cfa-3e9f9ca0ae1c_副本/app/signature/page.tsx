"use client"

import { useRef } from "react"
import Signature, { type SignatureHandle } from "@/components/ui/signature"

export default function SignatureDemo() {
  const pad = useRef<SignatureHandle>(null)

  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "40px 16px",
        background: "#f5f5f5",
      }}
    >
      <div style={{ width: "min(100%, 720px)" }}>
        <p style={{ margin: "0 0 8px", font: "600 12px/1.4 ui-sans-serif, system-ui, sans-serif", letterSpacing: ".12em", textTransform: "uppercase", color: "#000" }}>
          维链通 · 品牌 CI 中心
        </p>
        <h1 style={{ margin: "0 0 20px", font: "600 clamp(26px,4vw,36px)/1.3 ui-sans-serif, system-ui, sans-serif", letterSpacing: 0, color: "#000" }}>
          一笔写成的签名
        </h1>
        <Signature mode="play" text="维链通" name="维链通" role="品牌 CI 中心" pen="fountain" inkColor="#E4E8F2" surfaceColor="#141416" />
      </div>

      <div style={{ width: "min(100%, 720px)" }}>
        <h2 style={{ margin: "0 0 16px", font: "600 18px/1.4 ui-sans-serif, system-ui, sans-serif", color: "#000" }}>
          在这里签下你的名字
        </h2>
        <Signature
          ref={pad}
          mode="sign"
          pen="fountain"
          inkColor="#1d4ed8"
          surfaceColor="#ffffff"
          placeholder="在此处签名"
          name="访客签名"
          role="Signature pad"
        />
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button type="button" onClick={() => pad.current?.undo()} style={btn}>撤销</button>
          <button type="button" onClick={() => pad.current?.clear()} style={btn}>清空</button>
          <button type="button" onClick={() => pad.current?.play()} style={btn}>回放</button>
        </div>
      </div>
    </main>
  )
}

const btn: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #dbdbdb",
  borderRadius: 8,
  background: "#ffffff",
  color: "#000000",
  font: "500 13px/1 ui-sans-serif, system-ui, sans-serif",
  cursor: "pointer",
}

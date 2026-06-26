"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Incorrect password");
        setBusy(false);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <form onSubmit={handleSubmit} style={card}>
        <div style={{ fontSize: 30, marginBottom: 4 }}>🍜</div>
        <h1 style={title}>Food Knowledge Database</h1>
        <p style={subtitle}>Enter your password to continue</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={input}
        />
        {error && <div style={errorStyle}>{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: "100%", justifyContent: "center" }}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg, #f7f4ef)",
  padding: 24,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 360,
  background: "var(--surface, #fff)",
  border: "1px solid var(--border, #e7e2d8)",
  borderRadius: 16,
  padding: 32,
  display: "flex",
  flexDirection: "column",
  gap: 12,
  textAlign: "center",
  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  fontFamily: "var(--font-body, system-ui)",
};

const title: React.CSSProperties = {
  fontFamily: "var(--font-display, Newsreader, serif)",
  fontSize: 22,
  fontWeight: 600,
  margin: 0,
};

const subtitle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.6,
  margin: "0 0 8px",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1px solid var(--border, #d8d2c6)",
  fontSize: 15,
  outline: "none",
  background: "var(--bg, #faf8f4)",
};

const errorStyle: React.CSSProperties = {
  color: "#c0392b",
  fontSize: 13,
};

"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hydrate } from "./store";

// Loads the entire knowledge base from the cloud once on mount and only then
// renders the app. Because the in-memory store is populated before children
// mount, every existing synchronous store read keeps working unchanged.
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/data", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const doc = await res.json();
        if (cancelled) return;
        hydrate(doc);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state === "error") {
    return (
      <div style={overlay}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, marginBottom: 12 }}>Could not load your data.</div>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state !== "ready") {
    return (
      <div style={overlay}>
        <div style={{ opacity: 0.6, fontSize: 15 }}>Loading your food knowledge…</div>
      </div>
    );
  }

  return <>{children}</>;
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--font-body, system-ui)",
};

"use client";

import { useEffect, useState } from "react";

let showToastFn: ((msg: string) => void) | null = null;

export function showToast(message: string) {
  showToastFn?.(message);
}

export function ToastProvider() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    showToastFn = (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 3000);
    };
    return () => { showToastFn = null; };
  }, []);

  if (!message) return null;
  return <div className="toast">{message}</div>;
}

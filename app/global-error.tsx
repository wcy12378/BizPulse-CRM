"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState, useSyncExternalStore } from "react";

import { copyToClipboard } from "@/lib/clipboard";

const readRecoveryLocale = (): "zh-CN" | "en-US" => {
  try { return localStorage.getItem("crm-ui-locale") === "en-US" ? "en-US" : "zh-CN"; } catch { return "zh-CN"; }
};
const subscribeRecoveryLocale = (notify: () => void) => {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
};
const defaultRecoveryLocale = (): "zh-CN" => "zh-CN";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [eventId, setEventId] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const locale = useSyncExternalStore(subscribeRecoveryLocale, readRecoveryLocale, defaultRecoveryLocale);
  const copy = locale === "en-US" ? {
    title: "This page needs to recover", description: "Retry this page. If the issue continues, keep the reference below for troubleshooting.",
    copied: "Copied", copy: "Copy reference", retry: "Retry", home: "Back to workspace",
  } : {
    title: "页面暂时无法加载", description: "请重试。如果问题持续，可保留下方参考编号用于排查。",
    copied: "已复制", copy: "复制参考编号", retry: "重试", home: "返回工作区",
  };

  useEffect(() => {
    try { setEventId(Sentry.captureException(error)); } catch { /* Error reporting cannot break recovery. */ }
  }, [error]);

  const displayId = eventId ?? error.digest ?? "—";

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          background: "#fafaf9",
          color: "#1c1917",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            width: "100%",
            background: "white",
            border: "1px solid #e7e5e4",
            borderRadius: 12,
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem", fontWeight: 600 }}>
            {copy.title}
          </h1>
          <p style={{ color: "#57534e", margin: "0 0 1.5rem" }}>
            {copy.description}
          </p>
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: "0.75rem",
              background: "#f5f5f4",
              padding: "0.5rem",
              borderRadius: 6,
              marginBottom: "1rem",
              wordBreak: "break-all",
            }}
          >
            ID: {displayId}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => {
                void copyToClipboard(displayId).then((ok) => {
                  if (ok) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }).catch(() => setCopied(false));
              }}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #d6d3d1",
                background: "white",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {copied ? copy.copied : copy.copy}
            </button>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #1c1917",
                background: "#1c1917",
                color: "white",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {copy.retry}
            </button>
          </div>
          <a href="/app" style={{ display: "inline-block", marginTop: "1rem", color: "inherit" }}>{copy.home}</a>
        </div>
      </body>
    </html>
  );
}

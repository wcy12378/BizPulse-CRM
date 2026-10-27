"use client";
import { useEffect, useRef, useState } from "react";
import { useAplicarIdioma, useIdioma, useT } from "@/lib/i18n/IdiomaProvider";
import { oportunidadesOffline } from "@/lib/demo/offline/fixtures";
import {
  chaveOffline,
  estadoInicial,
  restaurarOffline,
  serializarOffline,
  transicao,
  type AcaoOffline,
} from "@/lib/demo/offline/machine";
import { OfflineBoundary } from "./OfflineBoundary";

const phaseLabels = {
  idle: "等待检查",
  running: "检查进行中",
  evidence_conflict: "证据冲突",
  verified: "证据已核验",
  pending: "等待人工审批",
  applied: "已应用到本地",
  rejected: "人工已拒绝",
  undone: "已撤销",
  failed: "检查失败，可重试",
  version_conflict: "版本冲突，未写入",
} as const;
const buttonClass =
  "rounded-lg border border-[var(--color-border-strong)] px-3 py-2 text-sm transition hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-40";

export function OfflineWorkbench() {
  const t = useT();
  const idioma = useIdioma();
  const aplicarIdioma = useAplicarIdioma();
  const [state, setState] = useState(estadoInicial);
  const [selected, setSelected] = useState<string>(oportunidadesOffline[0].id);
  const [ready, setReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState("");
  const [online, setOnline] = useState(true);
  const current = state[selected]!;
  const opportunity = oportunidadesOffline.find((o) => o.id === selected)!;
  const active = useRef<string | null>(null);
  function dispatch(action: AcaoOffline) {
    setState((previous) => ({ ...previous, [selected]: transicao(previous[selected]!, action) }));
  }
  useEffect(() => {
    try {
      const restored = restaurarOffline(window.localStorage.getItem(chaveOffline));
      setState(restored.state);
      if (restored.recovered) setStorageNotice("本地存档损坏，已安全恢复虚构初始数据。");
    } catch {
      setStorageNotice("浏览器不允许存储，当前使用内存；刷新会重置。");
    }
    setReady(true);
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(chaveOffline, serializarOffline(state));
    } catch {
      setStorageNotice("浏览器不允许存储，当前使用内存；刷新会重置。");
    }
  }, [state, ready]);
  useEffect(() => {
    if (current.phase !== "running") return;
    active.current = selected;
    const controller = new AbortController();
    const timer = window.setInterval(() => {
      if (controller.signal.aborted || active.current !== selected) return;
      setState((previous) => ({ ...previous, [selected]: transicao(previous[selected]!, "tick") }));
    }, 650);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      active.current = null;
    };
  }, [selected, current.phase]);
  function select(id: string) {
    if (id === selected) return;
    active.current = null;
    setState((previous) => ({ ...previous, [selected]: transicao(previous[selected]!, "fail") }));
    setSelected(id);
  }
  const action = (kind: AcaoOffline, label: string, disabled = false) => (
    <button className={buttonClass} disabled={!ready || disabled} onClick={() => dispatch(kind)}>
      {t(label)}
    </button>
  );
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b bg-[var(--color-sidebar)] px-5 py-4 md:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-[var(--color-accent)]">
              {t("商脉 · 演示实验室")}
            </p>
            <h1 className="mt-1 text-xl font-semibold">{t("跨境 B2B 商机工作台")}</h1>
          </div>
          <div className="flex gap-2">
            <button
              className={buttonClass}
              aria-pressed={idioma === "zh-CN"}
              onClick={() => aplicarIdioma("zh-CN")}
            >
              中文
            </button>
            <button
              className={buttonClass}
              aria-pressed={idioma === "en-US"}
              onClick={() => aplicarIdioma("en-US")}
            >
              English
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1600px] p-5 md:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3 text-sm">
          <strong>{t("虚构数据 · 本地确定性演示 · 未调用模型")}</strong>
          <span>{t(online ? "已加载页面可离线操作" : "当前离线：已加载页面可继续操作")}</span>
        </div>
        {storageNotice && (
          <p role="status" className="mb-4 text-sm text-[var(--color-warning-fg)]">
            {t(storageNotice)}
          </p>
        )}
        <div className="grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
            <h2 className="px-2 py-3 text-sm font-semibold">{t("演示商机")} · 6</h2>
            <div className="space-y-2">
              {oportunidadesOffline.map((o) => (
                <button
                  key={o.id}
                  onClick={() => select(o.id)}
                  aria-pressed={selected === o.id}
                  className={`w-full rounded-lg border p-3 text-left ${selected === o.id ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-transparent hover:bg-[var(--color-surface-elevated)]"}`}
                >
                  <span className="block text-sm font-semibold">{o.company}</span>
                  <span className="mt-2 block text-xs text-[var(--color-text-muted)]">
                    {o.market} · USD {o.amount.toLocaleString("en-US")}
                  </span>
                  <span className="mt-1 block text-xs">{t(phaseLabels[state[o.id]!.phase])}</span>
                </button>
              ))}
            </div>
          </aside>
          <OfflineBoundary>
            <section className="space-y-5">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">{opportunity.email}</p>
                    <h2 className="mt-2 text-xl font-semibold">{opportunity.company}</h2>
                    <p className="mt-2 text-sm">
                      {idioma === "en-US" ? opportunity.productEn : opportunity.product} · USD{" "}
                      {opportunity.amount.toLocaleString("en-US")}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs">
                    {t(current.stage === "proposal" ? "报价阶段" : "资格核验阶段")} · v
                    {current.version}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {action(
                    "run",
                    current.phase === "failed" ? "重试本地检查" : "运行本地多专家检查",
                    current.stage !== "qualification" ||
                      !["idle", "failed", "rejected", "undone", "version_conflict"].includes(
                        current.phase,
                      ),
                  )}
                  <span role="status" aria-live="polite" className="text-sm">
                    {t(phaseLabels[current.phase])}
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded bg-[var(--color-surface-elevated)]">
                  <div
                    className="h-full bg-[var(--color-accent)] transition-all"
                    style={{ width: `${current.step * 25}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  {t("本地工具 4 步 · 模型调用 0 · 外发 0 · 业务数据库写入 0")}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="font-semibold">{t("证据核验")}</h3>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {t("虚构询盘要求报价与交期一致。旧邮件与最新确认单存在版本差异。")}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] p-4">
                    <p className="text-xs text-[var(--color-text-muted)]">{t("旧证据 · 不采用")}</p>
                    <p className="mt-2 font-medium">{t("报价 v1：USD 120 / 件")}</p>
                    <p className="mt-1 text-sm">{t("交期 v1：21 天")}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4">
                    <p className="text-xs">{t("最新确认单 · 建议保留")}</p>
                    <p className="mt-2 font-medium">{t("报价 v2：USD 128 / 件")}</p>
                    <p className="mt-1 text-sm">{t("交期 v3：28 天")}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {action("verify", "核验并保留新版", current.phase !== "evidence_conflict")}
                  {action("propose", "提议更新商机", current.phase !== "verified")}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="font-semibold">{t("人工决策")}</h3>
                <p className="mt-2 text-sm">
                  {t("提议：转入报价阶段，记录新版报价与交期，仅更新本地虚构商机。")}
                </p>
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                  {t("提议基于版本")} {current.expectedVersion ?? "—"} · {t("当前版本")}{" "}
                  {current.version}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {action("approve", "批准本地更新", current.phase !== "pending")}
                  {action("reject", "拒绝提议", current.phase !== "pending")}
                  {action("undo", "撤销本地更新", current.phase !== "applied")}
                </div>
                {current.phase === "version_conflict" && (
                  <p role="alert" className="mt-3 text-sm text-[var(--color-error-fg)]">
                    {t(
                      current.stage === "proposal"
                        ? "撤销遇到较新版本，原结果已保留。可重置虚构商机重新演练。"
                        : "检测到版本变化，操作未写入。重新检查后再决定。",
                    )}
                  </p>
                )}
              </div>
            </section>
          </OfflineBoundary>
          <OfflineBoundary>
            <aside className="space-y-5">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h2 className="text-sm font-semibold">{t("规则评分演示")}</h2>
                <p className="mt-3 text-4xl font-semibold">
                  {current.score}
                  <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                    / 100
                  </span>
                </p>
                <p className="mt-2 text-sm">Tier {current.score === 84 ? "A" : "B"}</p>
                <p className="mt-4 text-xs leading-6 text-[var(--color-text-muted)]">
                  {t(
                    "规则：基础 62 + 新版证据核验 12 + 人工批准 10 = 84。Judge 未运行；不代表真实模型评测或成交预测。",
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h2 className="text-sm font-semibold">{t("本地执行轨迹")}</h2>
                <ol aria-live="polite" className="mt-4 space-y-3 text-xs leading-5">
                  {current.events.length ? (
                    current.events.map((event, i) => (
                      <li
                        key={`${i}-${event}`}
                        className="border-l-2 border-[var(--color-accent-200)] pl-3"
                      >
                        <span className="mr-2 text-[var(--color-text-muted)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {t(event)}
                      </li>
                    ))
                  ) : (
                    <li className="text-[var(--color-text-muted)]">
                      {t("选择商机并运行检查后显示轨迹。")}
                    </li>
                  )}
                </ol>
              </div>
              <details className="rounded-xl border border-[var(--color-border)] p-4 text-xs">
                <summary className="cursor-pointer font-medium">{t("恢复与并发演练")}</summary>
                <p className="my-3 leading-5">
                  {t(
                    "仅模拟当前浏览器内的版本变化，不代表数据库并发事务。切换商机会中断正在进行的本地检查。",
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {action("reset", "重置当前虚构商机")}
                  {action("fail", "模拟检查失败", current.phase !== "running")}
                  {action(
                    "concurrent",
                    "模拟并发版本变化",
                    !["pending", "applied"].includes(current.phase),
                  )}
                </div>
              </details>
            </aside>
          </OfflineBoundary>
        </div>
        <footer className="mt-6 text-xs text-[var(--color-text-muted)]">
          {t("演示状态仅存于当前浏览器。不会发送邮件、调用模型或修改真实业务。")}
        </footer>
      </div>
    </main>
  );
}

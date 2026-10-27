import { z } from "zod";
import { oportunidadesOffline } from "./fixtures";

export const fasesOffline = [
  "idle",
  "running",
  "evidence_conflict",
  "verified",
  "pending",
  "applied",
  "rejected",
  "undone",
  "failed",
  "version_conflict",
] as const;
const eventosOffline = [
  "并发版本已变化",
  "开始本地多专家检查",
  "买家专家：已读取虚构询盘",
  "报价专家：已读取报价版本",
  "交付专家：已读取交期版本",
  "审查专家：发现旧版证据冲突",
  "模拟检查失败，可重试",
  "核验完成：保留报价v2与交期v3",
  "提议已生成，等待人工决定",
  "人工已拒绝，未更新商机",
  "版本冲突，未应用；请重新检查",
  "人工批准：仅本地商机已更新",
  "撤销冲突，未覆盖较新版本",
  "本地更新已撤销",
  "刷新中断了检查，可重试",
] as const;
const registroSchema = z
  .object({
    phase: z.enum(fasesOffline),
    version: z.number().int().min(1).max(1000000),
    expectedVersion: z.number().int().min(1).max(1000000).nullable(),
    appliedVersion: z.number().int().min(1).max(1000000).nullable(),
    step: z.number().int().min(0).max(4),
    score: z.union([z.literal(62), z.literal(84)]),
    stage: z.enum(["qualification", "proposal"]),
    events: z.array(z.enum(eventosOffline)).max(30),
  })
  .strict();
export type RegistroOffline = z.infer<typeof registroSchema>;
export type EstadoOffline = Record<string, RegistroOffline>;
export type AcaoOffline =
  | "run"
  | "tick"
  | "verify"
  | "propose"
  | "approve"
  | "reject"
  | "undo"
  | "fail"
  | "concurrent"
  | "reset";
export const chaveOffline = "crm.offline-b2b.v1";
export function estadoInicial(): EstadoOffline {
  return Object.fromEntries(
    oportunidadesOffline.map(({ id }) => [
      id,
      {
        phase: "idle",
        version: 1,
        expectedVersion: null,
        appliedVersion: null,
        step: 0,
        score: 62,
        stage: "qualification",
        events: [],
      },
    ]),
  );
}
function evento(r: RegistroOffline, event: (typeof eventosOffline)[number]): RegistroOffline {
  return { ...r, events: [...r.events, event].slice(-30) };
}
/** Pure conditional transitions: repeated approval and stale writes are no-ops. */
export function transicao(r: RegistroOffline, action: AcaoOffline): RegistroOffline {
  if (action === "reset") return Object.values(estadoInicial())[0]!;
  if (action === "concurrent" && ["pending", "applied"].includes(r.phase) && r.version < 999999)
    return evento({ ...r, version: r.version + 1 }, "并发版本已变化");
  if (
    action === "run" &&
    r.stage === "qualification" &&
    r.version < 999998 &&
    ["idle", "failed", "rejected", "undone", "version_conflict"].includes(r.phase)
  )
    return evento(
      { ...r, phase: "running", step: 0, expectedVersion: r.version, appliedVersion: null },
      "开始本地多专家检查",
    );
  if (action === "tick" && r.phase === "running") {
    const step = r.step + 1;
    return evento(
      { ...r, step, phase: step === 4 ? "evidence_conflict" : "running" },
      eventosOffline[step + 1]!,
    );
  }
  if (action === "fail" && r.phase === "running")
    return evento({ ...r, phase: "failed" }, "模拟检查失败，可重试");
  if (action === "verify" && r.phase === "evidence_conflict")
    return evento({ ...r, phase: "verified" }, "核验完成：保留报价v2与交期v3");
  if (action === "propose" && r.phase === "verified")
    return evento({ ...r, phase: "pending" }, "提议已生成，等待人工决定");
  if (action === "reject" && r.phase === "pending")
    return evento({ ...r, phase: "rejected" }, "人工已拒绝，未更新商机");
  if (action === "approve" && r.phase === "pending") {
    if (r.version !== r.expectedVersion)
      return evento({ ...r, phase: "version_conflict" }, "版本冲突，未应用；请重新检查");
    return evento(
      {
        ...r,
        phase: "applied",
        version: r.version + 1,
        appliedVersion: r.version + 1,
        stage: "proposal",
        score: 84,
      },
      "人工批准：仅本地商机已更新",
    );
  }
  if (action === "undo" && r.phase === "applied") {
    if (r.version !== r.appliedVersion)
      return evento({ ...r, phase: "version_conflict" }, "撤销冲突，未覆盖较新版本");
    return evento(
      {
        ...r,
        phase: "undone",
        version: r.version + 1,
        stage: "qualification",
        score: 62,
        appliedVersion: null,
      },
      "本地更新已撤销",
    );
  }
  return r;
}
const persistidoSchema = z
  .object({ schema: z.literal(1), records: z.record(z.string(), registroSchema) })
  .strict();
export function restaurarOffline(raw: string | null): { state: EstadoOffline; recovered: boolean } {
  if (raw === null) return { state: estadoInicial(), recovered: false };
  try {
    if (raw.length > 50000) throw new Error("oversized save");
    const parsed = persistidoSchema.parse(JSON.parse(raw));
    const keys = oportunidadesOffline.map((o) => o.id);
    if (
      Object.keys(parsed.records).length !== keys.length ||
      keys.some((id) => !parsed.records[id])
    )
      throw new Error("fixture mismatch");
    for (const r of Object.values(parsed.records)) {
      if (
        (r.phase === "applied" &&
          (r.stage !== "proposal" || r.score !== 84 || r.appliedVersion === null)) ||
        (r.phase === "running" && r.step >= 4)
      )
        throw new Error("invalid phase");
      if (
        (r.stage === "proposal") !== (r.score === 84) ||
        (r.stage === "proposal" && !["applied", "version_conflict"].includes(r.phase))
      )
        throw new Error("invalid result");
      if (r.expectedVersion !== null && r.expectedVersion > r.version)
        throw new Error("future proposal");
      if (r.appliedVersion !== null && r.appliedVersion > r.version)
        throw new Error("future update");
      if (
        [
          "evidence_conflict",
          "verified",
          "pending",
          "applied",
          "rejected",
          "undone",
          "version_conflict",
        ].includes(r.phase) &&
        (r.step !== 4 || r.expectedVersion === null)
      )
        throw new Error("missing review");
      // A refresh interrupts simulated work explicitly; it never manufactures completion.
      if (r.phase === "running") {
        r.phase = "failed";
        r.events = evento(r, "刷新中断了检查，可重试").events;
      }
    }
    return { state: parsed.records, recovered: false };
  } catch {
    return { state: estadoInicial(), recovered: true };
  }
}
export function serializarOffline(state: EstadoOffline): string {
  return JSON.stringify({ schema: 1, records: state });
}

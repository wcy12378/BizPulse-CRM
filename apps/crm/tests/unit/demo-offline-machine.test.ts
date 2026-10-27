import { describe, expect, it } from "vitest";
import catalog from "@/lib/i18n/traducoes/demo-offline-extra.json";
import {
  estadoInicial,
  restaurarOffline,
  serializarOffline,
  transicao,
  type RegistroOffline,
} from "@/lib/demo/offline/machine";

function pending(): RegistroOffline {
  let r = transicao(Object.values(estadoInicial())[0]!, "run");
  for (let i = 0; i < 4; i++) r = transicao(r, "tick");
  return transicao(transicao(r, "verify"), "propose");
}
describe("isolated deterministic offline workbench", () => {
  it("requires evidence verification and explicit approval before updating", () => {
    let r = transicao(Object.values(estadoInicial())[0]!, "run");
    expect(transicao(r, "approve")).toBe(r);
    for (let i = 0; i < 4; i++) r = transicao(r, "tick");
    expect(r.phase).toBe("evidence_conflict");
    expect(transicao(r, "propose")).toBe(r);
    r = transicao(transicao(r, "verify"), "propose");
    expect(r.score).toBe(62);
    const applied = transicao(r, "approve");
    expect(applied).toMatchObject({ phase: "applied", score: 84, stage: "proposal", version: 2 });
    expect(transicao(applied, "approve")).toBe(applied);
    expect(transicao(applied, "undo")).toMatchObject({
      phase: "undone",
      score: 62,
      stage: "qualification",
      version: 3,
    });
  });
  it("rejects without mutation and retries failures", () => {
    expect(transicao(pending(), "reject")).toMatchObject({
      phase: "rejected",
      score: 62,
      version: 1,
    });
    const failed = transicao(transicao(Object.values(estadoInicial())[0]!, "run"), "fail");
    expect(transicao(failed, "run")).toMatchObject({ phase: "running", step: 0 });
  });
  it("prevents stale approval and stale undo from overwriting newer versions", () => {
    const stale = transicao(pending(), "concurrent");
    expect(transicao(stale, "approve")).toMatchObject({
      phase: "version_conflict",
      version: 2,
      score: 62,
    });
    const applied = transicao(pending(), "approve");
    expect(transicao(transicao(applied, "concurrent"), "undo")).toMatchObject({
      phase: "version_conflict",
      version: 3,
      score: 84,
      stage: "proposal",
    });
  });
  it("validates persisted JSON and recovers corrupt or unknown fixture state", () => {
    for (const raw of ["{", "null", "{}", '{"schema":1,"records":{"unknown":{}}}'])
      expect(restaurarOffline(raw).recovered).toBe(true);
    const state = estadoInicial();
    expect(restaurarOffline(serializarOffline(state))).toEqual({ state, recovered: false });
    const key = Object.keys(state)[0]!;
    state[key] = transicao(state[key]!, "run");
    expect(restaurarOffline(serializarOffline(state)).state[key]!.phase).toBe("failed");
    const invalid = JSON.parse(serializarOffline(estadoInicial()));
    invalid.records[key].score = 999;
    expect(restaurarOffline(JSON.stringify(invalid)).recovered).toBe(true);
    const untrusted = JSON.parse(serializarOffline(estadoInicial()));
    untrusted.records[key].events = ["arbitrary untrusted text"];
    expect(restaurarOffline(JSON.stringify(untrusted)).recovered).toBe(true);
    expect(restaurarOffline(" ".repeat(50001)).recovered).toBe(true);
  });
  it("keeps opportunity state isolated and bounds local trace history", () => {
    let r = pending();
    for (let i = 0; i < 60; i++) r = transicao(r, "concurrent");
    expect(r.events).toHaveLength(30);
    expect(Object.values(estadoInicial())[1]).toMatchObject({ phase: "idle", version: 1 });
  });
  it("does not silently restart an applied result after an undo conflict", () => {
    const conflict = transicao(transicao(transicao(pending(), "approve"), "concurrent"), "undo");
    expect(transicao(conflict, "run")).toBe(conflict);
    expect(transicao(conflict, "reset")).toMatchObject({
      phase: "idle",
      stage: "qualification",
      version: 1,
      score: 62,
    });
  });
  it("restores approved local results and translates every trace in both languages", () => {
    const state = estadoInicial();
    const key = Object.keys(state)[0]!;
    state[key] = transicao(pending(), "approve");
    const restored = restaurarOffline(serializarOffline(state));
    expect(restored.recovered).toBe(false);
    expect(restored.state[key]).toMatchObject({ phase: "applied", score: 84, version: 2 });
    const dictionary = catalog as Record<string, { "zh-CN": string; "en-US": string }>;
    for (const event of state[key]!.events) {
      expect(dictionary[event]?.["zh-CN"]).toBe(event);
      expect(dictionary[event]?.["en-US"]).toBeTruthy();
      expect(dictionary[event]?.["en-US"]).not.toMatch(/[\u4e00-\u9fff]/);
    }
  });
});


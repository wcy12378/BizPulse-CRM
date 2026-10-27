import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const state = vi.hoisted(() => ({ demo: true, model: true }));
vi.mock("@/lib/i18n/page-metadata", () => ({ metadataDaPagina: () => ({}) }));
vi.mock("@/lib/auth/server", () => ({
  requireAuth: async () => ({ idioma: "zh-CN" }),
  resolveActiveOrg: async () => ({ orgId: "demo-org", role: "admin" }),
}));
vi.mock("@/lib/ai/agents/ensure-builtins", () => ({ ensureBuiltinAgents: async () => {} }));
vi.mock("@/lib/ai/agents/builtins", () => ({ BUILTIN_AGENTS: [] }));
vi.mock("@/lib/demo/config", () => ({ isDemoModeEnabled: () => state.demo }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => {
    const query = {
      select: () => query, eq: () => query, is: () => query,
      order: async () => ({ data: [], error: null }),
      maybeSingle: async () => ({ data: { settings: { llm: state.model ? { provider: "openai", default_model: "configured-route" } : {} } } }),
    };
    return query;
  } }),
}));
vi.mock("@/app/app/ai/workbench/_components/AgentCrmWorkbench", () => ({ AgentCrmWorkbench: () => <div>Workbench</div> }));
import Page from "@/app/app/ai/workbench/page";

afterEach(() => { cleanup(); state.demo = true; state.model = true; });
describe("local demo entry visibility", () => {
  it("keeps the offline entry reachable when a model route exists without proving credentials", async () => {
    render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("link", { name: "打开独立离线演示（虚构数据，不调用模型）" }).getAttribute("href")).toBe("/demo/offline");
    expect(screen.queryByText("尚未连接真实模型，内置智能体可先查看。")).toBeNull();
  });
  it("does not expose the demo entry outside the local demo gate", async () => {
    state.demo = false;
    render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("retains the unconfigured model notice", async () => {
    state.model = false;
    render(await Page({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("尚未连接真实模型，内置智能体可先查看。")).toBeTruthy();
  });
});

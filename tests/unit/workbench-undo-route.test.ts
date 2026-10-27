import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  load: vi.fn(), deps: vi.fn(), build: vi.fn(), event: vi.fn(), execute: vi.fn(), cleanup: vi.fn(),
  state: "executed", failStatus: false, failRelease: false,
}));
vi.mock("@/lib/auth/require-role", () => ({ requireRole: async () => ({ ok: true, org: { orgId: "org" }, user: { id: "user" } }) }));
vi.mock("@/lib/impersonate/support", () => ({ requireSupportWrite: async () => null }));
vi.mock("@/lib/audit", () => ({ audit: vi.fn().mockResolvedValue(undefined) }));
vi.mock("@/lib/ai/agents/workbench-events", () => ({ appendWorkbenchEvent: mocks.event }));
vi.mock("@/lib/agent-engine/agent/request-deps", () => ({ requestTurnDeps: mocks.deps }));
vi.mock("@/lib/agent-engine/agent/agent-config", () => ({ loadAgentVersionConfig: mocks.load }));
vi.mock("@/lib/agent-engine/edge/crm/mcp-tools", () => ({ buildMcpTurnTools: mocks.build }));
vi.mock("@/lib/agent-engine/db/request-pool", () => ({ getRequestPool: () => ({}) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from(table: string) {
  let update: Record<string, unknown> | undefined;
  const filters: Record<string, unknown> = {};
  const result = () => {
    if (update) {
      if (filters.status !== mocks.state) return { data: null, error: null };
      if (mocks.failRelease && update.status === "executed") return { data: null, error: { message: "db unavailable" } };
      if (mocks.failStatus && update.status === "undone") return { data: null, error: { message: "db unavailable" } };
      mocks.state = update.status as string;
      return { data: { id: "proposal" }, error: null };
    }
    return { data: table === "ai_workbench_runs"
      ? { agent_id: "agent", runtime_state: { versionId: "version" }, scope: {} }
      : { tool_name: "crm_update_lead", status: mocks.state, compensation_args: { lead_id: "lead", title: "old" } }, error: null };
  };
  const query = {
    select: () => query,
    update: (value: Record<string, unknown>) => { update = value; return query; },
    eq: (key: string, value: unknown) => { filters[key] = value; return query; },
    maybeSingle: async () => result(),
    then: (resolve: (value: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve),
  };
  return query;
} }) }));
import { POST } from "@/app/api/v1/ai/workbench/runs/[id]/proposals/[proposalId]/undo/route";
const undo = () => POST({} as NextRequest, { params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111", proposalId: "22222222-2222-2222-2222-222222222222" }) });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.state = "executed";
  mocks.failStatus = false;
  mocks.failRelease = false;
  mocks.load.mockResolvedValue({ toolIds: ["crm_update_lead"] });
  mocks.deps.mockReturnValue({ crmCfg: {}, log: {} });
  mocks.build.mockResolvedValue({ tools: { crm_update_lead: { execute: mocks.execute } }, cleanup: mocks.cleanup });
  mocks.execute.mockResolvedValue({ success: true });
});

describe("workbench undo failure boundaries", () => {
  it.each(["load", "deps", "build"] as const)("releases the claim when %s initialization fails before writing", async (stage) => {
    mocks[stage].mockImplementationOnce(() => { throw new Error("initialization failed"); });
    expect((await undo()).status).toBe(503);
    expect(mocks.state).toBe("executed");
    expect(mocks.execute).not.toHaveBeenCalled();
    expect((await undo()).status).toBe(200);
  });

  it.each([2, 3])("returns confirmed success when post-write event %s fails", async (call) => {
    mocks.event.mockImplementation(() => { if (mocks.event.mock.calls.length === call) throw new Error("event failed"); });
    expect((await undo()).status).toBe(200);
    expect(mocks.state).toBe("undone");
    expect((await undo()).status).toBe(409);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });

  it("releases the claim if the started event fails before tool execution", async () => {
    mocks.event.mockRejectedValueOnce(new Error("event failed"));
    expect((await undo()).status).toBe(503);
    expect(mocks.state).toBe("executed");
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.cleanup).toHaveBeenCalledTimes(1);
  });

  it("does not advertise retry when claim recovery cannot be confirmed", async () => {
    mocks.failRelease = true;
    mocks.load.mockRejectedValueOnce(new Error("initialization failed"));
    const response = await undo();
    expect(response.status).toBe(409);
    expect(JSON.stringify(await response.json())).not.toContain("可以重试");
    expect(mocks.state).toBe("undoing");
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("blocks replay after a tool exception with an uncertain write outcome", async () => {
    mocks.execute.mockRejectedValueOnce(new Error("connection lost after write"));
    const response = await undo();
    expect(response.status).toBe(409);
    expect(JSON.stringify(await response.json())).not.toContain("撤销未应用");
    expect(mocks.state).toBe("undo_failed");
    expect((await undo()).status).toBe(409);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });

  it("does not release the claim after tool success if status persistence fails", async () => {
    mocks.failStatus = true;
    expect((await undo()).status).toBe(409);
    expect(mocks.state).toBe("undo_failed");
    expect((await undo()).status).toBe(409);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });

  it("allows only one concurrent undo through the executed CAS", async () => {
    const responses = await Promise.all([undo(), undo()]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    expect(mocks.execute).toHaveBeenCalledTimes(1);
  });

  it("keeps success when cleanup fails after the confirmed status", async () => {
    mocks.cleanup.mockRejectedValueOnce(new Error("cleanup failed"));
    expect((await undo()).status).toBe(200);
    expect(mocks.state).toBe("undone");
  });
});

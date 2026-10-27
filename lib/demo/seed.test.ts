import { beforeEach, describe, expect, it, vi } from "vitest";
import { B2B_FIXTURES } from "./fixtures";

const mocks = vi.hoisted(() => ({
  enabled: true,
  rows: {} as Record<string, Record<string, unknown>[]>,
  readError: false,
  insertFailure: false,
  createUser: vi.fn(),
  updateUser: vi.fn(),
  lock: vi.fn(async (_slug: string, work: () => Promise<unknown>) => work()),
}));
vi.mock("./config", () => ({ DEMO_EMAIL: "demo@example.invalid", DEMO_PASSWORD: "unused", DEMO_ORG_SLUG: "isolated-demo", isDemoModeEnabled: () => mocks.enabled }));
vi.mock("./seed-lock", () => ({ withDemoSeedLock: mocks.lock }));
vi.mock("@/lib/ai/agents/ensure-builtins", () => ({ ensureBuiltinAgents: vi.fn() }));
vi.mock("@/lib/channels/demo-session", () => ({ ensureStoppedDemoChannelSession: vi.fn(async () => "channel") }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({
  auth: { admin: { listUsers: async () => ({ data: { users: [{ id: "demo-user", email: "demo@example.invalid", user_metadata: { demo: true } }] }, error: null }), createUser: mocks.createUser, updateUserById: mocks.updateUser } },
  from: (table: string) => {
    const filters: [string, unknown][] = [];
    let inserting: Record<string, unknown> | undefined;
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters.push([key, value]); return query; },
      insert: (payload: Record<string, unknown>) => { inserting = payload; return query; },
      maybeSingle: async () => ({ data: mocks.rows[table]?.find((row) => filters.every(([key, value]) => row[key] === value)) ?? null, error: mocks.readError ? { message: "read failed" } : null }),
      single: async () => { const row = { id: `${table}-${mocks.rows[table]?.length ?? 0}`, ...inserting }; (mocks.rows[table] ??= []).push(row); return { data: row, error: null }; },
      then: (resolve: (value: unknown) => void) => { if (mocks.insertFailure || (inserting?.status === "lost" && inserting?.lost_reason !== "price")) { resolve({ error: { code: "22023", message: "sensitive detail" } }); return; } if (inserting) (mocks.rows[table] ??= []).push(inserting); resolve({ error: null }); },
    };
    return query;
  },
}) }));
import { ensureDemoData } from "./seed";

describe("B2B demo seed data protection", () => {
  beforeEach(() => {
    mocks.enabled = true; mocks.readError = false; mocks.insertFailure = false; vi.clearAllMocks();
    mocks.rows = {
      organizations: [{ id: "demo-org", slug: "isolated-demo", created_by: "demo-user" }],
      user_organizations: [{ id: "membership", organization_id: "demo-org", user_id: "demo-user", revoked_at: null }],
      crm_pipelines: [{ id: "pipeline", organization_id: "demo-org", slug: "demo-b2b-export", is_default: true }],
    };
  });
  it("fails before obtaining the lock when demo mode is disabled", async () => {
    mocks.enabled = false;
    await expect(ensureDemoData()).rejects.toThrow("本地演示模式");
    expect(mocks.lock).not.toHaveBeenCalled();
  });
  it("keeps edited fixture identity and values on repeat initialization", async () => {
    await ensureDemoData();
    expect(mocks.rows.contacts).toHaveLength(8);
    expect(mocks.rows.crm_leads).toHaveLength(8);
    expect(mocks.rows.crm_tasks).toHaveLength(8);
    expect(mocks.rows.crm_leads.find((lead) => lead.status === "lost")?.lost_reason).toBe("price");
    const contact = mocks.rows.contacts[0]; const lead = mocks.rows.crm_leads[0]; const task = mocks.rows.crm_tasks[0];
    contact.email = "edited@example.invalid"; lead.title = "用户改名"; lead.stage_id = "user-stage";
    lead.value_cents = 123; task.status = "done"; task.due_date = "2030-01-01";
    await ensureDemoData();
    expect(mocks.rows.contacts).toHaveLength(8); expect(mocks.rows.crm_leads).toHaveLength(8); expect(mocks.rows.crm_tasks).toHaveLength(8);
    expect(contact.email).toBe("edited@example.invalid"); expect(lead.stage_id).toBe("user-stage");
    expect(lead.title).toBe("用户改名"); expect(lead.value_cents).toBe(123); expect(task.due_date).toBe("2030-01-01");
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
  it("refuses an organization owned by someone else", async () => {
    mocks.rows.organizations[0].created_by = "real-owner";
    await expect(ensureDemoData()).rejects.toThrow("不属于演示账号");
    expect(mocks.rows.contacts).toBeUndefined();
  });
  it("does not interpret query errors as missing records", async () => {
    mocks.readError = true;
    await expect(ensureDemoData()).rejects.toThrow("无法读取演示工作区");
    expect(mocks.rows.contacts).toBeUndefined();
  });
  it("preserves safe PostgREST codes without raw database details", async () => {
    mocks.insertFailure = true;
    await expect(ensureDemoData()).rejects.toMatchObject({ cause: { code: "22023" } });
    await expect(ensureDemoData()).rejects.not.toThrow("sensitive detail");
  });
  it("contains plausible fictional USD line items", () => {
    expect(B2B_FIXTURES).toHaveLength(8);
    for (const fixture of B2B_FIXTURES) {
      expect(fixture.company).toContain("fictional"); expect(fixture.quantity).toBeGreaterThan(0);
      expect(fixture.unitPrice).toBeGreaterThan(0); expect(fixture.leadDays).toBeGreaterThan(14);
    }
  });
});



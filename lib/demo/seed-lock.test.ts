import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ connect: vi.fn(), query: vi.fn(), end: vi.fn(), on: vi.fn() }));
vi.mock("pg", () => ({ default: { Client: class { connect = mocks.connect; query = mocks.query; end = mocks.end; on = mocks.on; } } }));
import { withDemoSeedLock } from "./seed-lock";

describe("demo seed cross-process advisory lock", () => {
  beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("SUPABASE_DB_URL", "postgresql://demo:unused@127.0.0.1:5432/postgres"); });
  it("acquires a PostgreSQL session lock and releases it on work failure", async () => {
    await expect(withDemoSeedLock("demo", async () => { throw new Error("fixture failed"); })).rejects.toThrow("fixture failed");
    expect(mocks.query.mock.calls[0][0]).toContain("lock_timeout = '5s'");
    expect(mocks.query.mock.calls[1][0]).toContain("pg_advisory_lock");
    expect(mocks.query.mock.calls[2][0]).toContain("pg_advisory_unlock");
    expect(mocks.end).toHaveBeenCalledOnce();
  });
  it("does not seed if lock acquisition times out", async () => {
    mocks.query.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("lock timeout"));
    const work = vi.fn();
    await expect(withDemoSeedLock("demo", work)).rejects.toThrow("lock timeout");
    expect(work).not.toHaveBeenCalled(); expect(mocks.end).toHaveBeenCalledOnce();
  });
  it("rejects remote database connections before connect", async () => {
    vi.stubEnv("SUPABASE_DB_URL", "postgresql://demo:unused@db.example.invalid:5432/postgres");
    await expect(withDemoSeedLock("demo", vi.fn())).rejects.toThrow("本地 PostgreSQL");
    expect(mocks.connect).not.toHaveBeenCalled();
  });
});

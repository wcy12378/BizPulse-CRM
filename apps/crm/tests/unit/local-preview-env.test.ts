import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("NEXT_PHASE", "phase-production-server");
  vi.stubEnv("CRM_LOCAL_PREVIEW", "1");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  for (const key of ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "INTERNAL_SECRET", "CPF_ENCRYPTION_KEY", "WAHA_BYO_ENCRYPTION_KEY", "AI_CRED_AES_KEY", "SUPABASE_DB_URL"]) vi.stubEnv(key, "local-test-configuration");
  for (const key of ["WAHA_API_BASE_URL", "WAHA_API_KEY", "WAHA_WEBHOOK_BASE_URL", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"]) vi.stubEnv(key, undefined);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

it("boots explicit loopback production preview without optional channel and Redis bindings", async () => {
  const { env } = await import("@/lib/env");
  expect(env.WAHA_API_KEY).toBe("");
  expect(env.UPSTASH_REDIS_REST_URL).toBe("");
  expect(env.SUPABASE_SERVICE_ROLE_KEY).toBe("local-test-configuration");
});
it("still rejects missing core authentication configuration", async () => {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
  await expect(import("@/lib/env")).rejects.toThrow();
});
it("does not relax public deployments even when a preview flag is left behind", async () => {
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://crm.example.com");
  await expect(import("@/lib/env")).rejects.toThrow();
});

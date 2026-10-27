import { expect, it } from "vitest";
import { realtimeEnabled } from "./local-capability";
it("uses existing polling fallback for local profiles without a Realtime service", () => {
  expect(realtimeEnabled({ localPreview: "1", supabaseUrl: "http://127.0.0.1:54321" })).toBe(false);
  expect(realtimeEnabled({ localDev: "1", supabaseUrl: "http://[::1]:54321" })).toBe(false);
});
it("preserves deployed realtime and permits an explicitly configured local realtime service", () => {
  expect(realtimeEnabled({ localDev: "1", supabaseUrl: "https://project.supabase.co" })).toBe(true);
  expect(realtimeEnabled({ override: "true", localPreview: "1", supabaseUrl: "http://localhost:54321" })).toBe(true);
});

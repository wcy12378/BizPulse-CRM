import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FeishuBinding } from "./_feishu-binding";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";

afterEach(() => vi.unstubAllGlobals());

describe("Feishu identity binding in the profile", () => {
  it("translates fixed status and action labels in English", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {
        available: true, tenantBound: true, userBound: true, canClaimTenant: false,
      } }),
    }));
    render(<IdiomaProvider locale="en-US"><FeishuBinding /></IdiomaProvider>);
    expect(await screen.findByText("Current Feishu account bound")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Refresh binding status" })).toBeInTheDocument();
    expect(screen.queryByText("已绑定当前飞书账号")).toBeNull();
  });
  it("shows a one-time private-DM instruction and clears it after binding", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: {
        available: true, tenantBound: true, userBound: false, canClaimTenant: false,
      } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: {
        message: "CRM-BIND test-token", expiresAt: "2026-09-30T10:10:00Z",
      } }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: {
        available: true, tenantBound: true, userBound: true, canClaimTenant: false,
      } }) });
    vi.stubGlobal("fetch", fetch);
    render(<FeishuBinding />);
    fireEvent.click(await screen.findByRole("button", { name: "绑定我的飞书账号" }));
    expect(await screen.findByText("CRM-BIND test-token")).toBeInTheDocument();
    expect(JSON.parse(String(fetch.mock.calls[1]?.[1]?.body))).toEqual({ kind: "member" });
    fireEvent.click(screen.getByRole("button", { name: "刷新绑定状态" }));
    await waitFor(() => expect(screen.getByText("已绑定当前飞书账号")).toBeInTheDocument());
    expect(screen.queryByText("CRM-BIND test-token")).toBeNull();
  });
});

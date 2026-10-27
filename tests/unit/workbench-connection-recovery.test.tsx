import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AgentCrmWorkbench } from "@/app/app/ai/workbench/_components/AgentCrmWorkbench";

const agents = [{ id: "a1", name: "Agent", description: null, builtinKey: "crm_intelligence", scenarios: [] }];
const record = { id: "r1", agent_id: "a1", task: "检查商机", mode: "inspect", status: "running", final_text: null, error_code: null, created_at: "2026-10-01T00:00:00Z", events: [], proposals: [], specialists: [] };
const json = (data: unknown) => new Response(JSON.stringify({ data }));
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
function submit() {
  fireEvent.change(screen.getByLabelText("给 Agent 的任务"), { target: { value: "检查商机" } });
  fireEvent.click(screen.getByRole("button", { name: "运行 Agent" }));
}

describe("workbench connection recovery", () => {
  it("aborts the live SSE and cancels its reader when unmounted", async () => {
    const cancel = vi.fn(async () => {});
    const releaseLock = vi.fn();
    let signal: AbortSignal | undefined;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/objects?")) return json([]);
      if (url.endsWith("/evaluation")) return json(null);
      if (url.includes("/events?")) {
        signal = init?.signal as AbortSignal;
        return { ok: true, body: { getReader: () => ({
          read: () => new Promise((_, reject) => signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")))),
          cancel,
          releaseLock,
        }) } } as unknown as Response;
      }
      if (url.endsWith("/runs")) return json(init?.method === "POST" ? { run_id: "r1" } : []);
      return json(record);
    });
    vi.stubGlobal("fetch", fetchMock);
    const view = render(<AgentCrmWorkbench agents={agents} modelConfigured canCopy />);
    submit();
    await waitFor(() => expect(signal).toBeDefined());
    view.unmount();
    await act(async () => {});
    expect(signal!.aborted).toBe(true);
    expect(cancel).toHaveBeenCalledOnce();
    expect(releaseLock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("/events?"))).toHaveLength(1);
  });

  it("keeps an HTTP history failure visible and permits a read-only retry", async () => {
    let fail = true;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("/objects?")) return json([]);
      return fail ? new Response("{}", { status: 503 }) : json([]);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<AgentCrmWorkbench agents={agents} modelConfigured canCopy />);
    await screen.findByText("无法读取最近运行，请刷新重试。");
    fail = false;
    fireEvent.click(screen.getByRole("button", { name: "重试读取历史" }));
    await waitFor(() => expect(screen.queryByText("无法读取最近运行，请刷新重试。")).not.toBeInTheDocument());
  });

  it("stops reconnecting after three failed SSE requests and retains the run", async () => {
    let attempts = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/objects?")) return json([]);
      if (url.endsWith("/evaluation")) return json(null);
      if (url.includes("/events?")) { attempts += 1; return new Response("{}", { status: 503 }); }
      if (url.endsWith("/runs")) return json(init?.method === "POST" ? { run_id: "r1" } : []);
      return json(record);
    }));
    const view = render(<AgentCrmWorkbench agents={agents} modelConfigured canCopy />);
    vi.useFakeTimers();
    await act(async () => { submit(); });
    expect(attempts).toBe(1);
    await act(async () => { await vi.advanceTimersByTimeAsync(3_100); });
    expect(attempts).toBe(3);
    expect(screen.getByText("连接暂不可用，运行记录已保留。请重试读取状态。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重试读取状态" })).toBeEnabled();
    expect(screen.getByLabelText("给 Agent 的任务")).toBeDisabled();
    view.unmount();
  });
});

import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type * as Dictionary from "@/lib/i18n/dicionario";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import extra from "@/lib/i18n/traducoes/workbench-extra.json";
import { HomeDashboard } from "@/app/app/_components/HomeDashboard";
import { AgentCrmWorkbench } from "./AgentCrmWorkbench";
import { MissionSendControl } from "./MissionSendControl";
import { BUILTIN_AGENTS } from "@/lib/ai/agents/builtins";

vi.mock("@/lib/ui/icons", () => ({
  ArrowRight: () => null,
  ArrowSquareOut: () => null,
  CalendarBlank: () => null,
  CheckCircle: () => null,
  ClockCountdown: () => null,
  CurrencyDollar: () => null,
  Robot: () => null,
  Users: () => null,
}));
// Exercise this shard before the parent task merges it into the shared catalog.
vi.mock("@/lib/i18n/dicionario", async (importOriginal) => {
  const original = await importOriginal<typeof Dictionary>();
  return {
    ...original,
    traduzir: (text: string, locale: "zh-CN" | "en-US") =>
      (extra as Record<string, Partial<Record<"zh-CN" | "en-US", string>>>)[text]?.[locale] ??
      original.traduzir(text, locale),
  };
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("renders dashboard labels, dates and statuses in English while retaining customer data", () => {
  render(
    <IdiomaProvider locale="en-US">
      <HomeDashboard
        displayName="客户甲"
        workspaceName="客户工作区"
        data={{
          contactCount: 2,
          activeLeadCount: 1,
          openTaskCount: 1,
          activeLeadValues: [{ currency: "USD", valueCents: 10000 }],
          agentRuns: [
            {
              id: "run",
              agentName: "客户 Agent",
              task: "客户输入的任务",
              status: "completed",
              createdAt: "2026-10-25T10:00:00Z",
            },
          ],
          tasks: [
            {
              id: "task",
              title: "客户待办",
              dueDate: null,
              priority: "urgent",
              status: "in_progress",
            },
          ],
          pipelineName: "客户漏斗",
          stages: [{ id: "stage", name: "客户阶段", count: 1, totals: [{ currency: "USD", valueCents: 10000 }] }],
        }}
      />
    </IdiomaProvider>,
  );
  expect(screen.getByRole("region", { name: "Business overview" })).toBeInTheDocument();
  expect(screen.getByText("Total customers")).toBeInTheDocument();
  expect(screen.getByText("Completed")).toBeInTheDocument();
  expect(screen.getByText("Urgent")).toBeInTheDocument();
  expect(screen.getByText(/No deadline/)).toBeInTheDocument();
  expect(screen.getByText(/Good morning, 客户甲/)).toBeInTheDocument();
  expect(screen.getByText(/客户漏斗/)).toBeInTheDocument();
  expect(screen.getByText("客户输入的任务")).toBeInTheDocument();
  expect(screen.getByText("客户阶段")).toBeInTheDocument();
});

it("renders workbench accessible controls and settings in English without rewriting user input", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ data: [] }))),
  );
  render(
    <IdiomaProvider locale="en-US">
      <AgentCrmWorkbench
        agents={[
          {
            id: "agent",
            name: "客户 Agent",
            description: "客户自定义说明",
            builtinKey: "custom",
            scenarios: [],
          },
        ]}
        modelConfigured
        canCopy
      />
    </IdiomaProvider>,
  );
  expect(screen.getByRole("region", { name: "Agent conversation" })).toBeInTheDocument();
  expect(screen.getByLabelText("Built-in Agent")).toHaveTextContent("客户 Agent");
  expect(screen.getByText("客户自定义说明")).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Task for the Agent"), {
    target: { value: "客户输入任务" },
  });
  expect(screen.getByLabelText("Task for the Agent")).toHaveValue("客户输入任务");
  fireEvent.click(screen.getByRole("button", { name: "Task settings" }));
  expect(await screen.findByRole("dialog", { name: "Task settings" })).toBeInTheDocument();
  expect(screen.getByLabelText("CRM object type")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Search CRM by name or content…")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Copy and customize" })).toBeInTheDocument();
});

it("translates send controls and fallback errors without translating the submitted reason", async () => {
  const fetch = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({}), { status: 503 }),
  );
  vi.stubGlobal("fetch", fetch);
  render(
    <IdiomaProvider locale="en-US">
      <MissionSendControl
        mission={{ id: "m1", status: "running", customer_send_paused: false }}
        onUpdated={vi.fn()}
      />
    </IdiomaProvider>,
  );
  fireEvent.change(screen.getByLabelText("Reason for changing the sending policy"), {
    target: { value: "客户要求暂停" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Pause customer messages" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Failed to change the sending policy. Try again.",
  );
  expect(JSON.parse(String(fetch.mock.calls[0]![1]!.body)).reason).toBe("客户要求暂停");
});

it("translates built-in Agent display metadata while preserving the original scenario task", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ data: [] }))),
  );
  const definition = BUILTIN_AGENTS[0]!;
  await act(async () => {
    render(
      <IdiomaProvider locale="en-US">
        <AgentCrmWorkbench
          agents={[
            {
              id: "agent",
              name: definition.name,
              description: definition.description,
              builtinKey: definition.key,
              scenarios: [...definition.scenarios],
            },
          ]}
          modelConfigured
          canCopy
        />
      </IdiomaProvider>,
    );
  });
  expect(screen.getByRole("option", { name: "CRM Intelligence Agent" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Customer 360 summary/ }));
  expect(screen.getByLabelText("Task for the Agent")).toHaveValue(definition.scenarios[0].task);
});

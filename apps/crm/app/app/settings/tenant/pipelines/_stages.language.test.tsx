import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, it, vi } from "vitest";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import { apiClient } from "@/lib/api/client";
import { StagesSection } from "./_stages";

vi.mock("@/lib/api/client", () => ({ apiClient: { get: vi.fn(), patch: vi.fn(), post: vi.fn(), delete: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const data = {
  etapas: [{ id: "stage-1", slug: "em_separacao", name: "Em separação", is_won: false, is_lost: false }],
  mapeamento: { new: null, contacted: null, qualifying: null, qualified: null, negotiating: null, won: null, lost: null },
};

for (const [locale, label] of [["zh-CN", "正在备货"], ["en-US", "Preparing order"]] as const) {
  it(`shows ${locale} seeded input without saving translated text on blur`, async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data });
    vi.mocked(apiClient.patch).mockResolvedValue({ data });
    const query = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<IdiomaProvider locale={locale}><QueryClientProvider client={query}><StagesSection pipelineId="pipeline-1" ancoraMapeamento="mapping" /></QueryClientProvider></IdiomaProvider>);
    const input = await screen.findByTestId("nome-stage-1");
    expect(input).toHaveValue(label);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(apiClient.patch).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "Kris delivery" } });
    fireEvent.blur(input);
    await waitFor(() => expect(apiClient.patch).toHaveBeenCalledWith(expect.stringContaining("stage-1"), { name: "Kris delivery" }));
    query.clear();
  });
}

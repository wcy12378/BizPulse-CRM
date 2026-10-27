import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConexaoCaidaBanner } from "@/components/app/ConexaoCaidaBanner";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import type { AuthUser, Role } from "@/lib/auth/types";
import type { ConexaoCaida } from "@/lib/channels/health";

vi.mock("@/lib/supabase/browser", () => ({
  resetRealtimeAuthentication: vi.fn(),
  createClient: () => ({ auth: { refreshSession: vi.fn() } }),
}));

const baseUser: AuthUser = {
  id: "actor", email: "actor@example.test", full_name: null, avatar_url: null,
  organizations: [{ organization_id: "org", organization_name: "Organização", role: "admin" }],
  idioma: "zh-CN", is_platform_admin: false,
};
const support: NonNullable<AuthUser["support"]> = {
  id: "support", organization_id: "org", actor_user_id: "actor", auth_session_id: "session",
  previous_organization_id: null, expires_at: "2030-01-01T00:00:00Z", name: "Organização",
  locale: "zh-CN", access_mode: "support_readonly", status: "active",
};
function view(role: Role, locale: "zh-CN" | "en-US", who = baseUser, caidas: ConexaoCaida[] = [{ id: "channel", apelido: "Vendas", status: "SCAN_QR_CODE" }], demoMode = false) {
  return <AuthProvider user={who} activeOrg={{ orgId: "org", name: "Organização", role }}>
    <IdiomaProvider locale={locale}><ConexaoCaidaBanner caidas={caidas} demoMode={demoMode} /></IdiomaProvider>
  </AuthProvider>;
}
const copy = {
  "zh-CN": { qr: "扫描二维码", connections: "查看连接", help: "请管理员检查 WhatsApp 连接。", outage: "没有任何消息进出。" },
  "en-US": { qr: "Scan the QR", connections: "View connections", help: "Ask an administrator to review the WhatsApp connection.", outage: "no messages can come in or go out." },
};

describe.each(["zh-CN", "en-US"] as const)("alerta de conexão em %s", locale => {
  it.each([
    ["admin do tenant", "admin", baseUser],
    ["plataforma fora do suporte", "agent", { ...baseUser, is_platform_admin: true }],
    ["suporte de edição", "admin", { ...baseUser, is_platform_admin: true, support: { ...support, access_mode: "full" } }],
  ] as const)("%s abre Conexões com a ação adequada ao estado", (_name, role, who) => {
    const mounted = render(view(role, locale, who));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Vendas");
    expect(within(alert).getByRole("link", { name: copy[locale].qr })).toHaveAttribute("href", "/app/connections");
    expect(within(alert).queryByText(copy[locale].help)).toBeNull();
    mounted.rerender(view(role, locale, who, [{ id: "channel", apelido: "Vendas", status: "FAILED" }]));
    expect(within(screen.getByRole("alert")).getByRole("link", { name: copy[locale].connections })).toHaveAttribute("href", "/app/connections");
  });

  it.each([
    ["atendente", "agent", baseUser],
    ["gerente", "manager", baseUser],
    ["viewer", "viewer", baseUser],
    ["plataforma em suporte somente leitura com vínculo físico admin", "viewer", { ...baseUser, is_platform_admin: true, support }],
  ] as const)("%s recebe o alerta e uma orientação, sem CTA proibida", (_name, role, who) => {
    render(view(role, locale, who));
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Vendas");
    expect(alert).toHaveTextContent(copy[locale].outage);
    expect(within(alert).queryByRole("link")).toBeNull();
    expect(within(alert).getByText(copy[locale].help)).toBeVisible();
  });

  it("retira o alerta quando não há conexão caída", () => {
    const mounted = render(view("agent", locale));
    expect(screen.getByRole("alert")).toBeVisible();
    mounted.rerender(view("agent", locale, baseUser, []));
    expect(screen.queryByRole("alert")).toBeNull();
  });
});

describe("sessão fictícia deliberadamente parada", () => {
  const fixture = [{ id: "fixture", apelido: "演示会话（已停止，不连接外部渠道）", status: "STOPPED" }];

  it("informa a desconexão da fixture sem tratá-la como incidente real no modo demo", () => {
    render(view("admin", "zh-CN", baseUser, fixture, true));
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("已断开连接");
    expect(within(screen.getByRole("status")).getByRole("link")).toHaveAttribute("href", "/app/connections");
  });

  it("preserva alertas fora do demo e quando existe outra conexão caída", () => {
    const mounted = render(view("admin", "zh-CN", baseUser, fixture));
    expect(screen.getByRole("alert")).toBeVisible();
    mounted.rerender(view("admin", "zh-CN", baseUser, [...fixture, { id: "live", apelido: "Vendas", status: "FAILED" }], true));
    expect(screen.getByRole("alert")).toHaveTextContent("连接");
    expect(screen.queryByRole("status")).toBeNull();
  });
});

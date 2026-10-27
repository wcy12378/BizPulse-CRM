import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateProfile } from "@/app/actions/settings/updateProfile";
import { IdiomaProvider } from "@/lib/i18n/IdiomaProvider";
import { SEM_PREFERENCIA_DE_IDIOMA, type Locale } from "@/lib/schemas/settings";
import { ProfileForm } from "./_form";

vi.mock("@/app/actions/settings/updateProfile", () => ({
  updateProfile: vi.fn(async () => ({ ok: true })),
}));

function renderForm(locale: Locale, initialLocale: Locale | typeof SEM_PREFERENCIA_DE_IDIOMA = locale) {
  return render(
    <IdiomaProvider locale={locale}>
      <ProfileForm
        email="owner@example.invalid"
        initialFullName="Nome completo"
        initialAvatarUrl={null}
        initialLocale={initialLocale}
        initialTimezone="Asia/Shanghai"
      />
    </IdiomaProvider>,
  );
}

beforeEach(() => vi.mocked(updateProfile).mockClear());

describe("ProfileForm Chinese and English", () => {
  it("hydrates the saved English language and displays the Shanghai timezone label", () => {
    renderForm("en-US");
    expect(screen.getByRole("combobox", { name: "Language" })).toHaveTextContent("English");
    expect(screen.getByRole("combobox", { name: "Time zone" })).toHaveTextContent("Shanghai (UTC+08:00)");
  });

  it("displays Chinese labels while preserving user-entered data", () => {
    renderForm("zh-CN");
    expect(screen.getByRole("combobox", { name: "时区" })).toHaveTextContent("上海（UTC+08:00）");
    expect(screen.getByDisplayValue("Nome completo")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "语言" })).toHaveTextContent("简体中文");
  });

  it("saves the IANA zone and English preference rather than their display labels", async () => {
    renderForm("en-US");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      locale: "en-US",
      timezone: "Asia/Shanghai",
      full_name: "Nome completo",
    })));
  });

  it("keeps the organization-language preference empty when saving another field", async () => {
    renderForm("en-US", SEM_PREFERENCIA_DE_IDIOMA);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      locale: SEM_PREFERENCIA_DE_IDIOMA,
      timezone: "Asia/Shanghai",
    })));
  });
});

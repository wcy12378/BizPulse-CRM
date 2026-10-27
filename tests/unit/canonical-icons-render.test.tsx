import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Inbox, Tray, Scales, ScalesSimple, ImageIcon, CalendarBlank, ListMagnifyingGlass, ArrowsLeftRight } from "@/lib/ui/icons";

describe("canonical SSR icons", () => {
  it("preserves the public aliases", () => {
    expect(Inbox).toBe(Tray);
    expect(ScalesSimple).toBe(Scales);
  });
  it("renders server and empty-state icons with caller props", () => {
    for (const Icon of [Inbox, ImageIcon, CalendarBlank, ListMagnifyingGlass, ArrowsLeftRight]) {
      const html = renderToStaticMarkup(<Icon size={28} weight="duotone" aria-label="Preview icon" />);
      expect(html).toContain('<svg');
      expect(html).toContain('width="28"');
      expect(html).toContain('aria-label="Preview icon"');
      expect(html).toContain('<path');
    }
  });
});

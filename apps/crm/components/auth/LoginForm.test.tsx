import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/hooks/i18n/useT", () => ({ useT: () => (value: string) => value }));
vi.mock("@/app/actions/auth/signInWithPassword", () => ({ signInWithPassword: mocks.signIn }));
import { LoginForm } from "./LoginForm";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("does not expose a native password form submission before hydration", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToString(<LoginForm />);
  expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
  expect(container.querySelector<HTMLInputElement>('#password')?.disabled).toBe(true);
});

it("enables the hydrated form and displays authentication errors without reloading", async () => {
  mocks.signIn.mockResolvedValue({ ok: false, error: "invalid_credentials" });
  render(<LoginForm />);
  const button = screen.getByRole("button", { name: "Entrar" });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "person@example.com" } });
  fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "example-password" } });
  fireEvent.click(button);
  expect(await screen.findByRole("alert")).toHaveTextContent("Email ou senha incorretos.");
  expect(mocks.signIn).toHaveBeenCalledOnce();
  expect(mocks.replace).not.toHaveBeenCalled();
});

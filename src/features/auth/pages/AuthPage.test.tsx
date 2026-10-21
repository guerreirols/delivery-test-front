import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthPage } from "./AuthPage";
import { session } from "../services/session";
import { ApiError } from "../../../shared/api/client";

afterEach(() => vi.restoreAllMocks());
describe("Authentication form", () => {
  it("submits credentials and disables duplicate submission", async () => {
    const user = userEvent.setup();
    const login = vi
      .spyOn(session, "login")
      .mockReturnValue(new Promise(() => undefined));
    render(<AuthPage notice="" />);
    await user.type(screen.getByLabelText("E-mail"), "person@example.test");
    await user.type(screen.getByLabelText("Senha"), "example123");
    await user.click(
      screen.getByRole("button", { name: /Entrar na minha conta/ }),
    );
    expect(login).toHaveBeenCalledWith({
      email: "person@example.test",
      password: "example123",
    });
    expect(screen.getByRole("button", { name: /Aguarde/ })).toBeDisabled();
    expect(login).toHaveBeenCalledTimes(1);
  });
  it("shows a login error and retains the email", async () => {
    const user = userEvent.setup();
    vi.spyOn(session, "login").mockRejectedValue(
      new ApiError(401, "E-mail ou senha inválidos"),
    );
    render(<AuthPage notice="" />);
    await user.type(screen.getByLabelText("E-mail"), "person@example.test");
    await user.type(screen.getByLabelText("Senha"), "incorrect");
    await user.click(
      screen.getByRole("button", { name: /Entrar na minha conta/ }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "E-mail ou senha inválidos",
    );
    expect(screen.getByLabelText("E-mail")).toHaveValue("person@example.test");
  });
  it("registers and returns to login with a success message", async () => {
    const user = userEvent.setup();
    const register = vi.spyOn(session, "register").mockResolvedValue(undefined);
    render(<AuthPage notice="" />);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));
    await user.type(screen.getByLabelText("Nome completo"), "Pessoa de Teste");
    await user.type(screen.getByLabelText("E-mail"), "person@example.test");
    await user.type(screen.getByLabelText("Senha"), "example123");
    await user.click(screen.getByRole("button", { name: /Criar conta/ }));
    expect(register).toHaveBeenCalledWith({
      name: "Pessoa de Teste",
      email: "person@example.test",
      password: "example123",
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Conta criada");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /Entrar na minha conta/ }),
    ).toBeEnabled();
  });
  it("associates API field errors with their inputs", async () => {
    const user = userEvent.setup();
    vi.spyOn(session, "register").mockRejectedValue(
      new ApiError(409, "Não foi possível criar a conta", {
        email: "E-mail já cadastrado",
      }),
    );
    render(<AuthPage notice="" />);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));
    await user.type(screen.getByLabelText("Nome completo"), "Pessoa");
    await user.type(screen.getByLabelText("E-mail"), "person@example.test");
    await user.type(screen.getByLabelText("Senha"), "example123");
    await user.click(screen.getByRole("button", { name: /Criar conta/ }));
    expect(await screen.findByText("E-mail já cadastrado")).toBeVisible();
    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription(
      "E-mail já cadastrado",
    );
  });
});

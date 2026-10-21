import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserName } from "./UserName";
import { session } from "../services/session";

afterEach(() => vi.restoreAllMocks());
describe("Current user name", () => {
  it("loads the authenticated profile", async () => {
    const authorized = vi.spyOn(session, "authorized").mockResolvedValue({ name: "Maria Silva" });
    render(<UserName />);
    expect(await screen.findByText("Maria Silva")).toBeVisible();
    expect(authorized).toHaveBeenCalledWith("/users/me", { signal: expect.any(AbortSignal) });
  });
  it("offers retry after a profile failure", async () => {
    vi.spyOn(session, "authorized").mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ name: "Maria" });
    render(<UserName />);
    await userEvent.click(await screen.findByRole("button", { name: "Recarregar meu nome" }));
    expect(await screen.findByText("Maria")).toBeVisible();
  });
});


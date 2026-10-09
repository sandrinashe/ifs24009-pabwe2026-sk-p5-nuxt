import { describe, it, expect, vi } from "vitest";
import { postLogin, postLogout, postRegister } from "./authApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ success: true }) }));

describe("authApi", () => {
  it("should call POST /auth/login", async () => {
    await postLogin({ email: "a@a.com", password: "123456", extra: "x" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@a.com", password: "123456" },
    });
  });

  it("should call POST /auth/register", async () => {
    await postRegister({ name: "A", email: "a@a.com", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "A", email: "a@a.com", password: "123456" },
    });
  });

  it("should call POST /auth/logout", async () => {
    await postLogout();
    expect(apiFetch).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});

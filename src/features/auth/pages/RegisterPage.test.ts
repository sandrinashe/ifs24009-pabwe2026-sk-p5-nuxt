import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import RegisterPage from "./RegisterPage.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const submit = async (wrapper) => {
  await wrapper.find("#name").setValue("Sandrina");
  await wrapper.find("#email").setValue("a@a.com");
  await wrapper.find("#password").setValue("123456");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("RegisterPage", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
    showSuccessDialog.mockReset();
  });

  it("should register, show success dialog and go to login", async () => {
    const { wrapper, router } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    const store = useAuthStore();
    store.isAuthRegister = vi.fn().mockResolvedValue({ success: true, message: "Berhasil" });
    await submit(wrapper);

    expect(store.isAuthRegister).toHaveBeenCalledWith({ name: "Sandrina", email: "a@a.com", password: "123456" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("should show an error dialog on failure", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage, { route: "/auth/register" });
    useAuthStore().isAuthRegister = vi.fn().mockResolvedValue({ success: false, message: "Email sudah dipakai" });
    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("should show the loading label", async () => {
    const { wrapper } = await renderWithProviders(RegisterPage);
    expect(wrapper.find("button[type=submit]").text()).toContain("Daftar Sekarang");
    useAuthStore().isLoading = true;
    await flushPromises();
    expect(wrapper.find("button[type=submit]").text()).toContain("Memproses...");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import LoginPage from "./LoginPage.vue";
import { renderWithProviders } from "../../../test-utils";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn() }));

const fill = async (wrapper) => {
  await wrapper.find("#login-email-input").setValue("a@a.com");
  await wrapper.find("#login-password-input").setValue("123456");
};

describe("LoginPage", () => {
  beforeEach(() => {
    showErrorDialog.mockReset();
  });

  it("should render the form", async () => {
    const { wrapper } = await renderWithProviders(LoginPage);
    expect(wrapper.find("#login-email-input").exists()).toBe(true);
    expect(wrapper.find("#login-submit-button").text()).toContain("Masuk Sekarang");
  });

  it("should login and redirect to home", async () => {
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    const store = useAuthStore();
    store.isAuthLogin = vi.fn().mockResolvedValue({ success: true });
    await fill(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(store.isAuthLogin).toHaveBeenCalledWith({ email: "a@a.com", password: "123456" });
    expect(router.currentRoute.value.path).toBe("/");
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it("should show an error dialog when login fails", async () => {
    const { wrapper, router } = await renderWithProviders(LoginPage, { route: "/auth/login" });
    useAuthStore().isAuthLogin = vi.fn().mockResolvedValue({ success: false, message: "Email atau password salah" });
    await fill(wrapper);
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("Email atau password salah");
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("should disable the button while loading", async () => {
    const { wrapper } = await renderWithProviders(LoginPage);
    useAuthStore().isLoading = true;
    await flushPromises();
    const button = wrapper.find("#login-submit-button");
    expect(button.attributes("disabled")).toBeDefined();
    expect(button.text()).toContain("Memproses...");
  });
});

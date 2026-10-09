import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createMemoryHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import App from "./App.vue";
import createDefaultRouter, { createAppRouter } from "./router";
import { requireAuth, requireGuest, routes } from "./routes";
import { putAccessToken } from "./helpers/apiHelper";
import { getMe, getUsers } from "./features/users/api/userApi";
import { getCashFlow, getCashFlows, getLabels } from "./features/cashflows/api/cashFlowApi";

vi.mock("./features/users/api/userApi");
vi.mock("./features/auth/api/authApi");
vi.mock("./features/cashflows/api/cashFlowApi", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./features/cashflows/api/cashFlowApi")>()),
  getCashFlows: vi.fn(),
  getCashFlow: vi.fn(),
  getLabels: vi.fn(),
}));

const mountApp = async (path: string) => {
  const pinia = createPinia();
  setActivePinia(pinia);
  const router = createAppRouter(createMemoryHistory());
  router.push(path);
  await router.isReady();
  const wrapper = mount(App, { global: { plugins: [pinia, router] } });
  await flushPromises();
  return { wrapper, router };
};

describe("App routing", () => {
  beforeEach(() => {
    (getMe as any).mockResolvedValue({ success: true, data: { user: { id: 1, name: "Sandrina", email: "s@a.com", photo: null } } });
    (getUsers as any).mockResolvedValue({ success: true, data: { users: [] } });
    (getCashFlows as any).mockResolvedValue({ success: true, data: { cash_flows: [], stats: {} } });
    (getLabels as any).mockResolvedValue({ success: true, data: { labels: [] } });
    (getCashFlow as any).mockResolvedValue({ success: false });
  });

  it("should expose route guards and a wildcard route", () => {
    expect(requireAuth()).toBe("/auth/login");
    expect(requireGuest()).toBe(true);
    putAccessToken("tok");
    expect(requireAuth()).toBe(true);
    expect(requireGuest()).toBe("/");
    expect(routes.at(-1)?.path).toBe("/:pathMatch(.*)*");
  });

  it("should export the router factory as default", () => {
    expect(createDefaultRouter).toBe(createAppRouter);
  });

  it("should redirect guests from protected pages to the login page", async () => {
    const { wrapper, router } = await mountApp("/");
    expect(router.currentRoute.value.path).toBe("/auth/login");
    expect(wrapper.text()).toContain("Masuk Akun");
  });

  it("should redirect /auth to the login page and render the register page", async () => {
    const auth = await mountApp("/auth");
    expect(auth.router.currentRoute.value.path).toBe("/auth/login");

    const register = await mountApp("/auth/register");
    expect(register.wrapper.text()).toContain("Daftar Sekarang");
  });

  it("should render the dashboard for logged in users", async () => {
    putAccessToken("tok");
    const { wrapper, router } = await mountApp("/");
    expect(router.currentRoute.value.path).toBe("/");
    expect(wrapper.text()).toContain("Ringkasan Arus Kas");
    expect(wrapper.text()).toContain("Sandrina");
  });

  it("should render the detail route for logged in users", async () => {
    putAccessToken("tok");
    const { wrapper } = await mountApp("/cash-flows/9");
    expect(getCashFlow).toHaveBeenCalledWith("9");
    expect(wrapper.text()).toContain("Transaksi tidak ditemukan");
  });

  it("should redirect logged in users away from the auth pages", async () => {
    putAccessToken("tok");
    const { router } = await mountApp("/auth/login");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("should render the users and profile pages for logged in users", async () => {
    putAccessToken("tok");
    const users = await mountApp("/users");
    expect(users.wrapper.text()).toContain("Daftar Pengguna");

    const profile = await mountApp("/profile");
    expect(profile.wrapper.text()).toContain("Profil Saya");
  });

  it("should render the not found page for unknown routes", async () => {
    const { wrapper } = await mountApp("/tidak/ada");
    expect(wrapper.text()).toContain("Halaman tidak ditemukan");
  });
});

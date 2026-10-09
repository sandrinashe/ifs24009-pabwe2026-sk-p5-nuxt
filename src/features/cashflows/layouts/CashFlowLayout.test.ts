import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import CashFlowLayout from "./CashFlowLayout.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";

const routes = [
  {
    path: "/",
    component: CashFlowLayout,
    children: [{ path: "", component: { template: "<p>konten anak</p>" } }],
  },
  { path: "/auth/login", component: { template: "<p>login</p>" } },
];

const mountLayout = async (profileResult: any) => {
  const pinia = createMockPinia();
  const usersStore = useUsersStore();
  usersStore.asyncGetProfile = vi.fn().mockResolvedValue(profileResult);
  const authStore = useAuthStore();
  authStore.isAuthLogout = vi.fn().mockResolvedValue(undefined);
  const rendered = await renderWithProviders({ template: "<RouterView />" }, { pinia, routes, route: "/" });
  return { ...rendered, usersStore, authStore };
};

describe("CashFlowLayout", () => {
  it("should load the profile and render navbar, sidebar and child route", async () => {
    const { wrapper, usersStore, authStore } = await mountLayout({ success: true });
    expect(usersStore.asyncGetProfile).toHaveBeenCalled();
    expect(authStore.isAuthLogout).not.toHaveBeenCalled();
    expect(wrapper.find("header").exists()).toBe(true);
    expect(wrapper.find("[data-testid=sidebar]").exists()).toBe(true);
    expect(wrapper.text()).toContain("konten anak");
  });

  it("should logout and go to login when the profile cannot be loaded", async () => {
    const { router, authStore } = await mountLayout({ success: false });
    await flushPromises();
    expect(authStore.isAuthLogout).toHaveBeenCalled();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });

  it("should toggle and close the sidebar drawer", async () => {
    const { wrapper } = await mountLayout({ success: true });
    const sidebar = () => wrapper.find("[data-testid=sidebar]");
    expect(sidebar().classes()).toContain("-translate-x-full");

    await wrapper.find("button[aria-label='Buka menu']").trigger("click");
    expect(sidebar().classes()).toContain("translate-x-0");

    await wrapper.find("[data-testid=sidebar-overlay]").trigger("click");
    expect(sidebar().classes()).toContain("-translate-x-full");
  });
});

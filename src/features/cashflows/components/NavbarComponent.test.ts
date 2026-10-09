import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import NavbarComponent from "./NavbarComponent.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", () => ({
  showConfirmDialog: vi.fn(),
  getInitial: (name: string) => name.charAt(0).toUpperCase(),
}));

const mountNavbar = async (profile: any) => {
  const pinia = createMockPinia();
  useUsersStore().profile = profile;
  return renderWithProviders(NavbarComponent, { pinia, route: "/" });
};

describe("NavbarComponent", () => {
  beforeEach(() => {
    (showConfirmDialog as any).mockReset();
  });

  it("should render profile photo, name, username and session status", async () => {
    const { wrapper } = await mountNavbar({ name: "Sandrina", email: "sandrina@a.com", photo: "http://x/p.png" });
    expect(wrapper.find("[data-testid=navbar-name]").text()).toBe("Sandrina");
    expect(wrapper.find("[data-testid=navbar-username]").text()).toContain("@sandrina");
    expect(wrapper.text()).toContain("Sesi aktif");
    expect(wrapper.find("img").attributes("src")).toBe("http://x/p.png");
  });

  it("should render avatar initial fallback when photo is null", async () => {
    const { wrapper } = await mountNavbar({ name: "Sandrina", email: "s@a.com", photo: null });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find("[data-testid=navbar-initial]").text()).toBe("S");
  });

  it("should fall back to email, then to default Pengguna, and hide the username without email", async () => {
    const withEmail = await mountNavbar({ name: "", email: "s@a.com", photo: null });
    expect(withEmail.wrapper.find("[data-testid=navbar-name]").text()).toBe("s@a.com");

    const empty = await mountNavbar({ name: "", email: "", photo: null });
    expect(empty.wrapper.find("[data-testid=navbar-name]").text()).toBe("Pengguna");
    expect(empty.wrapper.find("[data-testid=navbar-username]").exists()).toBe(false);

    const noProfile = await mountNavbar(null);
    expect(noProfile.wrapper.find("[data-testid=navbar-name]").text()).toBe("Pengguna");
  });

  it("should emit toggle-sidebar from the menu button", async () => {
    const { wrapper } = await mountNavbar(null);
    await wrapper.find("button[aria-label='Buka menu']").trigger("click");
    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("should not logout when the confirmation is cancelled", async () => {
    const { wrapper } = await mountNavbar(null);
    const logout = vi.fn();
    useAuthStore().isAuthLogout = logout;
    (showConfirmDialog as any).mockResolvedValue(false);
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();
    expect(logout).not.toHaveBeenCalled();
  });

  it("should logout, reset profile and go to login when confirmed", async () => {
    const { wrapper, router } = await mountNavbar({ name: "S", email: "s@a.com", photo: null });
    const logout = vi.fn().mockResolvedValue(undefined);
    useAuthStore().isAuthLogout = logout;
    (showConfirmDialog as any).mockResolvedValue(true);
    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();

    expect(logout).toHaveBeenCalled();
    expect(useUsersStore().profile).toBeNull();
    expect(router.currentRoute.value.path).toBe("/auth/login");
  });
});

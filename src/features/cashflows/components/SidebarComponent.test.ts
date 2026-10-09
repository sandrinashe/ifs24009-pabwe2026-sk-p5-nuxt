import { describe, it, expect } from "vitest";
import SidebarComponent from "./SidebarComponent.vue";
import { renderWithProviders } from "../../../test-utils";

describe("SidebarComponent", () => {
  it("should render all menus and mark the active one", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { route: "/users" });
    const links = wrapper.findAll("nav a");
    expect(links.map((l) => l.text())).toEqual(["Ringkasan Arus Kas", "Direktori Pengguna", "Profil Saya"]);
    expect(links[1].classes()).toContain("text-teal-700");
    expect(links[0].classes()).not.toContain("text-teal-700");
  });

  it("should keep the summary menu active on a cash flow detail page", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { route: "/cash-flows/12" });
    const links = wrapper.findAll("nav a");
    expect(links[0].classes()).toContain("text-teal-700");
    expect(links[1].classes()).not.toContain("text-teal-700");
  });

  it("should not mark the summary menu active on other pages", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { route: "/profile" });
    const links = wrapper.findAll("nav a");
    expect(links[0].classes()).not.toContain("text-teal-700");
    expect(links[2].classes()).toContain("text-teal-700");
  });

  it("should be hidden by default without an overlay", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);
    expect(wrapper.find("[data-testid=sidebar]").classes()).toContain("-translate-x-full");
    expect(wrapper.find("[data-testid=sidebar-overlay]").exists()).toBe(false);
  });

  it("should show the drawer and emit close from overlay, close button and links", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });
    expect(wrapper.find("[data-testid=sidebar]").classes()).toContain("translate-x-0");

    await wrapper.find("[data-testid=sidebar-overlay]").trigger("click");
    await wrapper.find("button[aria-label='Tutup menu']").trigger("click");
    await wrapper.find("nav a").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});

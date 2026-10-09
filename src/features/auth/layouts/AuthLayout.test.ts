import { describe, it, expect } from "vitest";
import AuthLayout from "./AuthLayout.vue";
import { renderWithProviders } from "../../../test-utils";

const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      { path: "login", component: { template: "<p>halaman login</p>" } },
      { path: "register", component: { template: "<p>halaman register</p>" } },
    ],
  },
];

describe("AuthLayout", () => {
  it("should highlight the login tab and render the child route", async () => {
    const { wrapper } = await renderWithProviders({ template: "<RouterView />" }, { route: "/auth/login", routes });
    const links = wrapper.findAll("nav a");
    expect(wrapper.text()).toContain("halaman login");
    expect(links[0].classes()).toContain("text-teal-700");
    expect(links[1].classes()).not.toContain("text-teal-700");
  });

  it("should highlight the register tab on the register route", async () => {
    const { wrapper } = await renderWithProviders({ template: "<RouterView />" }, { route: "/auth/register", routes });
    const links = wrapper.findAll("nav a");
    expect(wrapper.text()).toContain("halaman register");
    expect(links[1].classes()).toContain("text-teal-700");
    expect(links[0].classes()).not.toContain("text-teal-700");
  });
});

import { describe, it, expect, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import UsersPage from "./UsersPage.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useUsersStore } from "../states/usersStore";

const mountPage = async (state) => {
  const pinia = createMockPinia();
  const store = useUsersStore();
  store.asyncGetUsers = vi.fn().mockImplementation(async () => {});
  store.$patch(state);
  const result = await renderWithProviders(UsersPage, { pinia });
  return { ...result, store };
};

describe("UsersPage", () => {
  it("should fetch users on mount and show loading", async () => {
    const { wrapper, store } = await mountPage({ isLoading: true });
    expect(store.asyncGetUsers).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Memuat data pengguna");
  });

  it("should show an empty state", async () => {
    const { wrapper } = await mountPage({ users: [] });
    expect(wrapper.text()).toContain("Belum ada pengguna");
  });

  it("should list users with photo or initial fallback", async () => {
    const { wrapper } = await mountPage({
      users: [
        { id: 1, name: "Andi", email: "andi@a.com", photo: "http://x/p.png" },
        { id: 2, name: "budi", email: "budi@a.com", photo: null },
      ],
    });
    await flushPromises();
    const items = wrapper.findAll("[data-testid=user-item]");
    expect(items).toHaveLength(2);
    expect(items[0].find("img").attributes("src")).toBe("http://x/p.png");
    expect(items[1].find("img").exists()).toBe(false);
    expect(items[1].text()).toContain("B");
    expect(items[1].text()).toContain("budi@a.com");
  });
});

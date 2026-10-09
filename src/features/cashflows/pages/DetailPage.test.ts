import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import DetailPage from "./DetailPage.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import {
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const cashFlow = {
  id: 5,
  user_id: 1,
  type: "inflow",
  source: "savings",
  label: "Gaji",
  description: "Gaji bulanan",
  nominal: 5000000,
  created_at: "2024-10-05T12:09:16.000000Z",
  updated_at: "2024-10-06T12:09:16.000000Z",
};

const routes = [
  { path: "/", component: { template: "<p>beranda</p>" } },
  { path: "/cash-flows/:cashFlowId", component: DetailPage },
];

const mountPage = async (state: any = {}) => {
  const pinia = createMockPinia();
  const store = useCashFlowsStore();
  store.asyncGetCashFlow = vi.fn().mockResolvedValue({ success: true });
  store.asyncDeleteCashFlow = vi.fn().mockResolvedValue({ success: true });
  store.$patch(state);
  const result = await renderWithProviders(DetailPage, { pinia, routes, route: "/cash-flows/5" });
  return { ...result, store };
};

describe("DetailPage", () => {
  beforeEach(() => {
    (showConfirmDialog as any).mockReset();
    (showErrorDialog as any).mockReset();
    (showSuccessDialog as any).mockReset();
  });

  it("should load the transaction by the route id", async () => {
    const { store } = await mountPage();
    expect(store.asyncGetCashFlow).toHaveBeenCalledWith("5");
  });

  it("should show loading and not found states", async () => {
    const loading = await mountPage({ isCashFlow: true });
    expect(loading.wrapper.text()).toContain("Memuat detail transaksi");

    const missing = await mountPage({ cashFlow: null });
    expect(missing.wrapper.text()).toContain("Transaksi tidak ditemukan");
  });

  it("should render the full transaction detail for an inflow", async () => {
    const { wrapper } = await mountPage({ cashFlow });
    expect(wrapper.find("h1").text()).toBe("Gaji");
    expect(wrapper.find("[data-testid=type-badge]").text()).toBe("Pemasukan");
    expect(wrapper.find("[data-testid=type-badge]").classes()).toContain("bg-emerald-100");
    expect(wrapper.find("[data-testid=nominal]").text()).toBe(formatRupiah(5000000));
    expect(wrapper.find("[data-testid=source]").text()).toBe("Tabungan");
    expect(wrapper.find("[data-testid=description]").text()).toBe("Gaji bulanan");
  });

  it("should render an outflow with an empty description fallback", async () => {
    const { wrapper } = await mountPage({ cashFlow: { ...cashFlow, type: "outflow", description: "" } });
    expect(wrapper.find("[data-testid=type-badge]").text()).toBe("Pengeluaran");
    expect(wrapper.find("[data-testid=type-badge]").classes()).toContain("bg-rose-100");
    expect(wrapper.find("[data-testid=description]").text()).toBe("-");
  });

  it("should open the change modal, then close it or reload after saving", async () => {
    const { wrapper, store } = await mountPage({ cashFlow });
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);

    await wrapper.find("[data-testid=open-change]").trigger("click");
    expect(wrapper.findComponent(ChangeModal).props("cashFlow")).toEqual(cashFlow);

    wrapper.findComponent(ChangeModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);

    await wrapper.find("[data-testid=open-change]").trigger("click");
    wrapper.findComponent(ChangeModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    expect(store.asyncGetCashFlow).toHaveBeenCalledTimes(2);
  });

  it("should not delete when the confirmation is cancelled", async () => {
    const { wrapper, store } = await mountPage({ cashFlow });
    (showConfirmDialog as any).mockResolvedValue(false);
    await wrapper.find("[data-testid=delete]").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteCashFlow).not.toHaveBeenCalled();
  });

  it("should delete the transaction and go back to the home page", async () => {
    const { wrapper, store, router } = await mountPage({ cashFlow });
    (showConfirmDialog as any).mockResolvedValue(true);
    await wrapper.find("[data-testid=delete]").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteCashFlow).toHaveBeenCalledWith("5");
    expect(showSuccessDialog).toHaveBeenCalledWith("Transaksi berhasil dihapus");
    expect(router.currentRoute.value.path).toBe("/");
  });

  it("should show an error and stay when deleting fails", async () => {
    const { wrapper, store, router } = await mountPage({ cashFlow });
    (showConfirmDialog as any).mockResolvedValue(true);
    (store.asyncDeleteCashFlow as any).mockResolvedValue({ success: false, message: "Gagal hapus" });
    await wrapper.find("[data-testid=delete]").trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus");
    expect(router.currentRoute.value.path).toBe("/cash-flows/5");
  });
});

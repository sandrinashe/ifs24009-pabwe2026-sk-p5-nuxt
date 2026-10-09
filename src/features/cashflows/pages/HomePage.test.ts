import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import HomePage from "./HomePage.vue";
import AddModal from "../modals/AddModal.vue";
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

const items = [
  { id: 1, user_id: 1, type: "inflow", source: "cash", label: "Gaji", description: "Bulanan", nominal: 5000000, created_at: "2024-10-05 08:00:00", updated_at: "2024-10-05 08:00:00" },
  { id: 2, user_id: 1, type: "outflow", source: "savings", label: "Makan", description: "Siang", nominal: 25000, created_at: "2024-10-06 12:00:00", updated_at: "2024-10-06 12:00:00" },
  { id: 3, user_id: 1, type: "outflow", source: "crypto", label: "Lain", description: "", nominal: 1000, created_at: "2024-10-07 12:00:00", updated_at: "2024-10-07 12:00:00" },
];

const mountPage = async (state: any = {}) => {
  const pinia = createMockPinia();
  const store = useCashFlowsStore();
  store.asyncGetCashFlows = vi.fn().mockResolvedValue({ success: true });
  store.asyncGetLabels = vi.fn().mockResolvedValue({ success: true });
  store.asyncDeleteCashFlow = vi.fn().mockResolvedValue({ success: true });
  store.asyncDeleteAllCashFlows = vi.fn().mockResolvedValue({ success: true });
  store.$patch(state);
  const result = await renderWithProviders(HomePage, { pinia });
  return { ...result, store };
};

const lastParams = (store: any) => store.asyncGetCashFlows.mock.calls.at(-1)[0];

describe("HomePage", () => {
  beforeEach(() => {
    (showConfirmDialog as any).mockReset();
    (showErrorDialog as any).mockReset();
    (showSuccessDialog as any).mockReset();
  });

  it("should load cash flows and labels on mount", async () => {
    const { store } = await mountPage();
    expect(store.asyncGetLabels).toHaveBeenCalledTimes(1);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(1);
    expect(lastParams(store)).toEqual({ type: "", source: "", label: "", start_date: "", end_date: "" });
  });

  it("should render the six financial summary cards", async () => {
    const { wrapper } = await mountPage({
      stats: {
        cashflow: 4975000,
        total_inflow: 5000000,
        total_outflow: 25000,
        total_inflow_cash: 5000000,
        total_outflow_savings: 25000,
      },
    });
    const text = (key: string) => wrapper.find(`[data-testid=metric-${key}]`).text();
    expect(text("cashflow")).toContain("Total Saldo Kas Bersih");
    expect(text("cashflow")).toContain(formatRupiah(4975000));
    expect(text("inflow")).toContain(formatRupiah(5000000));
    expect(text("outflow")).toContain(formatRupiah(25000));
    expect(text("cash")).toContain(formatRupiah(5000000));
    expect(text("savings")).toContain(formatRupiah(-25000));
    expect(text("loans")).toContain(formatRupiah(0));
  });

  it("should show loading and empty states", async () => {
    const loading = await mountPage({ isCashFlow: true });
    expect(loading.wrapper.text()).toContain("Memuat transaksi");

    const empty = await mountPage({ cashFlows: [] });
    expect(empty.wrapper.text()).toContain("Belum ada transaksi arus kas");
  });

  it("should list transactions with type badges and source labels", async () => {
    const { wrapper } = await mountPage({ cashFlows: items });
    const rows = wrapper.findAll("[data-testid=cashflow-item]");
    expect(rows).toHaveLength(3);

    const badges = wrapper.findAll("[data-testid=type-badge]");
    expect(badges[0].text()).toBe("Pemasukan");
    expect(badges[0].classes()).toContain("bg-emerald-100");
    expect(badges[1].text()).toBe("Pengeluaran");
    expect(badges[1].classes()).toContain("bg-rose-100");

    expect(rows[0].text()).toContain("Tunai");
    expect(rows[1].text()).toContain("Tabungan");
    expect(rows[2].text()).toContain("crypto");
    expect(rows[0].text()).toContain(formatRupiah(5000000));
    expect(rows[0].find("a").attributes("href")).toBe("/cash-flows/1");
  });

  it("should refetch with the selected filters", async () => {
    const { wrapper, store } = await mountPage({ labels: ["Gaji", "Makan"] });

    await wrapper.find("select[aria-label='Filter jenis']").setValue("outflow");
    expect(lastParams(store).type).toBe("outflow");

    await wrapper.find("select[aria-label='Filter sumber dana']").setValue("savings");
    expect(lastParams(store).source).toBe("savings");

    await wrapper.find("select[aria-label='Filter label']").setValue("Makan");
    expect(lastParams(store).label).toBe("Makan");

    await wrapper.find("input[aria-label='Tanggal awal']").setValue("2024-10-05");
    expect(lastParams(store).start_date).toBe("2024-10-05 00:00:00");

    await wrapper.find("input[aria-label='Tanggal akhir']").setValue("2024-10-06");
    expect(lastParams(store).end_date).toBe("2024-10-06 23:59:59");
  });

  it("should clear every filter with the reset button", async () => {
    const { wrapper, store } = await mountPage();
    await wrapper.find("select[aria-label='Filter jenis']").setValue("inflow");
    await wrapper.find("input[aria-label='Tanggal awal']").setValue("2024-10-05");

    await wrapper.find("[data-testid=reset-filter]").trigger("click");
    await flushPromises();
    expect(lastParams(store)).toEqual({ type: "", source: "", label: "", start_date: "", end_date: "" });
  });

  it("should open the add modal, then reload and close it after saving", async () => {
    const { wrapper, store } = await mountPage();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);

    await wrapper.find("[data-testid=open-add]").trigger("click");
    expect(wrapper.findComponent(AddModal).exists()).toBe(true);

    wrapper.findComponent(AddModal).vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);

    await wrapper.find("[data-testid=open-add]").trigger("click");
    wrapper.findComponent(AddModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.findComponent(AddModal).exists()).toBe(false);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
    expect(store.asyncGetLabels).toHaveBeenCalledTimes(2);
  });

  it("should open the change modal for a row, then close or save it", async () => {
    const { wrapper, store } = await mountPage({ cashFlows: items });
    await wrapper.findAll("button[aria-label=Ubah]")[1].trigger("click");
    const modal = wrapper.findComponent(ChangeModal);
    expect(modal.props("cashFlow")).toEqual(items[1]);

    modal.vm.$emit("close");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);

    await wrapper.findAll("button[aria-label=Ubah]")[0].trigger("click");
    wrapper.findComponent(ChangeModal).vm.$emit("saved");
    await flushPromises();
    expect(wrapper.findComponent(ChangeModal).exists()).toBe(false);
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
  });

  it("should not delete a transaction when the confirmation is cancelled", async () => {
    const { wrapper, store } = await mountPage({ cashFlows: items });
    (showConfirmDialog as any).mockResolvedValue(false);
    await wrapper.findAll("button[aria-label=Hapus]")[0].trigger("click");
    await flushPromises();
    expect(store.asyncDeleteCashFlow).not.toHaveBeenCalled();
  });

  it("should delete a transaction and reload the list", async () => {
    const { wrapper, store } = await mountPage({ cashFlows: items });
    (showConfirmDialog as any).mockResolvedValue(true);
    await wrapper.findAll("button[aria-label=Hapus]")[1].trigger("click");
    await flushPromises();
    expect(store.asyncDeleteCashFlow).toHaveBeenCalledWith(2);
    expect(showSuccessDialog).toHaveBeenCalledWith("Transaksi berhasil dihapus");
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
  });

  it("should show an error when deleting a transaction fails", async () => {
    const { wrapper, store } = await mountPage({ cashFlows: items });
    (showConfirmDialog as any).mockResolvedValue(true);
    (store.asyncDeleteCashFlow as any).mockResolvedValue({ success: false, message: "Gagal hapus" });
    await wrapper.findAll("button[aria-label=Hapus]")[0].trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus");
    expect(showSuccessDialog).not.toHaveBeenCalled();
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(1);
  });

  it("should not reset all transactions when the confirmation is cancelled", async () => {
    const { wrapper, store } = await mountPage();
    (showConfirmDialog as any).mockResolvedValue(false);
    await wrapper.find("[data-testid=delete-all]").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteAllCashFlows).not.toHaveBeenCalled();
  });

  it("should reset all transactions and reload", async () => {
    const { wrapper, store } = await mountPage();
    (showConfirmDialog as any).mockResolvedValue(true);
    await wrapper.find("[data-testid=delete-all]").trigger("click");
    await flushPromises();
    expect(store.asyncDeleteAllCashFlows).toHaveBeenCalled();
    expect(showSuccessDialog).toHaveBeenCalledWith("Seluruh transaksi berhasil dihapus");
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(2);
  });

  it("should show an error when resetting all transactions fails", async () => {
    const { wrapper, store } = await mountPage();
    (showConfirmDialog as any).mockResolvedValue(true);
    (store.asyncDeleteAllCashFlows as any).mockResolvedValue({ success: false, message: "Gagal reset" });
    await wrapper.find("[data-testid=delete-all]").trigger("click");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Gagal reset");
    expect(store.asyncGetCashFlows).toHaveBeenCalledTimes(1);
  });
});

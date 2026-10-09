import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const mountModal = async (result: any = { success: true }) => {
  const pinia = createMockPinia();
  const store = useCashFlowsStore();
  store.labels = ["Gaji", "Makan"];
  store.asyncAddCashFlow = vi.fn().mockResolvedValue(result);
  const rendered = await renderWithProviders(AddModal, { pinia });
  return { ...rendered, store };
};

const fillAndSubmit = async (wrapper: any) => {
  await wrapper.find("#type").setValue("outflow");
  await wrapper.find("#source").setValue("savings");
  await wrapper.find("#label").setValue("Makan");
  await wrapper.find("#nominal").setValue("25000");
  await wrapper.find("#description").setValue("Makan siang");
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("AddModal", () => {
  beforeEach(() => {
    (showErrorDialog as any).mockReset();
    (showSuccessDialog as any).mockReset();
  });

  it("should offer type, source and known labels as options", async () => {
    const { wrapper } = await mountModal();
    expect(wrapper.findAll("#type option").map((o) => o.text())).toEqual(["Pemasukan", "Pengeluaran"]);
    expect(wrapper.findAll("#source option").map((o) => o.text())).toEqual(["Tunai", "Tabungan", "Pinjaman"]);
    expect(wrapper.findAll("datalist option").map((o) => o.attributes("value"))).toEqual(["Gaji", "Makan"]);
  });

  it("should submit the new cash flow and emit saved", async () => {
    const { wrapper, store } = await mountModal();
    await fillAndSubmit(wrapper);

    expect(store.asyncAddCashFlow).toHaveBeenCalledWith({
      type: "outflow",
      source: "savings",
      label: "Makan",
      description: "Makan siang",
      nominal: 25000,
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Transaksi berhasil dicatat");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should default to a cash inflow", async () => {
    const { wrapper, store } = await mountModal();
    await wrapper.find("#label").setValue("Gaji");
    await wrapper.find("#nominal").setValue("1000");
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(store.asyncAddCashFlow).toHaveBeenCalledWith(
      expect.objectContaining({ type: "inflow", source: "cash", nominal: 1000 })
    );
  });

  it("should show an error and stay open when saving fails", async () => {
    const { wrapper } = await mountModal({ success: false, message: "Nominal wajib diisi" });
    await fillAndSubmit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Nominal wajib diisi");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should disable the submit button while saving", async () => {
    const { wrapper, store } = await mountModal();
    store.isCashFlowAdd = true;
    await flushPromises();
    expect(wrapper.find("button[type=submit]").attributes("disabled")).toBeDefined();
  });

  it("should emit close from the close button and the backdrop only", async () => {
    const { wrapper } = await mountModal();
    await wrapper.find("button[aria-label=Tutup]").trigger("click");
    await wrapper.find("[data-testid=modal-backdrop]").trigger("click");
    await wrapper.find("form").trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(2);
  });
});

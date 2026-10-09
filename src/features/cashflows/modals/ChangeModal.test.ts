import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders, createMockPinia } from "../../../test-utils";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const cashFlow = {
  id: 5,
  user_id: 1,
  type: "inflow",
  source: "cash",
  label: "Gaji",
  description: "Bulanan",
  nominal: 5000000,
  created_at: "2024-10-05T12:09:16.000000Z",
  updated_at: "2024-10-05T12:09:16.000000Z",
};

const mountModal = async (result: any = { success: true }) => {
  const pinia = createMockPinia();
  const store = useCashFlowsStore();
  store.labels = ["Gaji", "Cicilan"];
  store.asyncChangeCashFlow = vi.fn().mockResolvedValue(result);
  const rendered = await renderWithProviders(ChangeModal, { pinia, props: { cashFlow } });
  return { ...rendered, store };
};

describe("ChangeModal", () => {
  beforeEach(() => {
    (showErrorDialog as any).mockReset();
    (showSuccessDialog as any).mockReset();
  });

  it("should prefill the form with the current data", async () => {
    const { wrapper } = await mountModal();
    expect((wrapper.find("#type").element as HTMLSelectElement).value).toBe("inflow");
    expect((wrapper.find("#source").element as HTMLSelectElement).value).toBe("cash");
    expect((wrapper.find("#label").element as HTMLInputElement).value).toBe("Gaji");
    expect((wrapper.find("#nominal").element as HTMLInputElement).value).toBe("5000000");
    expect((wrapper.find("#description").element as HTMLTextAreaElement).value).toBe("Bulanan");
    expect(wrapper.findAll("datalist option").map((o) => o.attributes("value"))).toEqual(["Gaji", "Cicilan"]);
  });

  it("should submit the changes and emit saved", async () => {
    const { wrapper, store } = await mountModal();
    await wrapper.find("#type").setValue("outflow");
    await wrapper.find("#source").setValue("loans");
    await wrapper.find("#label").setValue("Cicilan");
    await wrapper.find("#nominal").setValue("750000");
    await wrapper.find("#description").setValue("Cicilan motor");
    await wrapper.find("form").trigger("submit");
    await flushPromises();

    expect(store.asyncChangeCashFlow).toHaveBeenCalledWith(5, {
      type: "outflow",
      source: "loans",
      label: "Cicilan",
      description: "Cicilan motor",
      nominal: 750000,
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Transaksi berhasil diubah");
    expect(wrapper.emitted("saved")).toHaveLength(1);
  });

  it("should show an error and stay open when saving fails", async () => {
    const { wrapper } = await mountModal({ success: false, message: "Data tidak valid" });
    await wrapper.find("form").trigger("submit");
    await flushPromises();
    expect(showErrorDialog).toHaveBeenCalledWith("Data tidak valid");
    expect(wrapper.emitted("saved")).toBeUndefined();
  });

  it("should disable the submit button while saving", async () => {
    const { wrapper, store } = await mountModal();
    store.isCashFlowChange = true;
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

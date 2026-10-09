import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCashFlowsStore } from "./cashFlowsStore";
import { createMockPinia } from "../../../test-utils";
import * as api from "../api/cashFlowApi";

vi.mock("../api/cashFlowApi");

const item = { id: 1, label: "Gaji" };
const mocked = api as any;

describe("cashFlowsStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("should load cash flows with stats and pass params", async () => {
    mocked.getCashFlows.mockResolvedValue({ success: true, data: { cash_flows: [item], stats: { cashflow: 10 } } });
    const store = useCashFlowsStore();
    await store.asyncGetCashFlows({ type: "inflow" });
    expect(mocked.getCashFlows).toHaveBeenCalledWith({ type: "inflow" });
    expect(store.cashFlows).toEqual([item]);
    expect(store.stats).toEqual({ cashflow: 10 });
    expect(store.isCashFlow).toBe(false);
  });

  it("should keep cash flows when loading fails", async () => {
    mocked.getCashFlows.mockResolvedValue({ success: false });
    const store = useCashFlowsStore();
    await store.asyncGetCashFlows();
    expect(store.cashFlows).toEqual([]);
    expect(store.stats).toEqual({});
  });

  it("should load a detail and reset it first", async () => {
    let during;
    mocked.getCashFlow.mockImplementation(async () => {
      during = { cashFlow: useCashFlowsStore().cashFlow, loading: useCashFlowsStore().isCashFlow };
      return { success: true, data: { cash_flow: item } };
    });
    const store = useCashFlowsStore();
    store.cashFlow = { id: 99 } as any;
    await store.asyncGetCashFlow(1);
    expect(during).toEqual({ cashFlow: null, loading: true });
    expect(store.cashFlow).toEqual(item);
  });

  it("should leave cashFlow null when the detail request fails", async () => {
    mocked.getCashFlow.mockResolvedValue({ success: false });
    const store = useCashFlowsStore();
    await store.asyncGetCashFlow(1);
    expect(store.cashFlow).toBeNull();
  });

  it("should load labels only on success", async () => {
    const store = useCashFlowsStore();
    mocked.getLabels.mockResolvedValue({ success: true, data: { labels: ["Gaji", "Makan"] } });
    await store.asyncGetLabels();
    expect(store.labels).toEqual(["Gaji", "Makan"]);

    mocked.getLabels.mockResolvedValue({ success: false });
    await store.asyncGetLabels();
    expect(store.labels).toEqual(["Gaji", "Makan"]);
  });

  it.each([
    ["asyncGetStatsDaily", "getStatsDaily", "statsDaily"],
    ["asyncGetStatsMonthly", "getStatsMonthly", "statsMonthly"],
  ])("%s should store the statistics only on success", async (action, apiName, field) => {
    const store = useCashFlowsStore();
    const data = { stats_inflow: { "05-10-2024": 1 }, stats_outflow: {}, stats_cashflow: {} };
    mocked[apiName].mockResolvedValue({ success: true, data });
    await store[action]({ total_data: 7 });
    expect(mocked[apiName]).toHaveBeenCalledWith({ total_data: 7 });
    expect(store[field]).toEqual(data);

    mocked[apiName].mockResolvedValue({ success: false });
    await store[action]();
    expect(store[field]).toEqual(data);
  });

  it("should compute balances from stats, defaulting missing values to zero", () => {
    const store = useCashFlowsStore();
    expect(store.balances).toEqual({ cashflow: 0, inflow: 0, outflow: 0, cash: 0, savings: 0, loans: 0 });

    store.stats = {
      cashflow: 700,
      total_inflow: 1000,
      total_outflow: 300,
      total_inflow_cash: 800,
      total_outflow_cash: 100,
      total_inflow_savings: 200,
      total_outflow_loans: 50,
    };
    expect(store.balances).toEqual({ cashflow: 700, inflow: 1000, outflow: 300, cash: 700, savings: 200, loans: -50 });
  });

  it.each([
    ["asyncAddCashFlow", "postCashFlow", ["P"], "isCashFlowAdd", "isCashFlowAdded"],
    ["asyncChangeCashFlow", "putCashFlow", [1, "P"], "isCashFlowChange", "isCashFlowChanged"],
    ["asyncDeleteCashFlow", "deleteCashFlow", [1], "isCashFlowDelete", "isCashFlowDeleted"],
    ["asyncDeleteAllCashFlows", "deleteAllCashFlows", [], "isCashFlowDeleteAll", "isCashFlowDeletedAll"],
  ])("%s should track pending and done flags", async (action, apiName, args, pending, done) => {
    const store = useCashFlowsStore();
    let pendingDuring;
    mocked[apiName].mockImplementation(async () => {
      pendingDuring = store[pending];
      return { success: true, message: "ok" };
    });

    const result = await store[action](...args);
    expect(mocked[apiName]).toHaveBeenCalledWith(...args);
    expect(pendingDuring).toBe(true);
    expect(store[pending]).toBe(false);
    expect(store[done]).toBe(true);
    expect(result.message).toBe("ok");

    mocked[apiName].mockResolvedValue({ success: false });
    await store[action](...args);
    expect(store[done]).toBe(false);
  });
});

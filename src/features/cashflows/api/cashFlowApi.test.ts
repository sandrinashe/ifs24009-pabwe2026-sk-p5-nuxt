import { describe, it, expect, vi } from "vitest";
import {
  CASH_FLOW_SOURCES,
  CASH_FLOW_TYPES,
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getLabels,
  getStatsDaily,
  getStatsMonthly,
  postCashFlow,
  putCashFlow,
} from "./cashFlowApi";
import { apiFetch } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ success: true }) }));

const payload = { type: "inflow", source: "cash", label: "Gaji", description: "Bulanan", nominal: 5000000 } as const;

describe("cashFlowApi", () => {
  it("should expose option lists for types and sources", () => {
    expect(CASH_FLOW_TYPES.map((item) => item.value)).toEqual(["inflow", "outflow"]);
    expect(CASH_FLOW_SOURCES.map((item) => item.value)).toEqual(["cash", "savings", "loans"]);
  });

  it("should call GET /cash-flows with filters, and without filters by default", async () => {
    await getCashFlows({ type: "inflow", label: "Gaji" });
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { query: { type: "inflow", label: "Gaji" } });
    await getCashFlows();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { query: {} });
  });

  it("should call GET /cash-flows/:id", async () => {
    await getCashFlow(7);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/7");
  });

  it("should POST only the allowed fields", async () => {
    await postCashFlow({ ...payload, extra: 1 } as any);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { method: "POST", body: payload });
  });

  it("should PUT only the allowed fields", async () => {
    await putCashFlow(3, { ...payload, extra: 1 } as any);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/3", { method: "PUT", body: payload });
  });

  it("should call DELETE for one record and for all records", async () => {
    await deleteCashFlow(3);
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/3", { method: "DELETE" });
    await deleteAllCashFlows();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows", { method: "DELETE" });
  });

  it("should call labels and stats endpoints", async () => {
    await getLabels();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/labels");

    await getStatsDaily({ total_data: 7 });
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/stats/daily", { query: { total_data: 7 } });
    await getStatsDaily();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/stats/daily", { query: {} });

    await getStatsMonthly({ end_date: "2024-10-05 23:59:59" });
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/stats/monthly", { query: { end_date: "2024-10-05 23:59:59" } });
    await getStatsMonthly();
    expect(apiFetch).toHaveBeenCalledWith("/cash-flows/stats/monthly", { query: {} });
  });
});

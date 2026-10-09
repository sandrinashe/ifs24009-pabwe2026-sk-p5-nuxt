import { apiFetch } from "../../../helpers/apiHelper";

export type CashFlowType = "inflow" | "outflow";
export type CashFlowSource = "cash" | "savings" | "loans";

export const CASH_FLOW_TYPES: { value: CashFlowType; label: string }[] = [
  { value: "inflow", label: "Pemasukan" },
  { value: "outflow", label: "Pengeluaran" },
];

export const CASH_FLOW_SOURCES: { value: CashFlowSource; label: string }[] = [
  { value: "cash", label: "Tunai" },
  { value: "savings", label: "Tabungan" },
  { value: "loans", label: "Pinjaman" },
];

export interface CashFlow {
  id: number;
  user_id: number;
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
  created_at: string;
  updated_at: string;
}

/** Statistik saldo; kunci dinamis seperti total_inflow_cash atau total_outflow_label_<label>. */
export interface CashFlowStats {
  cashflow?: number;
  total_inflow?: number;
  total_outflow?: number;
  [key: string]: number | undefined;
}

export interface CashFlowQueryParams {
  type?: CashFlowType | "";
  source?: CashFlowSource | "";
  label?: string;
  start_date?: string;
  end_date?: string;
}

export interface CashFlowPayload {
  type: CashFlowType;
  source: CashFlowSource;
  label: string;
  description: string;
  nominal: number;
}

export interface StatsQueryParams {
  end_date?: string;
  total_data?: number;
}

/** Kunci tanggal (DD-MM-YYYY / MM-YYYY) dengan nilai nominal. */
export type StatsSeries = Record<string, number>;

export interface StatsData {
  stats_inflow: StatsSeries;
  stats_outflow: StatsSeries;
  stats_cashflow: StatsSeries;
}

const pickPayload = ({ type, source, label, description, nominal }: CashFlowPayload) => ({
  type,
  source,
  label,
  description,
  nominal,
});

export const getCashFlows = (params: CashFlowQueryParams = {}) =>
  apiFetch<{ cash_flows: CashFlow[]; stats: CashFlowStats }>("/cash-flows", { query: { ...params } });

export const getCashFlow = (id: number | string) =>
  apiFetch<{ cash_flow: CashFlow }>(`/cash-flows/${id}`);

export const postCashFlow = (payload: CashFlowPayload) =>
  apiFetch<{ cash_flow_id: number }>("/cash-flows", { method: "POST", body: pickPayload(payload) });

export const putCashFlow = (id: number | string, payload: CashFlowPayload) =>
  apiFetch(`/cash-flows/${id}`, { method: "PUT", body: pickPayload(payload) });

export const deleteCashFlow = (id: number | string) =>
  apiFetch(`/cash-flows/${id}`, { method: "DELETE" });

export const getLabels = () => apiFetch<{ labels: string[] }>("/cash-flows/labels");

export const getStatsDaily = (params: StatsQueryParams = {}) =>
  apiFetch<StatsData>("/cash-flows/stats/daily", { query: { ...params } });

export const getStatsMonthly = (params: StatsQueryParams = {}) =>
  apiFetch<StatsData>("/cash-flows/stats/monthly", { query: { ...params } });

export const deleteAllCashFlows = () => apiFetch("/cash-flows", { method: "DELETE" });

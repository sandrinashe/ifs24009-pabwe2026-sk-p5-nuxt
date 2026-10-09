import { defineStore } from "pinia";
import type { ApiResult } from "../../../helpers/apiHelper";
import {
  deleteAllCashFlows,
  deleteCashFlow,
  getCashFlow,
  getCashFlows,
  getLabels,
  getStatsDaily,
  getStatsMonthly,
  postCashFlow,
  putCashFlow,
  type CashFlow,
  type CashFlowPayload,
  type CashFlowQueryParams,
  type CashFlowStats,
  type StatsData,
  type StatsQueryParams,
} from "../api/cashFlowApi";

export type { CashFlow, CashFlowPayload, CashFlowQueryParams, CashFlowStats };

export interface CashFlowsState {
  cashFlows: CashFlow[];
  cashFlow: CashFlow | null;
  stats: CashFlowStats;
  labels: string[];
  statsDaily: StatsData | null;
  statsMonthly: StatsData | null;
  isCashFlow: boolean;
  isCashFlowAdd: boolean;
  isCashFlowAdded: boolean;
  isCashFlowChange: boolean;
  isCashFlowChanged: boolean;
  isCashFlowDelete: boolean;
  isCashFlowDeleted: boolean;
  isCashFlowDeleteAll: boolean;
  isCashFlowDeletedAll: boolean;
}

type PendingFlag = "isCashFlowAdd" | "isCashFlowChange" | "isCashFlowDelete" | "isCashFlowDeleteAll";
type DoneFlag = "isCashFlowAdded" | "isCashFlowChanged" | "isCashFlowDeleted" | "isCashFlowDeletedAll";

// Menjalankan aksi mutasi sambil memperbarui flag "sedang diproses" dan "berhasil diproses".
async function mutate(
  store: CashFlowsState,
  pending: PendingFlag,
  done: DoneFlag,
  call: () => Promise<ApiResult>
) {
  store[pending] = true;
  store[done] = false;
  const result = await call();
  store[pending] = false;
  store[done] = result.success;
  return result;
}

const amount = (value?: number): number => value ?? 0;

export const useCashFlowsStore = defineStore("cashFlows", {
  state: (): CashFlowsState => ({
    cashFlows: [],
    cashFlow: null,
    stats: {},
    labels: [],
    statsDaily: null,
    statsMonthly: null,
    isCashFlow: false,
    isCashFlowAdd: false,
    isCashFlowAdded: false,
    isCashFlowChange: false,
    isCashFlowChanged: false,
    isCashFlowDelete: false,
    isCashFlowDeleted: false,
    isCashFlowDeleteAll: false,
    isCashFlowDeletedAll: false,
  }),
  getters: {
    /** Ringkasan saldo: total kas bersih, pemasukan, pengeluaran, dan saldo per sumber dana. */
    balances: (state) => ({
      cashflow: amount(state.stats.cashflow),
      inflow: amount(state.stats.total_inflow),
      outflow: amount(state.stats.total_outflow),
      cash: amount(state.stats.total_inflow_cash) - amount(state.stats.total_outflow_cash),
      savings: amount(state.stats.total_inflow_savings) - amount(state.stats.total_outflow_savings),
      loans: amount(state.stats.total_inflow_loans) - amount(state.stats.total_outflow_loans),
    }),
  },
  actions: {
    async asyncGetCashFlows(params?: CashFlowQueryParams) {
      this.isCashFlow = true;
      const result = await getCashFlows(params);
      if (result.success) {
        this.cashFlows = result.data.cash_flows;
        this.stats = result.data.stats;
      }
      this.isCashFlow = false;
      return result;
    },
    async asyncGetCashFlow(id: number | string) {
      this.isCashFlow = true;
      this.cashFlow = null;
      const result = await getCashFlow(id);
      if (result.success) {
        this.cashFlow = result.data.cash_flow;
      }
      this.isCashFlow = false;
      return result;
    },
    async asyncGetLabels() {
      const result = await getLabels();
      if (result.success) {
        this.labels = result.data.labels;
      }
      return result;
    },
    async asyncGetStatsDaily(params?: StatsQueryParams) {
      const result = await getStatsDaily(params);
      if (result.success) {
        this.statsDaily = result.data;
      }
      return result;
    },
    async asyncGetStatsMonthly(params?: StatsQueryParams) {
      const result = await getStatsMonthly(params);
      if (result.success) {
        this.statsMonthly = result.data;
      }
      return result;
    },
    asyncAddCashFlow(payload: CashFlowPayload) {
      return mutate(this, "isCashFlowAdd", "isCashFlowAdded", () => postCashFlow(payload));
    },
    asyncChangeCashFlow(id: number | string, payload: CashFlowPayload) {
      return mutate(this, "isCashFlowChange", "isCashFlowChanged", () => putCashFlow(id, payload));
    },
    asyncDeleteCashFlow(id: number | string) {
      return mutate(this, "isCashFlowDelete", "isCashFlowDeleted", () => deleteCashFlow(id));
    },
    asyncDeleteAllCashFlows() {
      return mutate(this, "isCashFlowDeleteAll", "isCashFlowDeletedAll", () => deleteAllCashFlows());
    },
  },
});

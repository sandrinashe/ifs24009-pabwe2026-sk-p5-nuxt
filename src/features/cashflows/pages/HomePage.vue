<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import {
  Banknote,
  Eye,
  HandCoins,
  PiggyBank,
  Pencil,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import {
  CASH_FLOW_SOURCES,
  CASH_FLOW_TYPES,
  type CashFlow,
  type CashFlowQueryParams,
  type CashFlowSource,
  type CashFlowType,
} from "../api/cashFlowApi";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  toEndOfDay,
  toStartOfDay,
} from "../../../helpers/toolsHelper";

interface Filters {
  type: CashFlowType | "";
  source: CashFlowSource | "";
  label: string;
  start_date: string;
  end_date: string;
}

const cashFlowsStore = useCashFlowsStore();
const showAdd = ref(false);
const editing = ref<CashFlow | null>(null);

const emptyFilters = (): Filters => ({ type: "", source: "", label: "", start_date: "", end_date: "" });
const filters = reactive<Filters>(emptyFilters());

const buildParams = (): CashFlowQueryParams => ({
  type: filters.type,
  source: filters.source,
  label: filters.label,
  start_date: filters.start_date ? toStartOfDay(filters.start_date) : "",
  end_date: filters.end_date ? toEndOfDay(filters.end_date) : "",
});

const load = () => cashFlowsStore.asyncGetCashFlows(buildParams());
const reload = () => Promise.all([load(), cashFlowsStore.asyncGetLabels()]);

onMounted(reload);
watch(filters, load);

const metrics = computed(() => {
  const balances = cashFlowsStore.balances;
  return [
    { key: "cashflow", label: "Total Saldo Kas Bersih", value: balances.cashflow, icon: Scale, tone: "bg-teal-600 text-white" },
    { key: "inflow", label: "Total Pemasukan", value: balances.inflow, icon: TrendingUp, tone: "bg-white text-emerald-600" },
    { key: "outflow", label: "Total Pengeluaran", value: balances.outflow, icon: TrendingDown, tone: "bg-white text-rose-600" },
    { key: "cash", label: "Saldo Kas Tunai", value: balances.cash, icon: Banknote, tone: "bg-white text-slate-700" },
    { key: "savings", label: "Saldo Rekening Tabungan", value: balances.savings, icon: PiggyBank, tone: "bg-white text-slate-700" },
    { key: "loans", label: "Saldo Pinjaman", value: balances.loans, icon: HandCoins, tone: "bg-white text-slate-700" },
  ];
});

const sourceLabel = (source: CashFlowSource) =>
  CASH_FLOW_SOURCES.find((item) => item.value === source)?.label ?? source;

const onResetFilters = () => Object.assign(filters, emptyFilters());

const onSaved = () => {
  showAdd.value = false;
  editing.value = null;
  return reload();
};

const onDelete = async (item: CashFlow) => {
  if (!(await showConfirmDialog(`Hapus transaksi "${item.label}"?`, "Ya, hapus"))) {
    return;
  }
  const result = await cashFlowsStore.asyncDeleteCashFlow(item.id);
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Transaksi berhasil dihapus");
  await reload();
};

const onDeleteAll = async () => {
  if (!(await showConfirmDialog("Seluruh transaksi akan dihapus permanen. Lanjutkan?", "Ya, hapus semua"))) {
    return;
  }
  const result = await cashFlowsStore.asyncDeleteAllCashFlows();
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Seluruh transaksi berhasil dihapus");
  await reload();
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">Ringkasan Arus Kas</h1>
        <p class="text-sm text-slate-500">Pantau pemasukan, pengeluaran, dan saldo setiap sumber dana.</p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          data-testid="delete-all"
          class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          @click="onDeleteAll"
        >
          <Trash2 class="h-4 w-4" /> Reset Transaksi
        </button>
        <button
          type="button"
          data-testid="open-add"
          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          @click="showAdd = true"
        >
          <Plus class="h-4 w-4" /> Tambah Transaksi
        </button>
      </div>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="metric in metrics"
        :key="metric.key"
        :data-testid="`metric-${metric.key}`"
        :class="['rounded-2xl p-5 shadow-sm ring-1 ring-slate-100', metric.tone]"
      >
        <div class="flex items-center gap-2 text-sm font-medium opacity-90">
          <component :is="metric.icon" class="h-4 w-4" /> {{ metric.label }}
        </div>
        <p class="mt-2 text-2xl font-extrabold">{{ formatRupiah(metric.value) }}</p>
      </article>
    </div>

    <div role="search" class="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:grid-cols-2 lg:grid-cols-6">
      <select v-model="filters.type" aria-label="Filter jenis" :class="fieldClass">
        <option value="">Semua jenis</option>
        <option v-for="item in CASH_FLOW_TYPES" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <select v-model="filters.source" aria-label="Filter sumber dana" :class="fieldClass">
        <option value="">Semua sumber</option>
        <option v-for="item in CASH_FLOW_SOURCES" :key="item.value" :value="item.value">{{ item.label }}</option>
      </select>
      <select v-model="filters.label" aria-label="Filter label" :class="fieldClass">
        <option value="">Semua label</option>
        <option v-for="item in cashFlowsStore.labels" :key="item" :value="item">{{ item }}</option>
      </select>
      <input v-model="filters.start_date" type="date" aria-label="Tanggal awal" :class="fieldClass" />
      <input v-model="filters.end_date" type="date" aria-label="Tanggal akhir" :class="fieldClass" />
      <button
        type="button"
        data-testid="reset-filter"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        @click="onResetFilters"
      >
        <RotateCcw class="h-4 w-4" /> Reset Filter
      </button>
    </div>

    <p v-if="cashFlowsStore.isCashFlow" class="text-slate-500">Memuat transaksi...</p>
    <p v-else-if="cashFlowsStore.cashFlows.length === 0" class="rounded-2xl bg-white p-8 text-center text-slate-500">
      Belum ada transaksi arus kas.
    </p>
    <div v-else class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div class="hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
        <span>Label</span><span>Jenis</span><span>Sumber</span><span>Nominal</span><span>Aksi</span>
      </div>
      <ul class="divide-y divide-slate-100">
        <li
          v-for="item in cashFlowsStore.cashFlows"
          :key="item.id"
          data-testid="cashflow-item"
          class="grid items-center gap-2 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:gap-4"
        >
          <div class="min-w-0">
            <p class="truncate font-semibold">{{ item.label }}</p>
            <p class="truncate text-xs text-slate-500">{{ formatDate(item.created_at) }}</p>
          </div>
          <span
            data-testid="type-badge"
            :class="[
              'w-fit rounded-full px-3 py-1 text-xs font-semibold',
              item.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            ]"
          >
            {{ item.type === "inflow" ? "Pemasukan" : "Pengeluaran" }}
          </span>
          <span class="text-sm text-slate-600">{{ sourceLabel(item.source) }}</span>
          <span class="font-semibold">{{ formatRupiah(item.nominal) }}</span>
          <div class="flex gap-1">
            <RouterLink :to="`/cash-flows/${item.id}`" aria-label="Lihat detail" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <Eye class="h-4 w-4" />
            </RouterLink>
            <button type="button" aria-label="Ubah" class="rounded-lg p-2 text-teal-600 hover:bg-teal-50" @click="editing = item">
              <Pencil class="h-4 w-4" />
            </button>
            <button type="button" aria-label="Hapus" class="rounded-lg p-2 text-rose-600 hover:bg-rose-50" @click="onDelete(item)">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ul>
    </div>

    <AddModal v-if="showAdd" @close="showAdd = false" @saved="onSaved" />
    <ChangeModal v-if="editing" :cash-flow="editing" @close="editing = null" @saved="onSaved" />
  </section>
</template>

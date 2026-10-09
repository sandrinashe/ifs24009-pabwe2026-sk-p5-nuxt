<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { ArrowLeft, Pencil, Trash2 } from "lucide-vue-next";
import ChangeModal from "../modals/ChangeModal.vue";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import { CASH_FLOW_SOURCES } from "../api/cashFlowApi";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const cashFlowsStore = useCashFlowsStore();
const showChange = ref(false);

const cashFlowId = computed(() => String(route.params.cashFlowId));
const sourceLabel = computed(
  () => CASH_FLOW_SOURCES.find((item) => item.value === cashFlowsStore.cashFlow?.source)?.label
);

const load = () => cashFlowsStore.asyncGetCashFlow(cashFlowId.value);
onMounted(load);

const onSaved = () => {
  showChange.value = false;
  return load();
};

const onDelete = async () => {
  if (!(await showConfirmDialog("Transaksi ini akan dihapus permanen. Lanjutkan?", "Ya, hapus"))) {
    return;
  }
  const result = await cashFlowsStore.asyncDeleteCashFlow(cashFlowId.value);
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Transaksi berhasil dihapus");
  router.replace("/");
};
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-6">
    <RouterLink to="/" class="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:underline">
      <ArrowLeft class="h-4 w-4" /> Kembali ke ringkasan
    </RouterLink>

    <p v-if="cashFlowsStore.isCashFlow" class="text-slate-500">Memuat detail transaksi...</p>
    <p v-else-if="!cashFlowsStore.cashFlow" class="rounded-2xl bg-white p-8 text-center text-slate-500">
      Transaksi tidak ditemukan.
    </p>
    <article v-else class="space-y-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex items-start justify-between gap-4">
        <div>
          <span
            data-testid="type-badge"
            :class="[
              'rounded-full px-3 py-1 text-xs font-semibold',
              cashFlowsStore.cashFlow.type === 'inflow' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            ]"
          >
            {{ cashFlowsStore.cashFlow.type === "inflow" ? "Pemasukan" : "Pengeluaran" }}
          </span>
          <h1 class="mt-3 text-2xl font-bold">{{ cashFlowsStore.cashFlow.label }}</h1>
        </div>
        <p data-testid="nominal" class="text-2xl font-extrabold">{{ formatRupiah(cashFlowsStore.cashFlow.nominal) }}</p>
      </div>

      <dl class="grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-slate-500">Sumber Dana</dt>
          <dd data-testid="source" class="font-medium">{{ sourceLabel }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Label Kategori</dt>
          <dd class="font-medium">{{ cashFlowsStore.cashFlow.label }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Dibuat</dt>
          <dd class="font-medium">{{ formatDate(cashFlowsStore.cashFlow.created_at) }}</dd>
        </div>
        <div>
          <dt class="text-slate-500">Diperbarui</dt>
          <dd class="font-medium">{{ formatDate(cashFlowsStore.cashFlow.updated_at) }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-slate-500">Keterangan</dt>
          <dd data-testid="description" class="font-medium">{{ cashFlowsStore.cashFlow.description || "-" }}</dd>
        </div>
      </dl>

      <div class="flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          data-testid="open-change"
          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          @click="showChange = true"
        >
          <Pencil class="h-4 w-4" /> Ubah
        </button>
        <button
          type="button"
          data-testid="delete"
          class="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
          @click="onDelete"
        >
          <Trash2 class="h-4 w-4" /> Hapus
        </button>
      </div>
      <ChangeModal v-if="showChange" :cash-flow="cashFlowsStore.cashFlow" @close="showChange = false" @saved="onSaved" />
    </article>

  </section>
</template>

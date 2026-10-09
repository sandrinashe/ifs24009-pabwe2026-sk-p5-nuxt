<script setup lang="ts">
import { Plus, X } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useCashFlowsStore } from "../states/cashFlowsStore";
import {
  CASH_FLOW_SOURCES,
  CASH_FLOW_TYPES,
  type CashFlowSource,
  type CashFlowType,
} from "../api/cashFlowApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits<{ (e: "close"): void; (e: "saved"): void }>();

const cashFlowsStore = useCashFlowsStore();
const [type, onTypeChange] = useInput<CashFlowType>("inflow");
const [source, onSourceChange] = useInput<CashFlowSource>("cash");
const [label, onLabelChange] = useInput("");
const [nominal, onNominalChange] = useInput("");
const [description, onDescriptionChange] = useInput("");

const onSubmit = async () => {
  const result = await cashFlowsStore.asyncAddCashFlow({
    type: type.value,
    source: source.value,
    label: label.value,
    description: description.value,
    nominal: Number(nominal.value),
  });
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog("Transaksi berhasil dicatat");
  emit("saved");
};

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";
</script>

<template>
  <div
    data-testid="modal-backdrop"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
    @click.self="emit('close')"
  >
    <form class="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" @submit.prevent="onSubmit">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold">Catat Arus Kas</h2>
        <button type="button" aria-label="Tutup" class="rounded-lg p-1.5 hover:bg-slate-100" @click="emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="type" class="mb-1 block text-sm font-medium">Jenis Arus Kas</label>
          <select id="type" :value="type" :class="fieldClass" @change="onTypeChange">
            <option v-for="item in CASH_FLOW_TYPES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </div>
        <div>
          <label for="source" class="mb-1 block text-sm font-medium">Sumber Dana</label>
          <select id="source" :value="source" :class="fieldClass" @change="onSourceChange">
            <option v-for="item in CASH_FLOW_SOURCES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </div>
      </div>
      <div>
        <label for="label" class="mb-1 block text-sm font-medium">Label Kategori</label>
        <input id="label" list="label-options" required :value="label" :class="fieldClass" placeholder="mis. Gaji, Makan" @input="onLabelChange" />
        <datalist id="label-options">
          <option v-for="item in cashFlowsStore.labels" :key="item" :value="item" />
        </datalist>
      </div>
      <div>
        <label for="nominal" class="mb-1 block text-sm font-medium">Nominal (Rp)</label>
        <input id="nominal" type="number" min="1" required :value="nominal" :class="fieldClass" @input="onNominalChange" />
      </div>
      <div>
        <label for="description" class="mb-1 block text-sm font-medium">Keterangan</label>
        <textarea id="description" rows="3" required :value="description" :class="fieldClass" @input="onDescriptionChange" />
      </div>
      <button
        type="submit"
        :disabled="cashFlowsStore.isCashFlowAdd"
        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
      >
        <Plus class="h-4 w-4" /> Simpan Transaksi
      </button>
    </form>
  </div>
</template>

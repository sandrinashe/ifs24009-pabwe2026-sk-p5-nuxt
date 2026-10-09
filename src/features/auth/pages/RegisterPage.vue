<script setup lang="ts">
import { useRouter } from "vue-router";
import { Mail, Lock, User, UserPlus } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");

const onSubmit = async (): Promise<void> => {
  const result = await authStore.isAuthRegister({
    name: name.value,
    email: email.value,
    password: password.value,
  });
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  await showSuccessDialog(result.message);
  router.replace("/auth/login");
};
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div>
      <label for="name" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Nama Lengkap
      </label>
      <div class="relative">
        <User class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="name"
          type="text"
          required
          placeholder="Nama kamu"
          :value="name"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          @input="onNameChange"
        />
      </div>
    </div>
    <div>
      <label for="email" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Alamat Email
      </label>
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="email"
          type="email"
          required
          placeholder="nama@email.com"
          :value="email"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          @input="onEmailChange"
        />
      </div>
    </div>
    <div>
      <label for="password" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Kata Sandi
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="password"
          type="password"
          required
          minlength="6"
          placeholder="Minimal 6 karakter"
          :value="password"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          @input="onPasswordChange"
        />
      </div>
    </div>
    <button
      type="submit"
      :disabled="authStore.isLoading"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60"
    >
      <UserPlus class="h-4 w-4" />
      {{ authStore.isLoading ? "Memproses..." : "Daftar Sekarang" }}
    </button>
  </form>
</template>

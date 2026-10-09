<script setup lang="ts">
import { useRouter } from "vue-router";
import { Mail, Lock, LogIn } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");

const onSubmit = async (): Promise<void> => {
  const result = await authStore.isAuthLogin({ email: email.value, password: password.value });
  if (!result.success) {
    await showErrorDialog(result.message);
    return;
  }
  router.replace("/");
};
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div>
      <label for="login-email-input" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Alamat Email
      </label>
      <div class="relative">
        <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="login-email-input"
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
      <label for="login-password-input" class="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
        Kata Sandi
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="login-password-input"
          type="password"
          required
          placeholder="••••••••"
          :value="password"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          @input="onPasswordChange"
        />
      </div>
    </div>
    <button
      id="login-submit-button"
      type="submit"
      :disabled="authStore.isLoading"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60"
    >
      <LogIn class="h-4 w-4" />
      {{ authStore.isLoading ? "Memproses..." : "Masuk Sekarang" }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { Wallet } from "lucide-vue-next";

const route = useRoute();
const isRegister = computed(() => route.path === "/auth/register");

const tabClass = (active: boolean) =>
  `flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
    active ? "bg-white text-teal-700 shadow-sm" : "text-slate-600 hover:text-slate-700"
  }`;
</script>

<template>
  <main class="min-h-screen lg:grid lg:grid-cols-2">
    <aside
      data-testid="auth-banner"
      class="hidden flex-col justify-between bg-gradient-to-br from-teal-700 via-teal-700 to-emerald-800 p-12 text-white lg:flex"
    >
      <div class="flex items-center gap-3 text-lg font-bold">
        <Wallet class="h-6 w-6" /> Delcom Cash Flow
      </div>
      <div>
        <h2 class="text-4xl font-extrabold leading-tight">Atur arus kasmu, capai tujuan finansialmu.</h2>
        <p class="mt-4 max-w-md text-teal-100">
          Catat pemasukan dan pengeluaran, pantau saldo tunai, tabungan, dan pinjaman dalam satu dashboard.
        </p>
      </div>
      <p class="text-sm text-teal-200">Praktikum Pengembangan Aplikasi Web 2026</p>
    </aside>

    <section class="flex items-center justify-center px-4 py-10">
      <div class="w-full max-w-md">
        <div class="mb-8 text-center">
          <div
            class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg"
          >
            <Wallet class="h-7 w-7" />
          </div>
          <h1 class="text-3xl font-extrabold text-slate-900">Delcom Cash Flow</h1>
          <p class="mt-1 text-sm text-slate-600">Aplikasi Pencatat Arus Kas yang Modern</p>
        </div>

        <div class="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70">
          <nav class="mb-6 flex gap-1 rounded-2xl bg-slate-100 p-1">
            <RouterLink to="/auth/login" :class="tabClass(!isRegister)">Masuk Akun</RouterLink>
            <RouterLink to="/auth/register" :class="tabClass(isRegister)">Daftar Baru</RouterLink>
          </nav>
          <RouterView />
        </div>
      </div>
    </section>
  </main>
</template>

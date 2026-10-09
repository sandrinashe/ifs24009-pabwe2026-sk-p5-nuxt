<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { LogOut, Menu, Wallet } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { getInitial, showConfirmDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits<{ (e: "toggle-sidebar"): void }>();

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const displayName = computed(
  () => usersStore.profile?.name || usersStore.profile?.email || "Pengguna"
);
// Username diambil dari bagian depan email, mis. "andi@a.com" -> "@andi"
const username = computed(() => {
  const email = usersStore.profile?.email;
  return email ? `@${email.split("@")[0]}` : "";
});

const onLogout = async () => {
  if (!(await showConfirmDialog("Kamu yakin ingin keluar dari akun?", "Ya, keluar"))) {
    return;
  }
  await authStore.isAuthLogout();
  usersStore.$reset();
  router.replace("/auth/login");
};
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur">
    <div class="flex items-center gap-3">
      <button
        type="button"
        aria-label="Buka menu"
        class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        @click="emit('toggle-sidebar')"
      >
        <Menu class="h-5 w-5" />
      </button>
      <div class="flex items-center gap-2 font-bold text-teal-700">
        <Wallet class="h-5 w-5" /> Delcom Cash Flow
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden text-right sm:block">
        <p data-testid="navbar-name" class="text-sm font-semibold">{{ displayName }}</p>
        <p class="text-xs text-slate-600">
          <span v-if="username" data-testid="navbar-username">{{ username }} · </span>
          <span class="text-emerald-700">Sesi aktif</span>
        </p>
      </div>
      <img
        v-if="usersStore.profile?.photo"
        :src="usersStore.profile.photo"
        :alt="displayName"
        class="h-9 w-9 rounded-full object-cover"
      />
      <span
        v-else
        data-testid="navbar-initial"
        class="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
      >
        {{ getInitial(displayName) }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
        @click="onLogout"
      >
        <LogOut class="h-4 w-4" /> Keluar
      </button>
    </div>
  </header>
</template>

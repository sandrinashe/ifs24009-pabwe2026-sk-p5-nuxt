<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";
import { LayoutDashboard, UserRound, Users, X } from "lucide-vue-next";

defineProps<{ open?: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const route = useRoute();

const menus = [
  { label: "Ringkasan Arus Kas", to: "/", icon: LayoutDashboard },
  { label: "Direktori Pengguna", to: "/users", icon: Users },
  { label: "Profil Saya", to: "/profile", icon: UserRound },
];

// Halaman detail transaksi tetap menandai menu "Ringkasan Arus Kas" sebagai aktif
const isActive = (to: string) =>
  route.path === to || (to === "/" && route.path.startsWith("/cash-flows/"));
</script>

<template>
  <div v-if="open" data-testid="sidebar-overlay" class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" @click="emit('close')" />
  <aside
    data-testid="sidebar"
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white p-4 pt-20 transition-transform lg:top-16 lg:translate-x-0 lg:pt-4',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <button
      type="button"
      aria-label="Tutup menu"
      class="absolute right-3 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
      @click="emit('close')"
    >
      <X class="h-5 w-5" />
    </button>
    <nav class="space-y-1">
      <RouterLink
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        :class="[
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
          isActive(menu.to) ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50',
        ]"
        @click="emit('close')"
      >
        <component :is="menu.icon" class="h-4 w-4" /> {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

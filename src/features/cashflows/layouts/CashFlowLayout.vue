<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();
const sidebarOpen = ref(false);

onMounted(async () => {
  const result = await usersStore.asyncGetProfile();
  if (!result.success) {
    // Token tidak valid / kedaluwarsa: kembali ke halaman login
    await authStore.isAuthLogout();
    router.replace("/auth/login");
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <NavbarComponent @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <SidebarComponent :open="sidebarOpen" @close="sidebarOpen = false" />
    <main class="p-4 sm:p-6 lg:ml-64">
      <RouterView />
    </main>
  </div>
</template>

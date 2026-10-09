<script setup lang="ts">
import { onMounted } from "vue";
import { Users } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore";
import { getInitial } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();
onMounted(() => usersStore.asyncGetUsers());
</script>

<template>
  <section>
    <header class="mb-6 flex items-center gap-3">
      <div class="rounded-xl bg-teal-100 p-2.5 text-teal-700"><Users class="h-5 w-5" /></div>
      <div>
        <h1 class="text-2xl font-bold">Daftar Pengguna</h1>
        <p class="text-sm text-slate-500">Seluruh pengguna yang terdaftar di aplikasi.</p>
      </div>
    </header>

    <p v-if="usersStore.isLoading" class="text-slate-500">Memuat data pengguna...</p>
    <p v-else-if="usersStore.users.length === 0" class="rounded-2xl bg-white p-8 text-center text-slate-500">
      Belum ada pengguna.
    </p>
    <ul v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li
        v-for="user in usersStore.users"
        :key="user.id"
        data-testid="user-item"
        class="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
      >
        <img v-if="user.photo" :src="user.photo" :alt="user.name" class="h-12 w-12 rounded-full object-cover" />
        <span
          v-else
          class="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700"
        >
          {{ getInitial(user.name) }}
        </span>
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ user.name }}</p>
          <p class="truncate text-sm text-slate-500">{{ user.email }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

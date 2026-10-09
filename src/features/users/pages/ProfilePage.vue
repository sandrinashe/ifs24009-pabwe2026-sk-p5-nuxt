<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Camera, KeyRound, Save } from "lucide-vue-next";
import useInput from "../../../hooks/useInput";
import { useUsersStore } from "../states/usersStore";
import { getInitial, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();
const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const [newPassword, onNewPasswordChange] = useInput("");
const [confirmation, onConfirmationChange] = useInput("");
const photoFile = ref(null);

onMounted(async () => {
  await usersStore.asyncGetProfile();
  const profile = usersStore.profile;
  if (profile) {
    name.value = profile.name;
    email.value = profile.email;
  }
});

const notify = async (result) =>
  result.success ? showSuccessDialog(result.message) : showErrorDialog(result.message);

const onSubmitProfile = async () =>
  notify(await usersStore.asyncChangeProfile({ name: name.value, email: email.value }));

const onPhotoChange = (event) => {
  photoFile.value = event.target.files[0];
};

const onSubmitPhoto = async () => {
  const result = await usersStore.asyncChangePhoto(photoFile.value);
  await notify({ ...result, message: result.message ?? "Berhasil mengubah foto" });
};

const onSubmitPassword = async () => {
  const result = await usersStore.asyncChangePassword({
    password: password.value,
    new_password: newPassword.value,
    new_password_confirmation: confirmation.value,
  });
  if (result.success) {
    password.value = "";
    newPassword.value = "";
    confirmation.value = "";
  }
  await notify(result);
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";
const buttonClass =
  "inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60";
</script>

<template>
  <section class="space-y-6">
    <header>
      <h1 class="text-2xl font-bold">Profil Saya</h1>
      <p class="text-sm text-slate-600">Kelola data akun, foto, dan kata sandi kamu.</p>
    </header>

    <div v-if="usersStore.profile" class="grid gap-6 lg:grid-cols-2">
      <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" @submit.prevent="onSubmitProfile">
        <div class="flex items-center gap-4">
          <img
            v-if="usersStore.profile.photo"
            :src="usersStore.profile.photo"
            alt="Foto profil"
            class="h-16 w-16 rounded-full object-cover"
          />
          <span
            v-else
            data-testid="profile-initial"
            class="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700"
          >
            {{ getInitial(usersStore.profile.name) }}
          </span>
          <h2 class="text-lg font-semibold">Data Akun</h2>
        </div>
        <div>
          <label for="name" class="mb-1 block text-sm font-medium">Nama</label>
          <input id="name" required :value="name" :class="inputClass" @input="onNameChange" />
        </div>
        <div>
          <label for="email" class="mb-1 block text-sm font-medium">Email</label>
          <input id="email" type="email" required :value="email" :class="inputClass" @input="onEmailChange" />
        </div>
        <button type="submit" :disabled="usersStore.isProfileChange" :class="buttonClass">
          <Save class="h-4 w-4" /> Simpan Perubahan
        </button>
      </form>

      <div class="space-y-6">
        <form class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" @submit.prevent="onSubmitPhoto">
          <h2 class="text-lg font-semibold">Foto Profil</h2>
          <input id="photo" type="file" aria-label="Pilih foto profil" accept="image/*" :class="inputClass" @change="onPhotoChange" />
          <button type="submit" :disabled="!photoFile || usersStore.isProfileChange" :class="buttonClass">
            <Camera class="h-4 w-4" /> Unggah Foto
          </button>
        </form>

        <form
          class="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
          @submit.prevent="onSubmitPassword"
        >
          <h2 class="text-lg font-semibold">Ubah Kata Sandi</h2>
          <input id="password" aria-label="Kata sandi saat ini" type="password" required placeholder="Kata sandi saat ini" :value="password" :class="inputClass" @input="onPasswordChange" />
          <input id="new-password" aria-label="Kata sandi baru" type="password" required placeholder="Kata sandi baru" :value="newPassword" :class="inputClass" @input="onNewPasswordChange" />
          <input id="confirmation" aria-label="Konfirmasi kata sandi baru" type="password" required placeholder="Konfirmasi kata sandi baru" :value="confirmation" :class="inputClass" @input="onConfirmationChange" />
          <button type="submit" :disabled="usersStore.isProfileChange" :class="buttonClass">
            <KeyRound class="h-4 w-4" /> Ubah Kata Sandi
          </button>
        </form>
      </div>
    </div>
    <p v-else class="text-slate-600">Memuat profil...</p>
  </section>
</template>

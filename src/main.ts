import { createApp } from "vue";
import { createPinia } from "pinia";
import { createWebHistory } from "vue-router";
import App from "./App.vue";
import { createAppRouter } from "./router";
import "./index.css";

// Entry point mode SPA murni (bun run dev:vite). Pada Nuxt, aplikasi dibootstrap oleh Nuxt sendiri.
createApp(App).use(createPinia()).use(createAppRouter(createWebHistory())).mount("#app");

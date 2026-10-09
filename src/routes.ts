import type { RouteRecordRaw } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";

// Halaman yang membutuhkan login: arahkan ke /auth/login bila belum ada token
export const requireAuth = (): true | string => (getAccessToken() ? true : "/auth/login");

// Halaman login/register: arahkan ke beranda bila sudah login
export const requireGuest = (): true | string => (getAccessToken() ? "/" : true);

export const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: () => import("./features/auth/layouts/AuthLayout.vue"),
    beforeEnter: requireGuest,
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", component: () => import("./features/auth/pages/LoginPage.vue") },
      { path: "register", component: () => import("./features/auth/pages/RegisterPage.vue") },
    ],
  },
  {
    path: "/",
    component: () => import("./features/cashflows/layouts/CashFlowLayout.vue"),
    beforeEnter: requireAuth,
    children: [
      { path: "", component: () => import("./features/cashflows/pages/HomePage.vue") },
      { path: "cash-flows/:cashFlowId", component: () => import("./features/cashflows/pages/DetailPage.vue") },
      { path: "users", component: () => import("./features/users/pages/UsersPage.vue") },
      { path: "profile", component: () => import("./features/users/pages/ProfilePage.vue") },
    ],
  },
  { path: "/:pathMatch(.*)*", component: () => import("./features/common/pages/NotFoundPage.vue") },
];

import { createRouter, type RouterHistory } from "vue-router";
import { routes } from "./routes";

/**
 * Membuat instance router dari daftar rute aplikasi.
 * Di Nuxt, rute yang sama disuplai lewat src/router.options.ts.
 */
export const createAppRouter = (history: RouterHistory) => createRouter({ history, routes });

export default createAppRouter;

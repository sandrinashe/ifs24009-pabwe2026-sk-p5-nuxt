import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";

const Blank = { template: "<div data-testid='blank' />" };

export const createMockPinia = () => {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
};

/**
 * Render komponen bersama Pinia dan Vue Router (memory history).
 */
export async function renderWithProviders(
  component,
  { props = {}, slots = {}, route = "/", routes, pinia = createMockPinia(), global = {} } = {}
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes ?? [{ path: "/:pathMatch(.*)*", component: Blank }],
  });
  router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    slots,
    global: { plugins: [pinia, router], ...global },
    attachTo: document.body,
  });
  await flushPromises();
  return { wrapper, router, pinia };
}

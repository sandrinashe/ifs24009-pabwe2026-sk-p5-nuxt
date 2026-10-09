import { describe, it, expect } from "vitest";
import routerOptions from "./router.options";
import { routes } from "./routes";

describe("router.options", () => {
  it("should hand the custom routes to Nuxt", () => {
    expect((routerOptions.routes as () => unknown)()).toBe(routes);
  });
});

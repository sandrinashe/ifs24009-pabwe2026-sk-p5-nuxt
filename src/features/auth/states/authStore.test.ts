import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";
import { createMockPinia } from "../../../test-utils";
import { postLogin, postLogout, postRegister } from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";

vi.mock("../api/authApi");

describe("authStore", () => {
  beforeEach(() => {
    createMockPinia();
  });

  it("should read the stored token as initial state", () => {
    expect(useAuthStore().isAuthenticated).toBe(false);
    putAccessToken("saved");
    createMockPinia();
    const store = useAuthStore();
    expect(store.token).toBe("saved");
    expect(store.isAuthenticated).toBe(true);
  });

  it("should store token on successful login", async () => {
    postLogin.mockResolvedValue({ success: true, data: { token: "tok" } });
    const store = useAuthStore();
    const result = await store.isAuthLogin({ email: "a", password: "b" });
    expect(result.success).toBe(true);
    expect(store.token).toBe("tok");
    expect(getAccessToken()).toBe("tok");
    expect(store.isLoading).toBe(false);
  });

  it("should not store token on failed login", async () => {
    postLogin.mockResolvedValue({ success: false, message: "salah" });
    const store = useAuthStore();
    const result = await store.isAuthLogin({});
    expect(result.message).toBe("salah");
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });

  it("should register and toggle loading", async () => {
    let loadingDuringCall;
    postRegister.mockImplementation(async () => {
      loadingDuringCall = useAuthStore().isLoading;
      return { success: true };
    });
    const store = useAuthStore();
    expect((await store.isAuthRegister({})).success).toBe(true);
    expect(loadingDuringCall).toBe(true);
    expect(store.isLoading).toBe(false);
  });

  it("should logout and clear token", async () => {
    putAccessToken("tok");
    createMockPinia();
    postLogout.mockResolvedValue({ success: true });
    const store = useAuthStore();
    await store.isAuthLogout();
    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
  });
});

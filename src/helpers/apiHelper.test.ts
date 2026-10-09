import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, getAccessToken, putAccessToken, removeAccessToken } from "./apiHelper";

const mockFetch = (json) => {
  const fn = vi.fn().mockResolvedValue({ json: () => Promise.resolve(json) });
  vi.stubGlobal("fetch", fn);
  return fn;
};

describe("apiHelper", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("should put, get and remove access token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("should send GET with query (skipping empty values) and bearer token", async () => {
    putAccessToken("tok");
    const fn = mockFetch({ status: "success", message: "ok", data: { a: 1 } });
    const result = await apiFetch("/x", { query: { is_me: 1, q: "", a: undefined, b: null } });

    expect(fn).toHaveBeenCalledWith(`${DELCOM_BASEURL}/x?is_me=1`, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: "Bearer tok" },
      body: undefined,
    });
    expect(result).toEqual({ success: true, message: "ok", data: { a: 1 } });
  });

  it("should send JSON body without token and without query string", async () => {
    const fn = mockFetch({ status: "success", message: "ok" });
    const result = await apiFetch("/x", { method: "POST", body: { a: 1 } });

    expect(fn).toHaveBeenCalledWith(`${DELCOM_BASEURL}/x`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
    expect(result.data).toEqual({});
  });

  it("should send FormData as is", async () => {
    const fn = mockFetch({ status: "success", message: "ok" });
    const formData = new FormData();
    await apiFetch("/x", { method: "POST", formData });
    expect(fn.mock.calls[0][1].body).toBe(formData);
    expect(fn.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();
  });

  it("should join validation field messages on failure", async () => {
    mockFetch({ status: "fail", message: "Data tidak valid", data: { field: ["a salah", "b salah"] } });
    const result = await apiFetch("/x");
    expect(result.success).toBe(false);
    expect(result.message).toBe("a salah, b salah");
  });

  it("should use the message when there are no field errors", async () => {
    mockFetch({ status: "fail", message: "Unauthenticated." });
    const result = await apiFetch("/x");
    expect(result).toEqual({ success: false, message: "Unauthenticated.", data: {} });
  });

  it("should return a connection error when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const result = await apiFetch("/x");
    expect(result).toEqual({ success: false, message: "Tidak dapat terhubung ke server", data: {} });
  });
});

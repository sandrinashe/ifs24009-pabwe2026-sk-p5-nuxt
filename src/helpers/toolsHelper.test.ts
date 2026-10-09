import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatRupiah,
  getInitial,
  parseDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
  toEndOfDay,
  toStartOfDay,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper dialogs", () => {
  beforeEach(() => {
    (Swal.fire as any).mockReset();
  });

  it("should show success, error and warning dialogs", () => {
    showSuccessDialog("ok");
    showErrorDialog("gagal");
    showWarningDialog("awas");
    expect((Swal.fire as any).mock.calls.map(([o]) => o.icon)).toEqual(["success", "error", "warning"]);
    expect((Swal.fire as any).mock.calls[0][0].text).toBe("ok");
  });

  it("should resolve confirm dialog result", async () => {
    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("yakin?")).toBe(true);
    expect((Swal.fire as any).mock.calls[0][0].confirmButtonText).toBe("Ya, lanjutkan");

    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("yakin?", "Hapus")).toBe(false);
    expect((Swal.fire as any).mock.calls[1][0].confirmButtonText).toBe("Hapus");
  });
});

describe("toolsHelper formatters", () => {
  it("should format rupiah", () => {
    expect(formatRupiah(1500000).replace(/\s/g, " ")).toMatch(/Rp\s?1\.500\.000/);
    expect(formatRupiah("25000").replace(/\s/g, " ")).toMatch(/Rp\s?25\.000/);
  });

  it("should parse both sql and iso dates", () => {
    expect(parseDate("2024-10-05 22:00:00").getHours()).toBe(22);
    expect(parseDate("2024-10-05T12:09:16.000000Z").toISOString()).toBe("2024-10-05T12:09:16.000Z");
  });

  it("should format date", () => {
    expect(formatDate("2024-10-05 22:00:00")).toMatch(/2024/);
  });

  it("should build start and end of day query values", () => {
    expect(toStartOfDay("2024-10-05")).toBe("2024-10-05 00:00:00");
    expect(toEndOfDay("2024-10-05")).toBe("2024-10-05 23:59:59");
  });

  it("should get initial", () => {
    expect(getInitial("  sandrina")).toBe("S");
  });
});

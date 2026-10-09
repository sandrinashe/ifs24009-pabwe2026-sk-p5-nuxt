import Swal from "sweetalert2";

const COLOR = "#0d9488";

export const showSuccessDialog = (message: string) =>
  Swal.fire({ icon: "success", title: "Berhasil", text: message, confirmButtonColor: COLOR });

export const showErrorDialog = (message: string) =>
  Swal.fire({ icon: "error", title: "Gagal", text: message, confirmButtonColor: COLOR });

export const showWarningDialog = (message: string) =>
  Swal.fire({ icon: "warning", title: "Perhatian", text: message, confirmButtonColor: COLOR });

export const showConfirmDialog = async (
  message: string,
  confirmText = "Ya, lanjutkan"
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: "question",
    title: "Konfirmasi",
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    confirmButtonColor: COLOR,
  });
  return result.isConfirmed;
};

export const formatRupiah = (value: number | string): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));

// Mendukung "2024-10-05 22:00:00" maupun ISO "2024-10-05T12:09:16.000000Z"
export const parseDate = (value: string): Date => new Date(String(value).replace(" ", "T"));

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(
    parseDate(value)
  );

// "2024-10-05" -> "2024-10-05 00:00:00" / "2024-10-05 23:59:59" (format query API)
export const toStartOfDay = (date: string): string => `${date} 00:00:00`;
export const toEndOfDay = (date: string): string => `${date} 23:59:59`;

export const getInitial = (name: string): string => String(name).trim().charAt(0).toUpperCase();

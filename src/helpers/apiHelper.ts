const TOKEN_KEY = "delcom_access_token";

export interface ApiResult<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | null | undefined>;
  formData?: FormData;
}

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const putAccessToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

export const removeAccessToken = (): void => localStorage.removeItem(TOKEN_KEY);

const buildUrl = (path: string, query: ApiOptions["query"] = {}): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (![undefined, null, ""].includes(value)) {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return `${DELCOM_BASEURL}${path}${queryString ? `?${queryString}` : ""}`;
};

/**
 * Wrapper fetch ke REST API Delcom dengan tipe data TypeScript.
 * Header Bearer token ditambahkan otomatis. Selalu mengembalikan
 * { success, message, data } dan tidak pernah melempar error.
 */
export async function apiFetch<T = any>(
  path: string,
  { method = "GET", body, query, formData }: ApiOptions = {}
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined = formData;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
    });
    const json = await response.json();
    const fields: string[] | undefined = json.data?.field;
    return {
      success: json.status === "success",
      message: fields ? fields.join(", ") : json.message,
      data: json.data ?? {},
    };
  } catch {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server",
      data: {} as T,
    };
  }
}

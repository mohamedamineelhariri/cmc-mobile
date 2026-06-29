import { API_BASE_URL } from "@/utils/constants";
import { getToken } from "@/utils/storage";

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = options.token ?? (await getToken());
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let detail = "An error occurred";
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {}
    throw new Error(detail);
  }

  return response.json();
}

export async function apiFetchText(endpoint: string, options: FetchOptions = {}): Promise<string> {
  const token = options.token ?? (await getToken());
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let detail = "An error occurred";
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {}
    throw new Error(detail);
  }

  return response.text();
}

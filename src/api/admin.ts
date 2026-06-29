import { apiFetch } from "./client";
import type { User } from "@/types";

export interface AdminUser {
  id: string;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  is_admin: boolean;
  is_active: boolean;
  role?: string;
}

export interface KbStats {
  total_files: number;
  files_ok: number;
  files_failed: number;
  files_processing: number;
  total_big_chunks: number;
  total_small_chunks: number;
  total_summaries: number;
  total_users: number;
}

export const adminApi = {
  // Users
  listUsers: (activeOnly?: boolean) => {
    const qs = activeOnly !== undefined ? `?active_only=${activeOnly}` : "";
    return apiFetch<AdminUser[]>(`administration/${qs}`);
  },

  createUser: (data: {
    username: string; password: string; first_name?: string; last_name?: string;
    email?: string; phone_number?: string; is_admin?: boolean;
  }) =>
    apiFetch<AdminUser>("administration/", { method: "POST", body: JSON.stringify(data) }),

  updateUser: (userId: string, data: {
    username?: string; first_name?: string; last_name?: string;
    email?: string; phone_number?: string; is_admin?: boolean; is_active?: boolean;
  }) =>
    apiFetch<AdminUser>(`administration/${userId}`, { method: "PUT", body: JSON.stringify(data) }),

  disableUser: (userId: string) =>
    apiFetch<{ message: string }>(`administration/${userId}/disable`, { method: "POST" }),

  enableUser: (userId: string) =>
    apiFetch<{ message: string }>(`administration/${userId}/enable`, { method: "POST" }),

  deleteUser: (userId: string) =>
    apiFetch<{ message: string }>(`administration/${userId}`, { method: "DELETE" }),

  // KB Stats
  kbStats: () => apiFetch<KbStats>("knowledgebase/stats"),

  // Seed filieres
  seedFilieres: () =>
    apiFetch<{ message: string }>("api/v1/seed/filieres", { method: "POST" }),
};

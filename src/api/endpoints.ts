import { apiFetch, apiFetchText } from "./client";
import type {
  User, Student, Teacher, Schedule, Grade, Attendance,
  AttendanceStats, Announcement, Event, EventRegistration, NotificationDelivery,
  Club, Document, InternshipOffer, InternshipApplication,
  MarketplaceItem, LostFoundItem,
} from "@/types";

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<{ access_token: string; token_type: string }>("auth/token", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => apiFetch<User>("auth/me"),

  updateMe: (data: Partial<User>) =>
    apiFetch<User>("auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  registerFcmToken: (token: string) =>
    apiFetch<{ message: string }>("auth/fcm-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};

// ── Students ──────────────────────────────────────────────────────────────────

export const studentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Student[]>(`api/v1/students${qs}`);
  },

  get: (id: string) => apiFetch<Student>(`api/v1/students/${id}`),

  getByUserId: async (userId: string) => {
    const students = await studentApi.list();
    return students.find((s) => s.user_id === userId) || null;
  },
};

// ── Teachers ──────────────────────────────────────────────────────────────────

export const teacherApi = {
  list: () => apiFetch<Teacher[]>("api/v1/teachers"),
};

// ── Schedules ─────────────────────────────────────────────────────────────────

export const scheduleApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Schedule[]>(`api/v1/schedules${qs}`);
  },
};

// ── Grades ────────────────────────────────────────────────────────────────────

export const gradeApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Grade[]>(`api/v1/grades${qs}`);
  },

  getStudentGrades: (studentId: string, semester?: number) => {
    const qs = semester ? `?semester=${semester}` : "";
    return apiFetch<Grade[]>(`api/v1/students/${studentId}/grades${qs}`);
  },
};

// ── Attendance ────────────────────────────────────────────────────────────────

export const attendanceApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Attendance[]>(`api/v1/attendance${qs}`);
  },

  getStudentAttendance: (studentId: string) =>
    apiFetch<Attendance[]>(`api/v1/students/${studentId}/attendance`),

  getStats: (studentId: string) =>
    apiFetch<AttendanceStats>(`api/v1/students/${studentId}/attendance/stats`),
};

// ── Announcements ─────────────────────────────────────────────────────────────

export const announcementApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Announcement[]>(`api/v1/announcements${qs}`);
  },

  create: (data: { title: string; content: string; category?: string; target_role?: string; is_pinned?: boolean }) =>
    apiFetch<Announcement>("api/v1/announcements", { method: "POST", body: JSON.stringify(data) }),
};

// ── Events ────────────────────────────────────────────────────────────────────

export const eventApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Event[]>(`api/v1/events${qs}`);
  },

  get: (id: string) => apiFetch<Event>(`api/v1/events/${id}`),

  register: (eventId: string) =>
    apiFetch<{ id: string; event_id: string; status: string }>(
      `api/v1/events/${eventId}/register`, { method: "POST" }
    ),

  unregister: (eventId: string) =>
    apiFetch<{ message: string }>(`api/v1/events/${eventId}/register`, {
      method: "DELETE",
    }),

  create: (data: { title: string; description?: string; category: string; start_date: string; end_date?: string; location?: string; organizer?: string; max_participants?: number; image_url?: string; is_published?: boolean }) =>
    apiFetch<Event>("api/v1/events", { method: "POST", body: JSON.stringify(data) }),

  myRegistrations: () =>
    apiFetch<EventRegistration[]>("api/v1/events/my-registrations"),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationApi = {
  my: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<NotificationDelivery[]>(`api/v1/notifications/my${qs}`);
  },

  unreadCount: () =>
    apiFetch<{ unread_count: number }>("api/v1/notifications/unread-count"),

  markRead: (deliveryId: string) =>
    apiFetch<{ message: string }>(`api/v1/notifications/my/${deliveryId}/read`, {
      method: "POST",
    }),

  create: (data: { title: string; body?: string; category: string; priority?: string; target_role?: string; target_filiere_slug?: string; target_groupe?: string; link_url?: string }) =>
    apiFetch<unknown>("api/v1/notifications", { method: "POST", body: JSON.stringify(data) }),

  markAllRead: () =>
    apiFetch<{ message: string }>("api/v1/notifications/my/read-all", {
      method: "POST",
    }),
};

// ── Clubs ─────────────────────────────────────────────────────────────────────

export const clubApi = {
  list: () => apiFetch<Club[]>("api/v1/clubs"),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export const documentApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<Document[]>(`api/v1/documents${qs}`);
  },

  get: (id: string) => apiFetch<Document>(`api/v1/documents/${id}`),

  folders: () => apiFetch<string[]>("api/v1/documents/folders"),

  upload: async (file: { uri: string; name: string; mimeType: string }, metadata: {
    title: string; description?: string; category?: string; folder?: string;
  }) => {
    const token = await (await import("@/utils/storage")).getToken();
    const formData = new FormData();
    formData.append("file", file as any);
    formData.append("title", metadata.title);
    if (metadata.description) formData.append("description", metadata.description);
    formData.append("category", metadata.category || "general");
    if (metadata.folder) formData.append("folder", metadata.folder);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000"}/api/v1/documents/upload`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err || "Upload failed");
    }
    return response.json() as Promise<Document>;
  },

  delete: (id: string) =>
    apiFetch<{ message: string }>(`api/v1/documents/${id}`, { method: "DELETE" }),
};

// ── Internships ───────────────────────────────────────────────────────────────

export const internshipApi = {
  listOffers: (activeOnly = true) => {
    const qs = activeOnly ? "?active_only=true" : "";
    return apiFetch<InternshipOffer[]>(`api/v1/internship-offers${qs}`);
  },

  getOffer: (id: string) => apiFetch<InternshipOffer>(`api/v1/internship-offers/${id}`),

  apply: (offerId: string, data: { cv_url?: string; cover_letter?: string }) =>
    apiFetch<InternshipApplication>(`api/v1/internship-offers/${offerId}/apply`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  myApplications: () =>
    apiFetch<InternshipApplication[]>("api/v1/internship-applications"),
};

// ── Marketplace ───────────────────────────────────────────────────────────────

export const marketplaceApi = {
  list: (params?: { category?: string; status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<MarketplaceItem[]>(`api/v1/marketplace${qs}`);
  },

  my: () => apiFetch<MarketplaceItem[]>("api/v1/marketplace/my"),

  create: (data: { title: string; description?: string; price?: number; category?: string; condition?: string; image_urls?: string[] }) =>
    apiFetch<MarketplaceItem>("api/v1/marketplace", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: { title?: string; description?: string; price?: number; category?: string; condition?: string; image_urls?: string[]; status?: string }) =>
    apiFetch<MarketplaceItem>(`api/v1/marketplace/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`api/v1/marketplace/${id}`, { method: "DELETE" }),
};

// ── Lost & Found ──────────────────────────────────────────────────────────────

export const lostFoundApi = {
  list: (params?: { type?: string; status?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return apiFetch<LostFoundItem[]>(`api/v1/lost-found${qs}`);
  },

  create: (data: { type: string; title: string; description?: string; location_found?: string; image_url?: string }) =>
    apiFetch<LostFoundItem>("api/v1/lost-found", { method: "POST", body: JSON.stringify(data) }),

  updateStatus: (id: string, status: string) =>
    apiFetch<LostFoundItem>(`api/v1/lost-found/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
};

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const faqApi = {
  list: (category?: string) => {
    const qs = category ? `?category=${category}` : "";
    return apiFetch<{ id: string; question: string; answer: string; category: string | null }[]>(
      `api/v1/faq${qs}`
    );
  },
};

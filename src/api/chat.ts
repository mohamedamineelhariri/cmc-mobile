import { apiFetch, apiFetchText } from "./client";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatSource {
  source_type: string;
  score: number;
  rerank_score: number;
  snippet: string;
  file_path: string;
}

export interface ChatStats {
  sources_retrieved: number;
  retrieval_time_ms: number;
  generation_time_ms: number;
  total_time_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  response: string;
  user_msg_id: string;
  assistant_msg_id: string;
  sources: ChatSource[];
  stats: ChatStats;
}

// ── Conversations ──────────────────────────────────────────────────────────

export const conversationApi = {
  list: () => apiFetch<Conversation[]>("chatsystem/conversations"),

  create: () =>
    apiFetch<Conversation>("chatsystem/conversations", { method: "POST" }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`chatsystem/conversations/${id}`, {
      method: "DELETE",
    }),

  history: (id: string) =>
    apiFetch<ChatMessage[]>(`chatsystem/conversations/${id}/history`),
};

// ── Chat (non-streaming) ───────────────────────────────────────────────────

export async function sendChatMessage(
  conversationId: string,
  message: string
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>(
    `chatsystem/conversations/${conversationId}/chat`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
}

// ── Chat (streaming) ───────────────────────────────────────────────────────

export async function sendChatMessageStream(
  conversationId: string,
  message: string,
  onToken: (token: string) => void,
  onSources?: (sources: ChatSource[]) => void,
  onStats?: (stats: ChatStats) => void,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000"}/chatsystem/conversations/${conversationId}/chat?stream=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await import("@/utils/storage").then((m) => m.getToken())}`,
      },
      body: JSON.stringify({ message }),
      signal,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(errText || "Chat request failed");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;
        if (line === "[DONE]") continue;

        if (line === "[NEWLINE]") {
          onToken("\n");
          fullText += "\n";
        } else if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.content) {
              onToken(data.content);
              fullText += data.content;
            }
          } catch {}
        } else if (!line.startsWith("data:")) {
          onToken(line);
          fullText += line;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}

// ── Public chat (no auth) ──────────────────────────────────────────────────

export async function sendPublicChatMessage(
  message: string,
  history: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("chatsystem/public/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export async function sendPublicChatMessageStream(
  message: string,
  onToken: (token: string) => void,
  history: { role: string; content: string }[] = [],
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000"}/chatsystem/public/chat?stream=true`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal,
    }
  );

  if (!response.ok) throw new Error("Public chat request failed");

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim()) continue;
        if (line === "data: [DONE]") continue;

        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.content) {
              onToken(data.content);
              fullText += data.content;
            }
          } catch {}
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}

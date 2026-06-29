import { useState, useCallback, useRef } from "react";
import { conversationApi, sendChatMessageStream, type ChatMessage, type ChatSource, type ChatStats } from "@/api/chat";

interface UseChatOptions {
  conversationId: string | null;
}

export function useChat({ conversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [sources, setSources] = useState<ChatSource[]>([]);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadHistory = useCallback(async () => {
    if (!conversationId) return;
    try {
      const history = await conversationApi.history(conversationId);
      setMessages(history);
    } catch (e) {
      console.warn("Failed to load history:", e);
    }
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;

      const userMessage: ChatMessage = {
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setStreamingText("");
      setSources([]);
      setStats(null);

      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        await sendChatMessageStream(
          conversationId,
          text,
          (token) => {
            setStreamingText((prev) => prev + token);
          },
          (srcs) => {
            setSources(srcs);
          },
          (st) => {
            setStats(st);
          },
          abortController.signal
        );

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: streamingText,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, { ...assistantMessage, content: streamingText }]);
        setStreamingText("");
      } catch (e: any) {
        if (e.name === "AbortError") return;
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: "Désolé, une erreur est survenue. Veuillez réessayer.",
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [conversationId]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    if (streamingText) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: streamingText, created_at: new Date().toISOString() },
      ]);
      setStreamingText("");
    }
    setIsLoading(false);
  }, [streamingText]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingText("");
    setSources([]);
    setStats(null);
  }, []);

  return {
    messages,
    streamingText,
    isLoading,
    sources,
    stats,
    sendMessage,
    stopStreaming,
    loadHistory,
    clearMessages,
  };
}

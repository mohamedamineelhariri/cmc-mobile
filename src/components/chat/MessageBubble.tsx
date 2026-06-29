import { View, Text, Image } from "react-native";
import type { ChatSource } from "@/api/chat";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, timestamp, sources, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <View className={`mb-4 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-cmc-teal rounded-br-md"
            : "bg-white border border-gray-100 rounded-bl-md"
        }`}
      >
        {!isUser && (
          <View className="flex-row items-center mb-1.5">
            <View className="h-5 w-5 rounded-full bg-cmc-teal/20 items-center justify-center mr-1.5">
              <Text className="text-[9px] font-bold text-cmc-teal">AI</Text>
            </View>
            <Text className="text-[11px] font-medium text-cmc-teal">Assistant CMC</Text>
          </View>
        )}

        <Text className={`text-sm leading-5 ${isUser ? "text-white" : "text-gray-800"}`}>
          {content}
          {isStreaming && <Text className="animate-pulse">▌</Text>}
        </Text>
      </View>

      {timestamp && (
        <Text className="text-[10px] text-gray-400 mt-1 px-1">
          {new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      )}

      {sources && sources.length > 0 && !isUser && (
        <View className="mt-1.5 ml-2">
          <Text className="text-[10px] text-gray-400 font-medium mb-1">Sources</Text>
          <View className="flex-row flex-wrap gap-1">
            {sources.slice(0, 3).map((s, i) => (
              <View key={i} className="bg-gray-100 rounded-full px-2 py-0.5">
                <Text className="text-[9px] text-gray-600" numberOfLines={1}>
                  {s.file_path?.split("/").pop() || s.source_type}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

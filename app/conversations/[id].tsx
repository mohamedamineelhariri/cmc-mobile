import { useEffect, useRef } from "react";
import { View, Text, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ArrowLeft, Trash2, Info } from "lucide-react-native";

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);

  const { messages, streamingText, isLoading, sources, sendMessage, stopStreaming, loadHistory, clearMessages } =
    useChat({ conversationId: id || null });

  useEffect(() => {
    if (id) loadHistory();
  }, [id]);

  const allMessages = [
    ...messages,
    ...(streamingText
      ? [{ role: "assistant" as const, content: streamingText, id: "streaming" }]
      : []),
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View className="bg-cmc-teal px-4 pt-14 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-base font-semibold" numberOfLines={1}>
              Assistant CMC
            </Text>
            {isLoading && (
              <Text className="text-white/70 text-[11px]">En train d'écrire...</Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={clearMessages} className="mr-2">
          <Trash2 size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={allMessages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <MessageBubble
            role={item.role}
            content={item.content}
            timestamp={item.created_at}
            isStreaming={item.id === "streaming"}
          />
        )}
        ListFooterComponent={isLoading && !streamingText ? <TypingIndicator /> : null}
      />

      {/* Sources indicator */}
      {sources.length > 0 && !streamingText && (
        <View className="px-4 py-2 bg-white border-t border-gray-100">
          <TouchableOpacity className="flex-row items-center">
            <Info size={14} color="#9ca3af" />
            <Text className="text-[11px] text-gray-500 ml-1.5">
              {sources.length} source{sources.length > 1 ? "s" : ""} consultée{sources.length > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <ChatInput onSend={sendMessage} onStop={stopStreaming} isLoading={isLoading} />
    </KeyboardAvoidingView>
  );
}

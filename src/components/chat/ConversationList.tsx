import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MessageSquare, ChevronRight, Clock } from "lucide-react-native";
import type { Conversation } from "@/api/chat";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
}

export function ConversationList({ conversations, isLoading }: ConversationListProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-gray-400">Chargement...</Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <MessageSquare size={48} color="#d1d5db" />
        <Text className="text-base text-gray-400 mt-4 text-center">Aucune conversation</Text>
        <Text className="text-sm text-gray-400 mt-1 text-center">
          Posez votre première question à l'assistant CMC
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/conversations/${item.id}` as any)}
          className="bg-white rounded-xl border border-gray-100 p-4 mb-2 flex-row items-center"
        >
          <View className="h-10 w-10 rounded-full bg-cmc-teal/10 items-center justify-center mr-3">
            <MessageSquare size={20} color="#32acc1" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-800" numberOfLines={1}>
              {item.title || "Nouvelle conversation"}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Clock size={12} color="#9ca3af" />
              <Text className="text-[11px] text-gray-400 ml-1">
                {new Date(item.updated_at || item.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color="#d1d5db" />
        </TouchableOpacity>
      )}
    />
  );
}

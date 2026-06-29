import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { conversationApi } from "@/api/chat";
import { ConversationList } from "@/components/chat/ConversationList";
import { Skeleton } from "@/components/ui/Skeleton";
import { Plus, MessageCircle } from "lucide-react-native";

export default function ChatTabScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => conversationApi.list(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const handleNewConversation = async () => {
    try {
      const conv = await conversationApi.create();
      router.push(`/conversations/${conv.id}` as any);
    } catch (e) {
      console.warn("Failed to create conversation:", e);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px] flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MessageCircle size={24} color="white" />
          <Text className="text-white text-xl font-bold ml-2">Assistant CMC</Text>
        </View>
        <TouchableOpacity
          onPress={handleNewConversation}
          className="bg-white/20 h-9 w-9 rounded-full items-center justify-center"
        >
          <Plus size={22} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 mb-2" />
          ))}
        </View>
      ) : (
        <ConversationList conversations={conversations || []} />
      )}
    </View>
  );
}

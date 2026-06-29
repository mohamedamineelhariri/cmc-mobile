import { View, Text, ScrollView, TouchableOpacity, RefreshControl, AppState } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/endpoints";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Bell, ArrowLeft, CheckCheck, Mail, MailOpen } from "lucide-react-native";

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.my(),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unread = data?.filter((n: any) => !n.is_read).length || 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 flex-row items-center justify-between rounded-b-[24px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Notifications</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={() => markAllMutation.mutate()} className="bg-white/20 px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-medium">Tout lire</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 mb-2" />)
        ) : data && data.length > 0 ? (
          data.map((n: any, i: number) => (
            <TouchableOpacity
              key={n.id || i}
              onPress={() => !n.is_read && markReadMutation.mutate(n.id)}
              className={`bg-white rounded-xl p-4 mb-2 border ${n.is_read ? "border-gray-100" : "border-cmc-teal/30"}`}
            >
              <View className="flex-row items-start">
                <View className={`h-8 w-8 rounded-full items-center justify-center mr-3 ${n.is_read ? "bg-gray-100" : "bg-cmc-teal/10"}`}>
                  {n.is_read ? <MailOpen size={16} color="#9ca3af" /> : <Mail size={16} color="#32acc1" />}
                </View>
                <View className="flex-1">
                  <Text className={`text-sm ${n.is_read ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                    {n.title || n.notification?.title}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                    {n.message || n.notification?.body}
                  </Text>
                  <Text className="text-[10px] text-gray-400 mt-1.5">
                    {new Date(n.created_at || n.notification?.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </Text>
                </View>
                {!n.is_read && <View className="h-2 w-2 rounded-full bg-cmc-teal mt-2" />}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <Bell size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucune notification</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

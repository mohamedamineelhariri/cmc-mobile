import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { clubApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Users, ArrowLeft, ExternalLink } from "lucide-react-native";

export default function ClubsScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["clubs"],
    queryFn: () => clubApi.list(),
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Clubs</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 mb-3" />)
        ) : data && data.length > 0 ? (
          data.map((club: any, i: number) => (
            <Card key={club.id || i} className="mb-3">
              <View className="flex-row items-start">
                <View className="h-12 w-12 rounded-xl bg-cmc-teal/10 items-center justify-center mr-3">
                  <Users size={24} color="#32acc1" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">{club.name}</Text>
                  <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>{club.description}</Text>
                  <View className="flex-row items-center mt-2 gap-2">
                    {club.category && <Badge label={club.category} variant="info" />}
                    {club.member_count && <Badge label={`${club.member_count} membres`} variant="default" />}
                  </View>
                </View>
                <ExternalLink size={18} color="#9ca3af" />
              </View>
            </Card>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <Users size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucun club disponible</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

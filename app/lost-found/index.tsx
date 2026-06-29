import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lostFoundApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Plus, Search, MapPin, Clock, RotateCw, CircleCheck } from "lucide-react-native";

const TYPES = ["Tous", "lost", "found"] as const;
const TYPE_LABELS: Record<string, string> = { lost: "Perdu", found: "Trouvé" };
const TYPE_COLORS: Record<string, "danger" | "success"> = { lost: "danger", found: "success" };

export default function LostFoundScreen() {
  const [filterType, setFilterType] = useState<string>("Tous");
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["lost-found", filterType],
    queryFn: () => lostFoundApi.list({ type: filterType === "Tous" ? undefined : filterType }),
  });

  const claimMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => lostFoundApi.updateStatus(id, "claimed"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lost-found"] }),
  });

  const handleClaim = (id: string) => {
    Alert.alert("Réclamer", "Confirmez-vous que cet objet vous appartient ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Réclamer", onPress: () => claimMutation.mutate({ id }) },
    ]);
  };

  const typeLabel = filterType === "Tous" ? "lost" : filterType;
  const emptyIcon = typeLabel === "found" ? "Recherche" : "Aucun signalement";

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px] flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3"><ArrowLeft size={24} color="white" /></TouchableOpacity>
          <Text className="text-white text-xl font-bold">Objets trouvés</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/lost-found/new" as any)}
          className="bg-white/20 h-9 w-9 rounded-full items-center justify-center"
        >
          <Plus size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Type filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
        {TYPES.map((t) => (
          <TouchableOpacity key={t} onPress={() => setFilterType(t)}
            className={`px-5 py-3 ${filterType === t ? "border-b-2 border-cmc-teal" : ""}`}>
            <Text className={`text-sm ${filterType === t ? "text-cmc-teal font-bold" : "text-gray-500"}`}>
              {t === "Tous" ? "Tous" : TYPE_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 mb-3" />)
        ) : data && data.length > 0 ? (
          data.map((item, i) => (
            <Card key={item.id || i} className="mb-3">
              <View className="flex-row items-start">
                <View className={`h-10 w-10 rounded-xl items-center justify-center mr-3 ${item.type === "lost" ? "bg-red-50" : "bg-green-50"}`}>
                  <Search size={20} color={item.type === "lost" ? "#ef4444" : "#10b981"} />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-gray-800 flex-1 mr-2">{item.title}</Text>
                    <Badge label={TYPE_LABELS[item.type] || item.type} variant={TYPE_COLORS[item.type] || "info"} />
                  </View>
                  {item.description && <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{item.description}</Text>}
                  <View className="flex-row items-center mt-2 gap-3">
                    {item.location_found && (
                      <View className="flex-row items-center">
                        <MapPin size={11} color="#9ca3af" />
                        <Text className="text-[11px] text-gray-500 ml-1">{item.location_found}</Text>
                      </View>
                    )}
                    {item.created_at && (
                      <View className="flex-row items-center">
                        <Clock size={11} color="#9ca3af" />
                        <Text className="text-[11px] text-gray-500 ml-1">{new Date(item.created_at).toLocaleDateString("fr-FR")}</Text>
                      </View>
                    )}
                  </View>
                  {item.status !== "claimed" && (
                    <TouchableOpacity onPress={() => handleClaim(item.id)} className="mt-2 self-start">
                      <View className="flex-row items-center bg-cmc-teal/10 rounded-full px-3 py-1">
                        <CircleCheck size={12} color="#32acc1" />
                        <Text className="text-[11px] text-cmc-teal font-medium ml-1">Réclamer</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  {item.status === "claimed" && <Badge label="Réclamé" variant="success" />}
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <Search size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucun signalement</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

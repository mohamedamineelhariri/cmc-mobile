import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Package, Tag, Euro, Trash2 } from "lucide-react-native";

const CONDITIONS = [
  { value: "new", label: "Neuf" },
  { value: "like_new", label: "Comme neuf" },
  { value: "good", label: "Bon état" },
  { value: "fair", label: "État correct" },
];

export default function MarketplaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["marketplace-item", id],
    queryFn: async () => {
      const all = await marketplaceApi.list();
      return all.find((i) => i.id === id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => marketplaceApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      router.back();
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-cmc-teal px-6 pt-14 pb-4">
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="white" /></TouchableOpacity>
        </View>
        <View className="p-4"><Skeleton className="h-64" /></View>
      </View>
    );
  }

  if (!item) return <View className="flex-1 bg-gray-50 items-center justify-center"><Text className="text-gray-400">Article introuvable</Text></View>;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-6 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-4"><ArrowLeft size={24} color="white" /></TouchableOpacity>
        <View className="flex-row items-center">
          <View className="h-16 w-16 rounded-2xl bg-white/20 items-center justify-center mr-4">
            <Package size={32} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{item.title}</Text>
            {item.price && <Text className="text-white/90 text-lg font-semibold mt-1">{item.price.toFixed(2)} DH</Text>}
          </View>
        </View>
      </View>

      <View className="px-4 -mt-4">
        <Card className="mb-4">
          <View className="flex-row flex-wrap gap-2 mb-3">
            {item.category && <Badge label={item.category} variant="info" />}
            {item.condition && <Badge label={CONDITIONS.find((c) => c.value === item.condition)?.label || item.condition} variant="default" />}
            <Badge label={item.status === "available" ? "Disponible" : "Vendu"} variant={item.status === "available" ? "success" : "danger"} />
          </View>
          {item.description && (
            <View className="mb-3">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Description</Text>
              <Text className="text-sm text-gray-600 leading-5">{item.description}</Text>
            </View>
          )}
        </Card>

        {item.status === "available" && (
          <TouchableOpacity
            onPress={() => Alert.alert("Info", "Contactez le vendeur via la messagerie interne")}
            className="bg-cmc-teal rounded-xl py-3.5 items-center mb-4"
          >
            <Text className="text-white font-semibold text-base">Contacter le vendeur</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            Alert.alert("Supprimer", "Voulez-vous supprimer cette annonce ?", [
              { text: "Annuler", style: "cancel" },
              { text: "Supprimer", style: "destructive", onPress: () => deleteMutation.mutate() },
            ]);
          }}
          className="flex-row items-center justify-center py-2 mb-6"
        >
          <Trash2 size={16} color="#ef4444" />
          <Text className="text-sm text-red-500 font-medium ml-1.5">Supprimer mon annonce</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

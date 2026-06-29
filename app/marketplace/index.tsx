import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { marketplaceApi } from "@/api/endpoints";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, ArrowLeft, Plus, Tag, Package } from "lucide-react-native";

const CATEGORIES = ["Tous", "Livres", "Électronique", "Vêtements", "Meubles", "Autre"];
const CONDITIONS: Record<string, string> = { new: "Neuf", like_new: "Comme neuf", good: "Bon état", fair: "État correct" };

export default function MarketplaceScreen() {
  const [category, setCategory] = useState("Tous");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["marketplace", category],
    queryFn: () => marketplaceApi.list({ category: category === "Tous" ? undefined : category }),
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px] flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Boutique</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/marketplace/new" as any)}
          className="bg-white/20 h-9 w-9 rounded-full items-center justify-center"
        >
          <Plus size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            className={`px-5 py-3 ${category === cat ? "border-b-2 border-cmc-teal" : ""}`}
          >
            <Text className={`text-sm ${category === cat ? "text-cmc-teal font-bold" : "text-gray-500"}`}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 mb-3" />)
        ) : data && data.length > 0 ? (
          <View className="flex-row flex-wrap justify-between">
            {data.map((item, i) => (
              <TouchableOpacity
                key={item.id || i}
                onPress={() => router.push(`/marketplace/${item.id}` as any)}
                className="bg-white rounded-xl border border-gray-100 mb-3 w-[48%] overflow-hidden"
              >
                <View className="h-28 bg-gray-100 items-center justify-center">
                  <Package size={36} color="#d1d5db" />
                </View>
                <View className="p-2.5">
                  <Text className="text-sm font-semibold text-gray-800" numberOfLines={1}>{item.title}</Text>
                  {item.price && (
                    <Text className="text-base font-bold text-cmc-teal mt-0.5">{item.price.toFixed(2)} DH</Text>
                  )}
                  <View className="flex-row items-center mt-1 gap-1">
                    {item.category && <Badge label={item.category} variant="info" />}
                    {item.condition && <Badge label={CONDITIONS[item.condition] || item.condition} variant="default" />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <ShoppingBag size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucun article</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { faqApi } from "@/api/endpoints";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { MessageCircle, ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react-native";

export default function FAQScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["faq", category],
    queryFn: () => faqApi.list(category || undefined),
  });

  const categories = [...new Set(data?.map((f: any) => f.category).filter(Boolean) as string[])];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">FAQ</Text>
        </View>
      </View>

      {/* Category filter */}
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => setCategory(null)}
            className={`px-5 py-3 ${!category ? "border-b-2 border-cmc-teal" : ""}`}
          >
            <Text className={`text-sm ${!category ? "text-cmc-teal font-bold" : "text-gray-500"}`}>Toutes</Text>
          </TouchableOpacity>
          {categories.map((cat: string) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-5 py-3 ${category === cat ? "border-b-2 border-cmc-teal" : ""}`}
            >
              <Text className={`text-sm ${category === cat ? "text-cmc-teal font-bold" : "text-gray-500"}`}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 mb-2" />)
        ) : data && data.length > 0 ? (
          data.map((faq: any, i: number) => {
            const isExpanded = expandedId === faq.id;
            return (
              <TouchableOpacity
                key={faq.id || i}
                onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                className="bg-white rounded-xl mb-2 border border-gray-100 overflow-hidden"
              >
                <View className="flex-row items-center justify-between p-4">
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center gap-2 mb-0.5">
                      {faq.category && <Badge label={faq.category} variant="info" />}
                    </View>
                    <Text className="text-sm font-medium text-gray-800">{faq.question}</Text>
                  </View>
                  {isExpanded ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                </View>
                {isExpanded && (
                  <View className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <Text className="text-sm text-gray-600 leading-5">{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <MessageCircle size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucune FAQ disponible</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { internshipApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, ArrowLeft, Search, Building2, MapPin, Clock, ChevronRight } from "lucide-react-native";

export default function InternshipsScreen() {
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["internship-offers"],
    queryFn: () => internshipApi.listOffers(),
  });

  const filtered = data?.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Stages</Text>
        </View>

        <View className="flex-row items-center bg-white/20 rounded-xl px-3 mt-3">
          <Search size={18} color="white" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher par titre ou entreprise..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            className="flex-1 py-2.5 px-2 text-white text-sm"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 mb-3" />)
        ) : filtered && filtered.length > 0 ? (
          filtered.map((offer, i) => (
            <TouchableOpacity
              key={offer.id || i}
              onPress={() => router.push(`/internships/${offer.id}` as any)}
              className="bg-white rounded-xl border border-gray-100 p-4 mb-3"
            >
              <View className="flex-row items-start">
                <View className="h-12 w-12 rounded-xl bg-cmc-teal/10 items-center justify-center mr-3">
                  <Building2 size={24} color="#32acc1" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">{offer.title}</Text>
                  <Text className="text-sm text-cmc-teal font-medium mt-0.5">{offer.company_name}</Text>
                  <View className="flex-row items-center mt-2 gap-3">
                    {offer.location && (
                      <View className="flex-row items-center">
                        <MapPin size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-500 ml-1">{offer.location}</Text>
                      </View>
                    )}
                    {offer.duration && (
                      <View className="flex-row items-center">
                        <Clock size={12} color="#9ca3af" />
                        <Text className="text-xs text-gray-500 ml-1">{offer.duration}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <ChevronRight size={18} color="#d1d5db" />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <Briefcase size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">
              {search ? "Aucun résultat" : "Aucune offre de stage"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

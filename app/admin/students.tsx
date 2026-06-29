import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/api/endpoints";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Search, GraduationCap, Filter } from "lucide-react-native";

const STATUS_FILTERS = ["all", "active", "inactive", "graduated"];

export default function AdminStudentsScreen() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-students"],
    queryFn: () => studentApi.list(),
  });

  const levels = useMemo(() => {
    if (!data) return ["all"];
    return ["all", ...new Set(data.map((s) => s.level).filter(Boolean))] as string[];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    let result = data;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.first_name.toLowerCase().includes(q) ||
          s.last_name.toLowerCase().includes(q) ||
          s.cne.toLowerCase().includes(q) ||
          s.cni?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.filiere_name?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (levelFilter !== "all") {
      result = result.filter((s) => s.level === levelFilter);
    }
    return result;
  }, [data, search, statusFilter, levelFilter]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Étudiants</Text>
          <Text className="text-white/70 text-sm ml-2">({data?.length || 0})</Text>
        </View>
        <View className="flex-row items-center bg-white/20 rounded-xl px-3">
          <Search size={18} color="rgba(255,255,255,0.7)" />
          <TextInput value={search} onChangeText={setSearch}
            placeholder="Rechercher..." placeholderTextColor="rgba(255,255,255,0.6)"
            className="flex-1 py-2.5 px-2 text-white text-sm" />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 -mx-4 px-4">
          <View className="flex-row gap-2">
            {STATUS_FILTERS.map((f) => (
              <TouchableOpacity key={f} onPress={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-full border ${statusFilter === f ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-xs ${statusFilter === f ? "text-white font-medium" : "text-gray-600"}`}>
                  {f === "all" ? "Tous" : f === "active" ? "Actif" : f === "inactive" ? "Inactif" : "Diplômé"}
                </Text>
              </TouchableOpacity>
            ))}
            <View className="w-px bg-gray-200 mx-1" />
            {levels.map((l) => (
              <TouchableOpacity key={l} onPress={() => setLevelFilter(l)}
                className={`px-3 py-1.5 rounded-full border ${levelFilter === l ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-xs ${levelFilter === l ? "text-white font-medium" : "text-gray-600"}`}>
                  {l === "all" ? "Niveaux" : l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 mb-2" />)
        ) : filtered.length > 0 ? (
          filtered.map((student, i) => (
            <View key={student.id || i} className="bg-white rounded-xl border border-gray-100 p-4 mb-2">
              <View className="flex-row items-center">
                <View className={`h-10 w-10 rounded-full items-center justify-center ${student.status === "active" ? "bg-cmc-teal/10" : "bg-gray-100"}`}>
                  <Text className={`text-sm font-bold ${student.status === "active" ? "text-cmc-teal" : "text-gray-400"}`}>
                    {(student.first_name?.[0] || "?").toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800">
                      {student.first_name} {student.last_name}
                    </Text>
                    <GraduationCap size={14} color="#32acc1" />
                  </View>
                  <Text className="text-xs text-gray-500">{student.cne}</Text>
                  <View className="flex-row items-center mt-1 gap-1.5 flex-wrap">
                    <Badge label={student.status === "active" ? "Actif" : student.status} variant={student.status === "active" ? "success" : "warning"} />
                    {student.filiere_name && <Badge label={student.filiere_name} variant="info" />}
                    {student.level && <Badge label={student.level} variant="default" />}
                    {student.group_name && <Badge label={`Grp ${student.group_name}`} variant="default" />}
                  </View>
                </View>
              </View>
              {student.email && (
                <Text className="text-xs text-gray-400 mt-2 ml-[52px]">{student.email}{student.phone ? ` • ${student.phone}` : ""}</Text>
              )}
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <GraduationCap size={40} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-3">Aucun étudiant trouvé</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

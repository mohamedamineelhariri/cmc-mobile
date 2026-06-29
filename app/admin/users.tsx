import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert } from "react-native";
import { router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Search, UserCheck, UserX, Shield, Trash2 } from "lucide-react-native";

export default function AdminUsersScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.listUsers(),
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? adminApi.disableUser(id) : adminApi.enableUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Utilisateurs</Text>
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
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 mb-2" />)
        ) : filtered.length > 0 ? (
          filtered.map((user, i) => (
            <View key={user.id || i} className="bg-white rounded-xl border border-gray-100 p-4 mb-2">
              <View className="flex-row items-center">
                <View className={`h-10 w-10 rounded-full items-center justify-center ${user.is_active ? "bg-cmc-teal/10" : "bg-gray-100"}`}>
                  <Text className={`text-sm font-bold ${user.is_active ? "text-cmc-teal" : "text-gray-400"}`}>
                    {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1 ml-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-medium text-gray-800">
                      {user.first_name ? `${user.first_name} ${user.last_name || ""}` : user.username}
                    </Text>
                    {user.is_admin && <Shield size={14} color="#6366f1" />}
                  </View>
                  <Text className="text-xs text-gray-500">{user.username}{user.email ? ` • ${user.email}` : ""}</Text>
                  <View className="flex-row items-center mt-1 gap-1.5">
                    <Badge label={user.is_active ? "Actif" : "Inactif"} variant={user.is_active ? "success" : "danger"} />
                    {user.role && <Badge label={user.role} variant="info" />}
                  </View>
                </View>
                <View className="flex-row gap-1">
                  <TouchableOpacity
                    onPress={() => toggleActiveMutation.mutate({ id: user.id, isActive: user.is_active })}
                    className="p-2"
                  >
                    {user.is_active ? <UserX size={18} color="#ef4444" /> : <UserCheck size={18} color="#10b981" />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Confirmer", `Supprimer ${user.username} ?`, [
                        { text: "Annuler", style: "cancel" },
                        { text: "Supprimer", style: "destructive", onPress: () => deleteMutation.mutate(user.id) },
                      ]);
                    }}
                    className="p-2"
                  >
                    <Trash2 size={18} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <Text className="text-base text-gray-400">Aucun utilisateur</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

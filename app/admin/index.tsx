import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { adminApi } from "@/api/admin";
import { studentApi, teacherApi, eventApi, announcementApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Users, GraduationCap, CalendarDays, Bell, Megaphone, Database, Shield } from "lucide-react-native";

const ADMIN_ROLES = ["super_admin", "director", "communication", "student_affairs"];

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const isAdmin = user?.is_admin || ADMIN_ROLES.includes(user?.role || "");

  const { data: users } = useQuery({ queryKey: ["admin-users"], queryFn: () => adminApi.listUsers() });
  const { data: students } = useQuery({ queryKey: ["admin-students"], queryFn: () => studentApi.list() });
  const { data: teachers } = useQuery({ queryKey: ["admin-teachers"], queryFn: () => teacherApi.list() });
  const { data: events } = useQuery({ queryKey: ["admin-events"], queryFn: () => eventApi.list() });
  const { data: announcements } = useQuery({ queryKey: ["admin-announcements"], queryFn: () => announcementApi.list() });

  if (!isAdmin) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Shield size={48} color="#d1d5db" />
        <Text className="text-base text-gray-400 mt-4">Accès réservé aux administrateurs</Text>
      </View>
    );
  }

  const menuItems = [
    { icon: Users, label: "Utilisateurs", route: "/admin/users", color: "#6366f1", count: users?.length },
    { icon: GraduationCap, label: "Étudiants", route: "/admin/students", color: "#32acc1", count: students?.length },
    { icon: Bell, label: "Annonce", route: "/admin/announcement", color: "#f59e0b" },
    { icon: CalendarDays, label: "Événement", route: "/admin/event", color: "#8b5cf6" },
    { icon: Megaphone, label: "Notification", route: "/admin/notification", color: "#ef4444" },
    { icon: Database, label: "Seeder Filières", route: "/admin/seed", color: "#10b981" },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-6 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Administration</Text>
          </View>
          <Badge label={user?.role || "admin"} variant="info" />
        </View>
        <Text className="text-white/80 text-sm">
          Bienvenue, {user?.first_name || user?.username}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Stats cards */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {[
            { label: "Utilisateurs", value: users?.length || 0, color: "#6366f1" },
            { label: "Étudiants", value: students?.length || 0, color: "#32acc1" },
            { label: "Professeurs", value: teachers?.length || 0, color: "#10b981" },
            { label: "Événements", value: events?.length || 0, color: "#f59e0b" },
          ].map((stat, i) => (
            <View key={i} className="bg-white rounded-xl border border-gray-100 w-[48%] p-3 mb-2.5">
              <Text className="text-2xl font-bold text-gray-800">{stat.value}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
          Actions rapides
        </Text>
        <View className="flex-row flex-wrap justify-between">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(item.route as any)}
              className="bg-white rounded-xl border border-gray-100 w-[48%] p-4 mb-2.5 flex-row items-center"
            >
              <View className="h-10 w-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: item.color + "15" }}>
                <item.icon size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-800">{item.label}</Text>
                {item.count !== undefined && (
                  <Text className="text-[11px] text-gray-500">{item.count} total</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <Card title="Dernières annonces" className="mt-2">
            {announcements.slice(0, 3).map((a: any, i: number) => (
              <View key={i} className="py-2 border-b border-gray-100 last:border-0">
                <Text className="text-sm font-medium text-gray-800">{a.title}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{a.category}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

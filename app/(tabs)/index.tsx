import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { announcementApi, scheduleApi, attendanceApi } from "@/api/endpoints";
import { Calendar, Bell, BookOpen, ClipboardList, ChevronRight, Users, FileText } from "lucide-react-native";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardScreen() {
  const { user } = useAuth();

  const { data: announcements, isLoading: loadingAnn } = useQuery({
    queryKey: ["announcements", "latest"],
    queryFn: () => announcementApi.list({ limit: "3" }),
  });

  const { data: todaySchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ["schedules", "today"],
    queryFn: () => {
      const today = new Date().toISOString().slice(0, 10);
      return scheduleApi.list({ date: today });
    },
  });

  const quickActions = [
    { icon: Calendar, label: "Emploi du temps", route: "/(tabs)/schedule", color: "#32acc1" },
    { icon: BookOpen, label: "Notes", route: "/(tabs)/grades", color: "#8b5cf6" },
    { icon: ClipboardList, label: "Absences", route: "/(tabs)/attendance", color: "#f59e0b" },
    { icon: FileText, label: "Documents", route: "/documents", color: "#ef4444" },
    { icon: Users, label: "Clubs", route: "/clubs", color: "#10b981" },
    { icon: Bell, label: "Actualités", route: "/events", color: "#ec4899" },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header */}
      <View className="bg-cmc-teal px-6 pt-14 pb-8 rounded-b-[32px]">
        <Text className="text-white/80 text-sm">{getGreeting()}</Text>
        <Text className="text-white text-2xl font-bold mt-1">
          {user?.first_name} {user?.last_name}
        </Text>
        <View className="flex-row items-center mt-2">
          <Badge label={user?.role === "student" ? "Étudiant" : user?.role || "Utilisateur"} variant="info" />
        </View>
      </View>

      <View className="px-4 -mt-4">
        {/* Quick Actions */}
        <View className="flex-row flex-wrap">
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(action.route as any)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 w-[30%] mr-[5%] mb-3 p-3 items-center"
              style={i % 3 === 2 ? { marginRight: 0 } : undefined}
            >
              <View className="h-10 w-10 rounded-full items-center justify-center mb-2" style={{ backgroundColor: action.color + "20" }}>
                <action.icon size={20} color={action.color} />
              </View>
              <Text className="text-[11px] text-gray-600 text-center font-medium">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Schedule */}
        <Card title="Emploi du jour" className="mb-4">
          {loadingSchedule ? (
            <Skeleton className="h-16" />
          ) : todaySchedule && todaySchedule.length > 0 ? (
            todaySchedule.slice(0, 3).map((s: any, i: number) => (
              <View key={i} className="flex-row items-center py-2 border-b border-gray-100 last:border-0">
                <View className="bg-cmc-teal/10 rounded-lg px-2 py-1 min-w-[60px] items-center mr-3">
                  <Text className="text-xs font-bold text-cmc-teal">{formatTime(s.start_time)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">{s.module_name || s.module_id}</Text>
                  {s.teacher_name && <Text className="text-xs text-gray-500">{s.teacher_name}</Text>}
                </View>
                {s.room && <Badge label={s.room} variant="default" />}
              </View>
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-sm text-gray-400">Aucun cours aujourd'hui</Text>
            </View>
          )}
        </Card>

        {/* Announcements */}
        <Card title="Annonces récentes" className="mb-4">
          {loadingAnn ? (
            <Skeleton className="h-16" />
          ) : announcements && announcements.length > 0 ? (
            announcements.slice(0, 3).map((a: any, i: number) => (
              <TouchableOpacity key={i} className="py-2.5 border-b border-gray-100 last:border-0">
                <View className="flex-row items-start justify-between">
                  <Text className="text-sm font-medium text-gray-800 flex-1 mr-2">{a.title}</Text>
                  <Badge label={a.category || "info"} variant="info" />
                </View>
                <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{a.content}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-sm text-gray-400">Aucune annonce</Text>
            </View>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

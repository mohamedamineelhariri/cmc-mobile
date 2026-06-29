import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ClipboardList, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react-native";

export default function AttendanceScreen() {
  const { user } = useAuth();
  const studentId = user?.student_id || "";

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["attendance-stats", studentId],
    queryFn: () => attendanceApi.getStats(studentId),
    enabled: !!studentId,
  });

  const { data: records, isLoading: recordsLoading, refetch } = useQuery({
    queryKey: ["attendance", studentId],
    queryFn: () => attendanceApi.getStudentAttendance(studentId),
    enabled: !!studentId,
  });

  const monthRecords = records?.reduce((acc: any, r: any) => {
    const month = new Date(r.date || r.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(r);
    return acc;
  }, {});

  const isLoading = statsLoading || recordsLoading;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <Text className="text-white text-xl font-bold">Assiduité</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          <>
            <Skeleton className="h-24 mb-3" />
            <Skeleton className="h-40 mb-3" />
          </>
        ) : (
          <>
            {/* Stats cards */}
            {stats && (
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100 items-center">
                  <CheckCircle2 size={24} color="#10b981" />
                  <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.present || 0}</Text>
                  <Text className="text-xs text-gray-500">Présences</Text>
                </View>
                <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100 items-center">
                  <XCircle size={24} color="#ef4444" />
                  <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.absent || 0}</Text>
                  <Text className="text-xs text-gray-500">Absences</Text>
                </View>
                <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100 items-center">
                  <AlertTriangle size={24} color="#f59e0b" />
                  <Text className="text-2xl font-bold text-gray-800 mt-1">{stats.late || 0}</Text>
                  <Text className="text-xs text-gray-500">Retards</Text>
                </View>
              </View>
            )}

            {/* Attendance percentage */}
            {stats && (
              <Card className="mb-4">
                <View className="items-center py-3">
                  <Text className="text-4xl font-bold text-cmc-teal">{stats.percentage?.toFixed(1) || "0"}%</Text>
                  <Text className="text-sm text-gray-500 mt-1">Taux de présence</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <View className="h-full bg-cmc-teal rounded-full" style={{ width: `${Math.min(stats.percentage || 0, 100)}%` }} />
                </View>
              </Card>
            )}

            {/* Records by month */}
            {monthRecords ? (
              Object.entries(monthRecords).map(([month, recs]: any) => (
                <Card key={month} title={month} className="mb-4">
                  {recs.map((r: any, i: number) => {
                    const statusColor = r.status === "present" ? "success" : r.status === "late" ? "warning" : "danger";
                    const statusLabel = r.status === "present" ? "Présent" : r.status === "late" ? "Retard" : "Absent";
                    return (
                      <View key={i} className="flex-row items-center py-2.5 border-b border-gray-100 last:border-0">
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-800">
                            {r.module_name || r.module_id}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {new Date(r.date || r.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </Text>
                        </View>
                        <Badge label={statusLabel} variant={statusColor} />
                      </View>
                    );
                  })}
                </Card>
              ))
            ) : (
              <View className="items-center pt-12">
                <ClipboardList size={48} color="#d1d5db" />
                <Text className="text-base text-gray-400 mt-4">Aucun relevé d'assiduité</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

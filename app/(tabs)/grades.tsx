import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { gradeApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { BookOpen } from "lucide-react-native";

const SEMESTERS = [1, 2, 3, 4, 5, 6];

export default function GradesScreen() {
  const { user } = useAuth();
  const [semester, setSemester] = useState<number>(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["grades", user?.id, semester],
    queryFn: () => {
      const studentId = user?.student_id || "";
      return gradeApi.getStudentGrades(studentId, semester);
    },
    enabled: !!user?.student_id,
  });

  const averages = data?.reduce((acc: any, g: any) => {
    const key = g.module_name || g.module_id;
    if (!acc[key]) acc[key] = { grades: [], coeff: g.coefficient || 1, module_id: g.module_id };
    acc[key].grades.push(g);
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <Text className="text-white text-xl font-bold">Notes</Text>
        <Text className="text-white/80 text-sm mt-1">Semestre {semester}</Text>
      </View>

      {/* Semester tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
        {SEMESTERS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setSemester(s)}
            className={`px-5 py-3 ${semester === s ? "border-b-2 border-cmc-teal" : ""}`}
          >
            <Text className={`text-sm ${semester === s ? "text-cmc-teal font-bold" : "text-gray-500"}`}>S{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 mb-3" />)
        ) : averages && Object.keys(averages).length > 0 ? (
          Object.entries(averages).map(([module, data]: any) => {
            const total = data.grades.reduce((s: number, g: any) => s + (g.score || 0), 0);
            const avg = (total / data.grades.length).toFixed(2);
            return (
              <Card key={module} className="mb-3">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-semibold text-gray-800 flex-1 mr-2">{module}</Text>
                  <Badge label={avg} variant={parseFloat(avg) >= 10 ? "success" : "danger"} />
                </View>
                {data.grades.map((g: any, i: number) => (
                  <View key={i} className="flex-row items-center justify-between py-1.5 border-t border-gray-50">
                    <Text className="text-sm text-gray-600 flex-1">{g.exam_name || `Évaluation ${i + 1}`}</Text>
                    <Text className={`text-sm font-medium ${g.score >= 10 ? "text-green-600" : "text-red-500"}`}>
                      {g.score}/20
                    </Text>
                    <Text className="text-xs text-gray-400 ml-3">×{g.coefficient || 1}</Text>
                  </View>
                ))}
              </Card>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center pt-12">
            <BookOpen size={48} stroke="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucune note disponible</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { scheduleApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react-native";

const DAYS_FR = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const DAYS_FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function getWeekDates(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day + (day === 0 ? -6 : 1));
  const dates: Date[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(s: string) {
  const d = new Date(s);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function ScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));
  const weekDates = useMemo(() => getWeekDates(new Date(selectedDay)), [selectedDay]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["schedules", "week", formatDate(weekDates[0])],
    queryFn: () => scheduleApi.list({ week_start: formatDate(weekDates[0]) }),
  });

  const daySchedule = data?.filter((s: any) => {
    const sd = new Date(s.start_time).toISOString().slice(0, 10);
    return sd === selectedDay;
  });

  const navigateWeek = (dir: number) => {
    const d = new Date(weekDates[0]);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDay(formatDate(d));
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <Text className="text-white text-xl font-bold">Emploi du temps</Text>
      </View>

      {/* Week navigation */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigateWeek(-1)} className="p-1">
          <ChevronLeft size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-gray-700">
          {weekDates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} - {weekDates[5].toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
        </Text>
        <TouchableOpacity onPress={() => navigateWeek(1)} className="p-1">
          <ChevronRight size={22} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Day selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
        {weekDates.map((d) => {
          const dateStr = formatDate(d);
          const isToday = dateStr === new Date().toISOString().slice(0, 10);
          const isSelected = dateStr === selectedDay;
          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => setSelectedDay(dateStr)}
              className={`items-center py-2.5 px-4 ${isSelected ? "border-b-2 border-cmc-teal" : ""}`}
            >
              <Text className={`text-xs ${isSelected ? "text-cmc-teal font-bold" : isToday ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                {DAYS_FR[d.getDay()]}
              </Text>
              <Text className={`text-lg mt-0.5 ${isSelected ? "text-cmc-teal font-bold" : "text-gray-700"}`}>
                {d.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Schedule list */}
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 mb-3" />)
        ) : daySchedule && daySchedule.length > 0 ? (
          daySchedule.map((s: any, i: number) => (
            <Card key={i} className="mb-3">
              <View className="flex-row items-center">
                <View className="items-center mr-4">
                  <Text className="text-lg font-bold text-cmc-teal">{formatTime(s.start_time)}</Text>
                  <Text className="text-xs text-gray-400">{formatTime(s.end_time)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-gray-800">{s.module_name || s.module_id}</Text>
                  {s.teacher_name && <Text className="text-sm text-gray-500">{s.teacher_name}</Text>}
                </View>
                <View className="items-end">
                  {s.room && <Badge label={s.room} variant="default" />}
                  {s.type && <Badge label={s.type === "TD" ? "TD" : s.type === "TP" ? "TP" : "Cours"} variant="info" />}
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-12">
            <Calendar size={48} stroke="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucun cours ce jour</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

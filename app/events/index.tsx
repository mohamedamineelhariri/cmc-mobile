import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { eventApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { CalendarView } from "@/components/events/CalendarView";
import { CalendarDays, ArrowLeft, MapPin, Clock, List, Calendar as CalendarIcon } from "lucide-react-native";

export default function EventsScreen() {
  const [view, setView] = useState<"calendar" | "list">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventApi.list({ upcoming: "true" }),
  });

  const eventDates = useMemo(() => {
    const s = new Set<string>();
    data?.forEach((e) => {
      if (e.start_date) s.add(new Date(e.start_date).toISOString().slice(0, 10));
    });
    return s;
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!selectedDate) return data;
    return data.filter((e) => {
      if (!e.start_date) return false;
      const d = new Date(e.start_date).toISOString().slice(0, 10);
      return d === selectedDate;
    });
  }, [data, selectedDate]);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px] flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Événements</Text>
        </View>
        <TouchableOpacity
          onPress={() => setView(view === "calendar" ? "list" : "calendar")}
          className="bg-white/20 h-9 w-9 rounded-full items-center justify-center"
        >
          {view === "calendar" ? <List size={20} color="white" /> : <CalendarIcon size={20} color="white" />}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {view === "calendar" && (
          <CalendarView
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
            eventDates={eventDates}
          />
        )}

        {view === "list" && selectedDate && (
          <TouchableOpacity onPress={() => setSelectedDate(null)} className="mb-3">
            <Text className="text-sm text-cmc-teal font-medium">
              {selectedDate ? `Filtré: ${new Date(selectedDate).toLocaleDateString("fr-FR")} — Tout voir` : ""}
            </Text>
          </TouchableOpacity>
        )}

        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 mb-3" />)
        ) : filtered.length > 0 ? (
          filtered.map((event, i) => (
            <TouchableOpacity
              key={event.id || i}
              onPress={() => router.push(`/events/${event.id}` as any)}
              className="bg-white rounded-xl border border-gray-100 p-4 mb-3"
            >
              <View className="flex-row">
                {/* Date badge */}
                <View className="items-center mr-3 bg-gray-50 rounded-lg px-3 py-2 min-w-[52px]">
                  <Text className="text-lg font-bold text-cmc-teal">
                    {event.start_date ? new Date(event.start_date).getDate() : "?"}
                  </Text>
                  <Text className="text-[10px] text-gray-500 uppercase">
                    {event.start_date ? new Date(event.start_date).toLocaleDateString("fr-FR", { month: "short" }) : ""}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800">{event.title}</Text>
                  {event.description && (
                    <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>{event.description}</Text>
                  )}
                  <View className="flex-row items-center mt-2 gap-3">
                    {event.location && (
                      <View className="flex-row items-center">
                        <MapPin size={11} color="#9ca3af" />
                        <Text className="text-[11px] text-gray-500 ml-1">{event.location}</Text>
                      </View>
                    )}
                    {event.start_date && (
                      <View className="flex-row items-center">
                        <Clock size={11} color="#9ca3af" />
                        <Text className="text-[11px] text-gray-500 ml-1">
                          {new Date(event.start_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </Text>
                      </View>
                    )}
                    {event.category ? <Badge label={event.category} variant="info" /> : null}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <CalendarDays size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">
              {selectedDate ? "Aucun événement ce jour" : "Aucun événement à venir"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

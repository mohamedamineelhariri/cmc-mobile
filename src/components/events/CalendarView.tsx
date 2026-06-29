import { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface CalendarViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: string) => void;
  selectedDate: string | null;
  eventDates: Set<string>;
}

export function CalendarView({ currentMonth, onMonthChange, onSelectDate, selectedDate, eventDates }: CalendarViewProps) {
  const weeks = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startPad = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];

    for (let i = 0; i < startPad; i++) days.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [currentMonth]);

  const today = new Date().toISOString().slice(0, 10);

  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  const monthLabel = currentMonth.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <View className="bg-white rounded-xl border border-gray-100 p-3 mb-4">
      {/* Month nav */}
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          onPress={() => {
            const d = new Date(currentMonth);
            d.setMonth(d.getMonth() - 1);
            onMonthChange(d);
          }}
          className="p-1"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-gray-700 capitalize">{monthLabel}</Text>
        <TouchableOpacity
          onPress={() => {
            const d = new Date(currentMonth);
            d.setMonth(d.getMonth() + 1);
            onMonthChange(d);
          }}
          className="p-1"
        >
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View className="flex-row">
        {DAYS_FR.map((day) => (
          <View key={day} className="flex-1 items-center py-1">
            <Text className="text-[10px] text-gray-400 font-medium">{day}</Text>
          </View>
        ))}
      </View>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row">
          {week.map((date, di) => {
            if (!date) return <View key={`empty-${di}`} className="flex-1 py-1.5" />;

            const dateStr = formatDate(date);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const hasEvent = eventDates.has(dateStr);
            const isPast = date < new Date(today);

            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => onSelectDate(dateStr)}
                className="flex-1 items-center py-1.5"
              >
                <View
                  className={`h-8 w-8 rounded-full items-center justify-center
                    ${isSelected ? "bg-cmc-teal" : isToday ? "bg-cmc-teal/10" : ""}`}
                >
                  <Text
                    className={`text-sm
                      ${isSelected ? "text-white font-bold" : ""}
                      ${isToday && !isSelected ? "text-cmc-teal font-bold" : ""}
                      ${!isToday && !isSelected && isPast ? "text-gray-300" : ""}
                      ${!isToday && !isSelected && !isPast ? "text-gray-700" : ""}`}
                  >
                    {date.getDate()}
                  </Text>
                </View>
                {hasEvent && (
                  <View className="h-1 w-1 rounded-full bg-cmc-teal mt-0.5" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

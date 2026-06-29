import { useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, Share } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, MapPin, Clock, Calendar, User, Share2, Bell, CheckCircle, XCircle } from "lucide-react-native";
import * as Notifications from "expo-notifications";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [reminderSet, setReminderSet] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventApi.get(id!),
    enabled: !!id,
  });

  const { data: myRegs } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => eventApi.myRegistrations(),
  });

  const isRegistered = myRegs?.some((r) => r.event_id === id);

  const registerMutation = useMutation({
    mutationFn: () => eventApi.register(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
      Alert.alert("Inscrit", "Vous êtes inscrit à cet événement");
    },
    onError: (e: any) => Alert.alert("Erreur", e.message),
  });

  const unregisterMutation = useMutation({
    mutationFn: () => eventApi.unregister(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
      Alert.alert("Désinscrit", "Vous êtes désinscrit de cet événement");
    },
    onError: (e: any) => Alert.alert("Erreur", e.message),
  });

  const handleShare = async () => {
    if (!event) return;
    await Share.share({
      title: event.title,
      message: `📅 ${event.title}\n📍 ${event.location || "CMC"}\n🗓 ${event.start_date ? new Date(event.start_date).toLocaleDateString("fr-FR") : "Date TBD"}\n\nRejoignez-nous !`,
    });
  };

  const handleReminder = async () => {
    if (!event) return;
    try {
      if (!event.start_date) { Alert.alert("Erreur", "Date de début non disponible"); return; }
      const triggerDate = new Date(event.start_date);
      triggerDate.setHours(triggerDate.getHours() - 1);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Rappel: " + event.title,
          body: `Commence ${event.location ? "à " + event.location : "dans 1 heure"}`,
          data: { event_id: event.id!, screen: "events" },
        },
        trigger: { type: "date", date: triggerDate } as any,
      });
      setReminderSet(true);
      Alert.alert("Rappel activé", "Vous serez notifié 1 heure avant l'événement");
    } catch {
      Alert.alert("Erreur", "Impossible de programmer le rappel");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-cmc-teal px-6 pt-14 pb-4">
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="white" /></TouchableOpacity>
        </View>
        <View className="p-4"><Skeleton className="h-64" /></View>
      </View>
    );
  }

  if (!event) {
    return <View className="flex-1 bg-gray-50 items-center justify-center"><Text className="text-gray-400">Événement introuvable</Text></View>;
  }

  const eventDate = event.start_date ? new Date(event.start_date) : new Date();
  const isPast = event.start_date ? eventDate < new Date() : true;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-6 rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="white" /></TouchableOpacity>
          <TouchableOpacity onPress={handleShare} className="bg-white/20 h-9 w-9 rounded-full items-center justify-center">
            <Share2 size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center">
          <View className="items-center mr-4 bg-white/20 rounded-xl px-4 py-2">
            <Text className="text-2xl font-bold text-white">{eventDate.getDate()}</Text>
            <Text className="text-xs text-white/80 uppercase">
              {eventDate.toLocaleDateString("fr-FR", { month: "short" })}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{event.title}</Text>
            {event.category && <Badge label={event.category} variant="info" />}
          </View>
        </View>
      </View>

      <View className="px-4 -mt-4">
        <Card className="mb-4">
          {/* Details */}
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Calendar size={16} color="#9ca3af" />
              <Text className="text-sm text-gray-600 ml-3">
                {eventDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={16} color="#9ca3af" />
              <Text className="text-sm text-gray-600 ml-3">
                {eventDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                {event.end_date ? ` — ${new Date(event.end_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </Text>
            </View>
            {event.location && (
              <View className="flex-row items-center">
                <MapPin size={16} color="#9ca3af" />
                <Text className="text-sm text-gray-600 ml-3">{event.location}</Text>
              </View>
            )}
            {event.organizer && (
              <View className="flex-row items-center">
                <User size={16} color="#9ca3af" />
                <Text className="text-sm text-gray-600 ml-3">{event.organizer}</Text>
              </View>
            )}
          </View>
        </Card>

        {event.description && (
          <Card title="Description" className="mb-4">
            <Text className="text-sm text-gray-600 leading-5">{event.description}</Text>
          </Card>
        )}

        {/* Actions */}
        {!isPast && (
          <View className="space-y-3 mb-6">
            <TouchableOpacity
              onPress={() => {
                if (isRegistered) {
                  Alert.alert("Se désinscrire", "Voulez-vous annuler votre inscription ?", [
                    { text: "Non", style: "cancel" },
                    { text: "Oui", style: "destructive", onPress: () => unregisterMutation.mutate() },
                  ]);
                } else {
                  registerMutation.mutate();
                }
              }}
              disabled={registerMutation.isPending || unregisterMutation.isPending}
              className={`rounded-xl py-3.5 items-center flex-row justify-center ${isRegistered ? "bg-red-50 border border-red-200" : "bg-cmc-teal"}`}
            >
              {isRegistered ? (
                <XCircle size={18} color="#ef4444" />
              ) : (
                <CheckCircle size={18} color="white" />
              )}
              <Text className={`font-semibold text-base ml-2 ${isRegistered ? "text-red-500" : "text-white"}`}>
                {isRegistered ? "Se désinscrire" : "S'inscrire"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReminder}
              className={`rounded-xl py-3.5 items-center flex-row justify-center border ${reminderSet ? "bg-green-50 border-green-200" : "border-gray-200"}`}
            >
              <Bell size={18} color={reminderSet ? "#10b981" : "#6b7280"} />
              <Text className={`font-medium text-base ml-2 ${reminderSet ? "text-green-600" : "text-gray-600"}`}>
                {reminderSet ? "Rappel activé" : "Me rappeler 1h avant"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

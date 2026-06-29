import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventApi } from "@/api/endpoints";
import { ArrowLeft, CalendarDays } from "lucide-react-native";

export default function CreateEventScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "", description: "", category: "cultural",
    start_date: "", start_time: "", location: "", organizer: "", max_participants: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = ["cultural", "academic", "sport", "workshop", "other"];
  const CATEGORY_LABELS: Record<string, string> = {
    cultural: "Culturel", academic: "Académique", sport: "Sportif", workshop: "Atelier", other: "Autre",
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.start_date) {
      Alert.alert("Erreur", "Le titre et la date sont obligatoires");
      return;
    }
    setSubmitting(true);
    try {
      const startDateTime = form.start_time
        ? new Date(`${form.start_date}T${form.start_time}`)
        : new Date(form.start_date);

      await eventApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        start_date: startDateTime.toISOString(),
        location: form.location.trim() || undefined,
        organizer: form.organizer.trim() || undefined,
        max_participants: form.max_participants ? parseInt(form.max_participants) : undefined,
        is_published: true,
      } as any);
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      Alert.alert("Créé", "Événement créé avec succès", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-3"><ArrowLeft size={24} color="white" /></TouchableOpacity>
        <Text className="text-white text-xl font-bold">Nouvel événement</Text>
      </View>

      <View className="p-4 space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Titre *</Text>
          <TextInput value={form.title} onChangeText={(v) => setForm({ ...form, title: v })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Titre de l'événement" />
        </View>
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
          <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })}
            multiline numberOfLines={3} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[80px]"
            placeholder="Description..." />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Date *</Text>
            <TextInput value={form.start_date} onChangeText={(v) => setForm({ ...form, start_date: v })}
              placeholder="YYYY-MM-DD" className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Heure</Text>
            <TextInput value={form.start_time} onChangeText={(v) => setForm({ ...form, start_time: v })}
              placeholder="HH:MM" className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Catégorie</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setForm({ ...form, category: cat })}
                className={`px-4 py-2 rounded-full border ${form.category === cat ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-sm ${form.category === cat ? "text-white font-medium" : "text-gray-600"}`}>{CATEGORY_LABELS[cat]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Lieu</Text>
            <TextInput value={form.location} onChangeText={(v) => setForm({ ...form, location: v })}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Salle, bâtiment..." />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Organisateur</Text>
            <TextInput value={form.organizer} onChangeText={(v) => setForm({ ...form, organizer: v })}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nom" />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Participants max</Text>
          <TextInput value={form.max_participants} onChangeText={(v) => setForm({ ...form, max_participants: v })}
            keyboardType="number-pad" className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Illimité" />
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting}
          className="bg-cmc-teal rounded-xl py-3.5 items-center mt-4">
          {submitting ? <ActivityIndicator color="white" /> : (
            <View className="flex-row items-center"><CalendarDays size={18} color="white" /><Text className="text-white font-semibold text-base ml-2">Créer l'événement</Text></View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

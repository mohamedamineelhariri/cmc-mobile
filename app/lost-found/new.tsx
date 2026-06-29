import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lostFoundApi } from "@/api/endpoints";
import { ArrowLeft, Search } from "lucide-react-native";

export default function NewLostFoundScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ type: "lost" as "lost" | "found", title: "", description: "", location_found: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }
    setSubmitting(true);
    try {
      await lostFoundApi.create({
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location_found: form.location_found.trim() || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["lost-found"] });
      Alert.alert("Succès", "Signalement enregistré", [{ text: "OK", onPress: () => router.back() }]);
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
        <Text className="text-white text-xl font-bold">Nouveau signalement</Text>
      </View>

      <View className="p-4 space-y-4">
        {/* Type selector */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setForm({ ...form, type: "lost" })}
              className={`flex-1 py-3 rounded-xl items-center border-2 ${form.type === "lost" ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
            >
              <Text className={`font-semibold ${form.type === "lost" ? "text-red-500" : "text-gray-600"}`}>Perdu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setForm({ ...form, type: "found" })}
              className={`flex-1 py-3 rounded-xl items-center border-2 ${form.type === "found" ? "border-green-400 bg-green-50" : "border-gray-200 bg-white"}`}
            >
              <Text className={`font-semibold ${form.type === "found" ? "text-green-500" : "text-gray-600"}`}>Trouvé</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Titre *</Text>
          <TextInput value={form.title} onChangeText={(v) => setForm({ ...form, title: v })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholder={form.type === "lost" ? "Ex: Sac à dos noir" : "Ex: Portefeuille marron"} />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
          <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })}
            multiline numberOfLines={3} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[80px]"
            placeholder="Décrivez l'objet..." />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Lieu</Text>
          <TextInput value={form.location_found} onChangeText={(v) => setForm({ ...form, location_found: v })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholder={form.type === "lost" ? "Ex: Bâtiment A, salle 12" : "Ex: Hall d'entrée"} />
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting}
          className="bg-cmc-teal rounded-xl py-3.5 items-center mt-4">
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold text-base">Signaler</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

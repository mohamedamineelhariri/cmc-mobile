import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementApi } from "@/api/endpoints";
import { ArrowLeft, Bell } from "lucide-react-native";

export default function CreateAnnouncementScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("info");
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = ["info", "urgent", "academic", "event", "admin"];
  const CATEGORY_LABELS: Record<string, string> = {
    info: "Information", urgent: "Urgent", academic: "Académique", event: "Événement", admin: "Administratif",
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("Erreur", "Le titre est obligatoire"); return; }
    if (!content.trim()) { Alert.alert("Erreur", "Le contenu est obligatoire"); return; }
    setSubmitting(true);
    try {
      await announcementApi.create({ title: title.trim(), content: content.trim(), category });
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      Alert.alert("Publié", "Annonce publiée avec succès", [{ text: "OK", onPress: () => router.back() }]);
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
        <Text className="text-white text-xl font-bold">Nouvelle annonce</Text>
      </View>

      <View className="p-4 space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Titre</Text>
          <TextInput value={title} onChangeText={setTitle}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Titre de l'annonce" />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Catégorie</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${category === cat ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-sm ${category === cat ? "text-white font-medium" : "text-gray-600"}`}>{CATEGORY_LABELS[cat]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Contenu</Text>
          <TextInput value={content} onChangeText={setContent} multiline numberOfLines={6}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[140px]" placeholder="Écrivez votre annonce..." />
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting}
          className="bg-cmc-teal rounded-xl py-3.5 items-center mt-4">
          {submitting ? <ActivityIndicator color="white" /> : (
            <View className="flex-row items-center"><Bell size={18} color="white" /><Text className="text-white font-semibold text-base ml-2">Publier</Text></View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

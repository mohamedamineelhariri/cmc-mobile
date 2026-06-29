import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marketplaceApi } from "@/api/endpoints";
import { ArrowLeft, Package } from "lucide-react-native";

const CATEGORIES = ["Livres", "Électronique", "Vêtements", "Meubles", "Autre"];
const CONDITIONS = [
  { value: "new", label: "Neuf" },
  { value: "like_new", label: "Comme neuf" },
  { value: "good", label: "Bon état" },
  { value: "fair", label: "État correct" },
];

export default function NewMarketplaceScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "", condition: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }
    setSubmitting(true);
    try {
      await marketplaceApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        category: form.category || undefined,
        condition: form.condition || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["marketplace"] });
      Alert.alert("Succès", "Article mis en vente", [{ text: "OK", onPress: () => router.back() }]);
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
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Titre *</Text>
          <TextInput value={form.title} onChangeText={(v) => setForm({ ...form, title: v })}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Ex: Manuel de maths S1" />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
          <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })}
            multiline numberOfLines={3}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[80px]" placeholder="Description de l'article..." />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Prix (DH)</Text>
          <TextInput value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} keyboardType="decimal-pad"
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="0.00" />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Catégorie</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setForm({ ...form, category: form.category === cat ? "" : cat })}
                className={`px-4 py-2 rounded-full border ${form.category === cat ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-sm ${form.category === cat ? "text-white font-medium" : "text-gray-600"}`}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">État</Text>
          <View className="flex-row flex-wrap gap-2">
            {CONDITIONS.map((cond) => (
              <TouchableOpacity key={cond.value} onPress={() => setForm({ ...form, condition: form.condition === cond.value ? "" : cond.value })}
                className={`px-4 py-2 rounded-full border ${form.condition === cond.value ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-sm ${form.condition === cond.value ? "text-white font-medium" : "text-gray-600"}`}>{cond.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting}
          className="bg-cmc-teal rounded-xl py-3.5 items-center mt-4">
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Publier l'annonce</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

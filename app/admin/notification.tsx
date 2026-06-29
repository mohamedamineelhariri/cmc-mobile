import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { notificationApi } from "@/api/endpoints";
import { ArrowLeft, Megaphone } from "lucide-react-native";

const TARGET_ROLES = ["all", "student", "teacher", "director", "student_affairs", "communication"];

export default function BroadcastNotificationScreen() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert("Erreur", "Le titre est obligatoire"); return; }
    if (!message.trim()) { Alert.alert("Erreur", "Le message est obligatoire"); return; }
    setSubmitting(true);
    try {
      await notificationApi.create({
        title: title.trim(),
        body: message.trim(),
        category: "broadcast",
        target_role: targetRole === "all" ? undefined : targetRole,
      } as any);
      Alert.alert("Envoyée", "Notification diffusée avec succès", [{ text: "OK", onPress: () => router.back() }]);
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
        <Text className="text-white text-xl font-bold">Diffuser une notification</Text>
        <Text className="text-white/70 text-sm mt-1">Envoyer une notification push à tous les utilisateurs</Text>
      </View>

      <View className="p-4 space-y-4">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Titre</Text>
          <TextInput value={title} onChangeText={setTitle}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Titre de la notification" />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Message</Text>
          <TextInput value={message} onChangeText={setMessage} multiline numberOfLines={4}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[100px]" placeholder="Contenu du message..." />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Cible</Text>
          <View className="flex-row flex-wrap gap-2">
            {TARGET_ROLES.map((role) => (
              <TouchableOpacity key={role} onPress={() => setTargetRole(role)}
                className={`px-4 py-2 rounded-full border ${targetRole === role ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-sm ${targetRole === role ? "text-white font-medium" : "text-gray-600"}`}>
                  {role === "all" ? "Tout le monde" : role === "student_affairs" ? "Aff. Étudiantes" : role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={submitting}
          className="bg-cmc-teal rounded-xl py-3.5 items-center mt-4">
          {submitting ? <ActivityIndicator color="white" /> : (
            <View className="flex-row items-center"><Megaphone size={18} color="white" /><Text className="text-white font-semibold text-base ml-2">Diffuser</Text></View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

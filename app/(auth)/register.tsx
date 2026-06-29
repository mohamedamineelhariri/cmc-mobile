import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import { Link } from "expo-router";
import { apiFetch } from "@/api/client";

export default function RegisterScreen() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", first_name: "", last_name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.first_name || !form.last_name) {
      Alert.alert("Erreur", "Les champs obligatoires doivent être remplis");
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email || undefined,
        }),
      });
      Alert.alert("Succès", "Compte créé. Vous pouvez maintenant vous connecter.");
    } catch (e: any) {
      Alert.alert("Erreur", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8" contentContainerStyle={{ paddingTop: 80, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-gray-900 mb-1">Créer un compte</Text>
        <Text className="text-sm text-gray-500 mb-8">Rejoignez la communauté CMC</Text>

        <View className="space-y-4">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Prénom *</Text>
              <TextInput value={form.first_name} onChangeText={(v) => setForm({ ...form, first_name: v })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Nom *</Text>
              <TextInput value={form.last_name} onChangeText={(v) => setForm({ ...form, last_name: v })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur *</Text>
            <TextInput value={form.username} onChangeText={(v) => setForm({ ...form, username: v })} autoCapitalize="none"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
            <TextInput value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Mot de passe *</Text>
            <TextInput value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Confirmer le mot de passe *</Text>
            <TextInput value={form.confirmPassword} onChangeText={(v) => setForm({ ...form, confirmPassword: v })} secureTextEntry
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={submitting}
            className={`rounded-xl py-3.5 mt-2 ${submitting ? "bg-cmc-teal/60" : "bg-cmc-teal"}`}>
            <Text className="text-white text-center font-semibold text-base">
              {submitting ? "Inscription..." : "S'inscrire"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-sm text-gray-500">Déjà un compte ? </Text>
          <Link href="/(auth)/login" className="text-sm text-cmc-teal font-medium">Se connecter</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

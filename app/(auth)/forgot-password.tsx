import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { apiFetch } from "@/api/client";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre email");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Impossible d'envoyer l'email");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 justify-center px-8">
        <Text className="text-2xl font-bold text-gray-900 mb-1">Mot de passe oublié</Text>
        <Text className="text-sm text-gray-500 mb-8">
          {sent ? "Un email de réinitialisation vous a été envoyé." : "Entrez votre email pour recevoir un lien de réinitialisation."}
        </Text>

        {!sent ? (
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" placeholder="votre@email.com" />
            </View>
            <TouchableOpacity onPress={handleSubmit} disabled={submitting}
              className={`rounded-xl py-3.5 ${submitting ? "bg-cmc-teal/60" : "bg-cmc-teal"}`}>
              <Text className="text-white text-center font-semibold text-base">
                {submitting ? "Envoi..." : "Envoyer"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Link href="/(auth)/login" className="text-cmc-teal text-center font-medium">
            Retour à la connexion
          </Link>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

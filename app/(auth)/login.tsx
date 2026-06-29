import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, Eye, EyeOff } from "lucide-react-native";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (e: any) {
      Alert.alert("Erreur de connexion", e.message || "Identifiants invalides");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-10">
          <View className="h-16 w-16 bg-cmc-teal rounded-2xl items-center justify-center mb-4">
            <GraduationCap size={32} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">CMC Campus</Text>
          <Text className="text-sm text-gray-500 mt-1">Connectez-vous à votre espace</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Nom d'utilisateur</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Votre identifiant"
              autoCapitalize="none"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Mot de passe</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                secureTextEntry={!showPassword}
                className="flex-1 py-3.5 text-base"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
            <Text className="text-sm text-cmc-teal text-right font-medium">Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={submitting || isLoading}
            className={`rounded-xl py-3.5 mt-2 ${submitting ? "bg-cmc-teal/60" : "bg-cmc-teal"}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {submitting ? "Connexion..." : "Se connecter"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8">
          <Text className="text-sm text-gray-500">Pas encore de compte ? </Text>
          <Link href="/(auth)/register" className="text-sm text-cmc-teal font-medium">
            S'inscrire
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

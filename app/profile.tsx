import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, User, Mail, Calendar, Shield, Smartphone } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const infoRows = [
    { icon: User, label: "Nom complet", value: `${user?.first_name} ${user?.last_name}` },
    { icon: Mail, label: "Email", value: user?.email || "Non renseigné" },
    { icon: User, label: "Nom d'utilisateur", value: user?.username },
    { icon: Shield, label: "Rôle", value: user?.role || "Utilisateur" },
    { icon: Calendar, label: "Membre depuis", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR") : "N/A" },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mon Profil</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Avatar & name */}
        <View className="items-center mb-6">
          <View className="h-20 w-20 rounded-full bg-cmc-teal items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <Text className="text-lg font-bold text-gray-800">{user?.first_name} {user?.last_name}</Text>
          <Badge label={user?.role === "student" ? "Étudiant" : user?.role || "Utilisateur"} variant="info" />
        </View>

        {/* Info cards */}
        <Card title="Informations personnelles" className="mb-4">
          {infoRows.map((row, i) => (
            <View key={row.label} className={`flex-row items-center py-3 ${i < infoRows.length - 1 ? "border-b border-gray-100" : ""}`}>
              <row.icon size={18} color="#9ca3af" />
              <View className="ml-3 flex-1">
                <Text className="text-xs text-gray-400">{row.label}</Text>
                <Text className="text-sm text-gray-800 font-medium">{row.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <TouchableOpacity className="bg-white rounded-xl border border-gray-100 p-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Smartphone size={18} color="#9ca3af" />
            <Text className="text-sm text-gray-700 ml-3 font-medium">Paramètres de l'appareil</Text>
          </View>
          <Text className="text-xs text-gray-400">v1.0.0</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

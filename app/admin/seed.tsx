import { useState } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { adminApi } from "@/api/admin";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Database, RotateCw } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export default function SeedFilieresScreen() {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    Alert.alert(
      "Seeder les filières",
      "Cette action va insérer les données de base des filières. Continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Seeder", onPress: async () => {
            setSeeding(true);
            try {
              await adminApi.seedFilieres();
              Alert.alert("Succès", "Filières insérées avec succès");
            } catch (e: any) {
              Alert.alert("Erreur", e.message || "Échec du seeder");
            } finally {
              setSeeding(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-3"><ArrowLeft size={24} color="white" /></TouchableOpacity>
        <Text className="text-white text-xl font-bold">Seeder Filières</Text>
        <Text className="text-white/70 text-sm mt-1">Initialiser les données des filières OFPPT</Text>
      </View>

      <View className="p-4">
        <Card className="mb-4">
          <Text className="text-sm text-gray-600 leading-5 mb-4">
            Cette action insère ou met à jour les données des filières à partir des données prédéfinies
            (Pôles, filières, niveaux, groupes).
          </Text>

          <TouchableOpacity
            onPress={handleSeed}
            disabled={seeding}
            className="bg-cmc-teal rounded-xl py-3.5 items-center flex-row justify-center"
          >
            {seeding ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <RotateCw size={18} color="white" />
                <Text className="text-white font-semibold text-base ml-2">Lancer le seeder</Text>
              </>
            )}
          </TouchableOpacity>
        </Card>
      </View>
    </View>
  );
}

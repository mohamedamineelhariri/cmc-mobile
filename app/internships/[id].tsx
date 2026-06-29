import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { internshipApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Building2, MapPin, Clock, Mail, Phone, FileText, Send } from "lucide-react-native";

export default function InternshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showApply, setShowApply] = useState(false);
  const [cvUrl, setCvUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const { data: offer, isLoading } = useQuery({
    queryKey: ["internship-offer", id],
    queryFn: () => internshipApi.getOffer(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: () => internshipApi.apply(id!, { cv_url: cvUrl || undefined, cover_letter: coverLetter || undefined }),
    onSuccess: () => {
      Alert.alert("Succès", "Votre candidature a été envoyée", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (e: any) => {
      Alert.alert("Erreur", e.message || "Impossible de postuler");
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-cmc-teal px-6 pt-14 pb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <Skeleton className="h-48 mb-3" />
        </View>
      </View>
    );
  }

  if (!offer) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-400">Offre introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-6 rounded-b-[32px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View className="h-14 w-14 rounded-2xl bg-white/20 items-center justify-center mr-4">
            <Building2 size={28} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">{offer.title}</Text>
            <Text className="text-white/80 text-base mt-0.5">{offer.company_name}</Text>
          </View>
        </View>
      </View>

      <View className="px-4 -mt-4">
        <Card className="mb-4">
          <View className="flex-row flex-wrap gap-3 mb-3">
            {offer.location && (
              <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-1.5">
                <MapPin size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1.5">{offer.location}</Text>
              </View>
            )}
            {offer.duration && (
              <View className="flex-row items-center bg-gray-50 rounded-lg px-3 py-1.5">
                <Clock size={14} color="#6b7280" />
                <Text className="text-sm text-gray-600 ml-1.5">{offer.duration}</Text>
              </View>
            )}
            <Badge label={offer.is_active ? "Actif" : "Fermé"} variant={offer.is_active ? "success" : "danger"} />
          </View>

          {offer.description && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Description</Text>
              <Text className="text-sm text-gray-600 leading-5">{offer.description}</Text>
            </View>
          )}

          {offer.requirements && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Prérequis</Text>
              <Text className="text-sm text-gray-600 leading-5">{offer.requirements}</Text>
            </View>
          )}

          {offer.contact_email && (
            <View className="flex-row items-center mb-2">
              <Mail size={14} color="#9ca3af" />
              <Text className="text-sm text-gray-500 ml-2">{offer.contact_email}</Text>
            </View>
          )}
          {offer.contact_phone && (
            <View className="flex-row items-center">
              <Phone size={14} color="#9ca3af" />
              <Text className="text-sm text-gray-500 ml-2">{offer.contact_phone}</Text>
            </View>
          )}
        </Card>

        {/* Apply button or form */}
        {!showApply ? (
          <TouchableOpacity
            onPress={() => setShowApply(true)}
            className="bg-cmc-teal rounded-xl py-3.5 items-center flex-row justify-center mb-6"
          >
            <Send size={18} color="white" />
            <Text className="text-white font-semibold text-base ml-2">Postuler</Text>
          </TouchableOpacity>
        ) : (
          <Card title="Postuler" className="mb-6">
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Lien CV (URL)</Text>
              <TextInput
                value={cvUrl}
                onChangeText={setCvUrl}
                placeholder="https://drive.google.com/..."
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Lettre de motivation</Text>
              <TextInput
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="Parlez de votre motivation..."
                multiline
                numberOfLines={4}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm min-h-[100px]"
              />
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowApply(false)}
                className="flex-1 border border-gray-200 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-600 font-medium">Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="flex-1 bg-cmc-teal rounded-xl py-3 items-center"
              >
                {applyMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-medium">Envoyer</Text>
                )}
              </TouchableOpacity>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

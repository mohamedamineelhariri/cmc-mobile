import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { internshipApi } from "@/api/endpoints";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, FileText, Building2, Send, Clock } from "lucide-react-native";

const statusLabels: Record<string, { label: string; variant: "info" | "warning" | "success" | "danger" }> = {
  pending: { label: "En attente", variant: "warning" },
  reviewed: { label: "Examinée", variant: "info" },
  accepted: { label: "Acceptée", variant: "success" },
  rejected: { label: "Refusée", variant: "danger" },
};

export default function ApplicationsScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => internshipApi.myApplications(),
  });

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Mes candidatures</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 mb-3" />)
        ) : data && data.length > 0 ? (
          data.map((app, i) => {
            const statusInfo = statusLabels[app.status] || { label: app.status, variant: "info" as const };
            return (
              <Card key={app.id || i} className="mb-3">
                <View className="flex-row items-start">
                  <View className="h-10 w-10 rounded-xl bg-cmc-teal/10 items-center justify-center mr-3">
                    <Send size={20} color="#32acc1" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-800">
                      {app.offer?.title || "Offre de stage"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {app.offer?.company_name || ""}
                    </Text>
                    <View className="flex-row items-center mt-2 gap-3">
                      <Badge label={statusInfo.label} variant={statusInfo.variant} />
                      {app.created_at && (
                        <View className="flex-row items-center">
                          <Clock size={12} color="#9ca3af" />
                          <Text className="text-[11px] text-gray-400 ml-1">
                            {new Date(app.created_at).toLocaleDateString("fr-FR")}
                          </Text>
                        </View>
                      )}
                    </View>
                    {app.feedback && (
                      <Text className="text-xs text-gray-500 mt-2 italic">{app.feedback}</Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <FileText size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">Aucune candidature</Text>
            <TouchableOpacity
              onPress={() => router.push("/internships/index" as any)}
              className="mt-4 bg-cmc-teal px-6 py-2.5 rounded-xl"
            >
              <Text className="text-white font-medium">Voir les offres</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

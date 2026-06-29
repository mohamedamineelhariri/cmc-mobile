import { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { documentApi } from "@/api/endpoints";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { FileText, ArrowLeft, Plus, Search, File, Download, Trash2, FolderOpen } from "lucide-react-native";
import * as Sharing from "expo-sharing";

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "#ef4444", "application/pdf": "#ef4444",
  doc: "#3b82f6", docx: "#3b82f6", "application/msword": "#3b82f6",
  xls: "#10b981", xlsx: "#10b981", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "#10b981",
  ppt: "#f59e0b", pptx: "#f59e0b",
  image: "#ec4899", png: "#ec4899", jpg: "#ec4899", jpeg: "#ec4899",
};

function getFileIcon(fileType?: string) {
  if (!fileType) return File;
  const t = fileType.toLowerCase();
  if (t.includes("pdf")) return FileText;
  if (t.includes("image") || ["png", "jpg", "jpeg"].includes(t)) return FileText;
  return File;
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExt(fileType?: string, url?: string) {
  if (fileType) {
    if (fileType.includes("/")) return fileType.split("/").pop() || "";
    return fileType;
  }
  return url?.split(".").pop() || "";
}

export default function DocumentsScreen() {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const { data: folders } = useQuery({
    queryKey: ["document-folders"],
    queryFn: () => documentApi.folders(),
  });

  const { data: docs, isLoading, refetch } = useQuery({
    queryKey: ["documents", selectedFolder],
    queryFn: () => documentApi.list(selectedFolder ? { folder: selectedFolder } : {}),
  });

  const filtered = useMemo(() => {
    if (!docs) return [];
    if (!search.trim()) return docs;
    const q = search.toLowerCase();
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
    );
  }, [docs, search]);

  const handleOpenFile = async (doc: any) => {
    try {
      if (doc.file_url) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(doc.file_url);
        } else {
          await Linking.openURL(doc.file_url);
        }
      }
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir le fichier");
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Documents</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/documents/upload" as any)}
            className="bg-white/20 h-9 w-9 rounded-full items-center justify-center"
          >
            <Plus size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-white/20 rounded-xl px-3">
          <Search size={18} color="rgba(255,255,255,0.7)" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Rechercher un document..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            className="flex-1 py-2.5 px-2 text-white text-sm"
          />
        </View>
      </View>

      {/* Folder tabs */}
      {folders && folders.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white border-b border-gray-100">
          <TouchableOpacity
            onPress={() => setSelectedFolder(null)}
            className={`px-5 py-3 ${!selectedFolder ? "border-b-2 border-cmc-teal" : ""}`}
          >
            <Text className={`text-sm ${!selectedFolder ? "text-cmc-teal font-bold" : "text-gray-500"}`}>Tous</Text>
          </TouchableOpacity>
          {folders.map((f: string) => (
            <TouchableOpacity
              key={f}
              onPress={() => setSelectedFolder(f)}
              className={`px-5 py-3 ${selectedFolder === f ? "border-b-2 border-cmc-teal" : ""}`}
            >
              <View className="flex-row items-center gap-1.5">
                <FolderOpen size={14} color={selectedFolder === f ? "#32acc1" : "#9ca3af"} />
                <Text className={`text-sm ${selectedFolder === f ? "text-cmc-teal font-bold" : "text-gray-500"}`}>{f}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Document list */}
      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 mb-2" />)
        ) : filtered.length > 0 ? (
          filtered.map((doc, i) => {
            const Icon = getFileIcon(doc.file_type);
            const ext = getFileExt(doc.file_type, doc.file_url);
            const color = FILE_TYPE_COLORS[ext] || FILE_TYPE_COLORS[doc.file_type || ""] || "#6b7280";

            return (
              <TouchableOpacity
                key={doc.id || i}
                onPress={() => handleOpenFile(doc)}
                className="bg-white rounded-xl p-4 mb-2 border border-gray-100 flex-row items-center"
              >
                <View className="h-10 w-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: color + "15" }}>
                  <Icon size={20} color={color} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-800">{doc.title}</Text>
                  <View className="flex-row items-center mt-0.5 gap-2">
                    {doc.category && <Badge label={doc.category} variant="info" />}
                    <Text className="text-[11px] text-gray-400">{formatSize(doc.file_size)}</Text>
                    {doc.created_at && (
                      <Text className="text-[11px] text-gray-400">
                        {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                      </Text>
                    )}
                  </View>
                </View>
                <Download size={18} color="#9ca3af" />
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center pt-16">
            <FolderOpen size={48} color="#d1d5db" />
            <Text className="text-base text-gray-400 mt-4">
              {search ? "Aucun résultat" : "Aucun document"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

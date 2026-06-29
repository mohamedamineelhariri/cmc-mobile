import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@/api/endpoints";
import { ArrowLeft, Upload, File, X } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";

export default function UploadDocumentScreen() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [folder, setFolder] = useState("");
  const [file, setFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const CATEGORIES = ["general", "course", "exam", "admin", "other"];
  const CATEGORY_LABELS: Record<string, string> = {
    general: "Général", course: "Cours", exam: "Examen", admin: "Administratif", other: "Autre",
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || "application/octet-stream",
        });
      }
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Impossible de sélectionner le fichier");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert("Erreur", "Veuillez sélectionner un fichier");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }

    setUploading(true);
    try {
      await documentApi.upload(
        file,
        { title: title.trim(), description: description.trim() || undefined, category, folder: folder.trim() || undefined }
      );
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-folders"] });
      Alert.alert("Succès", "Document uploadé", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Uploader un document</Text>
      </View>

      <View className="p-4 space-y-4">
        {/* File picker */}
        <TouchableOpacity
          onPress={pickFile}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 items-center"
        >
          {file ? (
            <View className="items-center">
              <File size={36} color="#32acc1" />
              <Text className="text-sm font-medium text-gray-700 mt-2">{file.name}</Text>
              <TouchableOpacity
                onPress={() => setFile(null)}
                className="mt-2 flex-row items-center"
              >
                <X size={14} color="#ef4444" />
                <Text className="text-xs text-red-500 ml-1">Changer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <Upload size={36} color="#9ca3af" />
              <Text className="text-sm text-gray-500 mt-2 font-medium">Appuyez pour sélectionner</Text>
              <Text className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, images...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Title */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Titre *</Text>
          <TextInput value={title} onChangeText={setTitle}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm" placeholder="Nom du document" />
        </View>

        {/* Description */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Description</Text>
          <TextInput value={description} onChangeText={setDescription} multiline numberOfLines={3}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm min-h-[80px]" placeholder="Description optionnelle" />
        </View>

        {/* Category */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Catégorie</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${category === cat ? "bg-cmc-teal border-cmc-teal" : "bg-white border-gray-200"}`}>
                <Text className={`text-sm ${category === cat ? "text-white font-medium" : "text-gray-600"}`}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Folder */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Dossier</Text>
          <TextInput value={folder} onChangeText={setFolder}
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
            placeholder="Ex: Cours S1, Administration..." />
        </View>

        <TouchableOpacity
          onPress={handleUpload}
          disabled={uploading || !file}
          className={`rounded-xl py-3.5 items-center mt-2 ${uploading || !file ? "bg-gray-300" : "bg-cmc-teal"}`}
        >
          {uploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Uploader</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

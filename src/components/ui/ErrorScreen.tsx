import { View, Text, TouchableOpacity } from "react-native";
import { AlertCircle, RefreshCw } from "lucide-react-native";

interface ErrorScreenProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorScreen({ message = "Une erreur est survenue", onRetry }: ErrorScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-6">
      <AlertCircle size={48} color="#ef4444" />
      <Text className="mt-4 text-base text-gray-600 text-center">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-6 flex-row items-center gap-2 bg-cmc-teal px-6 py-3 rounded-lg"
        >
          <RefreshCw size={18} color="white" />
          <Text className="text-white font-medium">Réessayer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

import { View, ActivityIndicator, Text } from "react-native";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Chargement..." }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#32acc1" />
      <Text className="mt-3 text-sm text-gray-500">{message}</Text>
    </View>
  );
}

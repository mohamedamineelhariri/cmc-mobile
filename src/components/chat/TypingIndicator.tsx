import { View } from "react-native";

export function TypingIndicator() {
  return (
    <View className="mb-4 items-start">
      <View className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex-row items-center gap-1">
        {[0.4, 0.6, 0.8].map((opacity, i) => (
          <View
            key={i}
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: `rgba(50, 172, 193, ${opacity})` }}
          />
        ))}
      </View>
    </View>
  );
}

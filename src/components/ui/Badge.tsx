import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variants = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = variants[variant];
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${colors.split(" ")[0]}`}>
      <Text className={`text-[11px] font-medium ${colors.split(" ")[1]}`}>{label}</Text>
    </View>
  );
}

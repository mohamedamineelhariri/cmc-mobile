import { View, Text } from "react-native";
import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <View className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
      {title && <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</Text>}
      {children}
    </View>
  );
}

import { View } from "react-native";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <View className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );
}

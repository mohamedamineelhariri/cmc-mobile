import { Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const { token } = useAuthStore();

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

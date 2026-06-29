import { Tabs } from "expo-router";
import { Home, Calendar, BookOpen, ClipboardList, User, MessageCircle } from "lucide-react-native";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuthStore } from "@/store/authStore";
import { Redirect } from "expo-router";

export default function TabsLayout() {
  const { isLoading } = useAuth();
  const { token } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!token) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#32acc1",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#e5e7eb",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Home size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Emploi",
          tabBarIcon: ({ color, size }) => <Calendar size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="grades"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Absences",
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} stroke={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Plus",
          tabBarIcon: ({ color, size }) => <User size={size} stroke={color} />,
        }}
      />
    </Tabs>
  );
}

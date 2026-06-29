import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import {
  User, Bell, Calendar, FileText, Users, MessageCircle,
  LifeBuoy, LogOut, ChevronRight, Shield, Settings, Briefcase,
  ShoppingBag, Search,
} from "lucide-react-native";

const menuSections = [
  {
    title: "Mon espace",
    items: [
      { icon: User, label: "Mon profil", route: "/profile", color: "#32acc1" },
      { icon: Bell, label: "Notifications", route: "/notifications", color: "#8b5cf6" },
      { icon: Calendar, label: "Événements", route: "/events/index", color: "#f59e0b" },
    ],
  },
  {
    title: "Communauté",
    items: [
      { icon: ShoppingBag, label: "Boutique", route: "/marketplace/index", color: "#f59e0b" },
      { icon: Search, label: "Objets trouvés", route: "/lost-found/index", color: "#10b981" },
    ],
  },
  {
    title: "Ressources",
    items: [
      { icon: Briefcase, label: "Stages", route: "/internships/index", color: "#6366f1" },
      { icon: FileText, label: "Documents", route: "/documents/index", color: "#ef4444" },
      { icon: Users, label: "Clubs", route: "/clubs", color: "#10b981" },
      { icon: MessageCircle, label: "FAQ", route: "/faq", color: "#ec4899" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: LifeBuoy, label: "Aide & Contact", route: "/help", color: "#6366f1" },
      { icon: Shield, label: "Confidentialité", route: "/privacy", color: "#78716c" },
    ],
  },
];

export default function MoreScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-cmc-teal px-6 pt-14 pb-4 rounded-b-[24px]">
        <Text className="text-white text-xl font-bold">Plus</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile Card */}
        <TouchableOpacity onPress={() => router.push("/profile" as any)} className="bg-white rounded-xl p-4 border border-gray-100 mb-6 flex-row items-center">
          <View className="h-14 w-14 rounded-full bg-cmc-teal items-center justify-center">
            <Text className="text-white text-xl font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-base font-semibold text-gray-800">{user?.first_name} {user?.last_name}</Text>
            <Text className="text-sm text-gray-500">{user?.email || user?.username}</Text>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} className="mb-6">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </Text>
            <View className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={() => router.push(item.route as any)}
                  className={`flex-row items-center px-4 py-3.5 ${i < section.items.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <View className="h-8 w-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: item.color + "15" }}>
                    <item.icon size={18} color={item.color} />
                  </View>
                  <Text className="flex-1 text-sm text-gray-700 font-medium">{item.label}</Text>
                  <ChevronRight size={18} color="#d1d5db" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center py-3">
          <LogOut size={18} color="#ef4444" />
          <Text className="text-sm text-red-500 font-medium ml-2">Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

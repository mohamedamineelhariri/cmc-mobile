import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { router } from "expo-router";
import { apiFetch } from "@/api/client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function extractData(notification: Notifications.Notification): Record<string, string> {
  const data = notification.request.content.data || {};
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, string>;
  }
  return {};
}

function handleNavigation(data: Record<string, string>) {
  const linkUrl = data.link_url;
  if (linkUrl) {
    if (linkUrl.startsWith("/notifications")) {
      router.push("/notifications" as any);
    } else if (linkUrl.startsWith("/events")) {
      router.push("/events" as any);
    } else if (linkUrl.startsWith("/documents")) {
      router.push("/documents" as any);
    } else if (linkUrl.startsWith("/grades")) {
      router.push("/(tabs)/grades" as any);
    } else if (linkUrl.startsWith("/schedule")) {
      router.push("/(tabs)/schedule" as any);
    } else {
      router.push("/notifications" as any);
    }
  } else {
    router.push("/notifications" as any);
  }
}

let _notificationResponseListener: Notifications.EventSubscription | null = null;
let _foregroundListener: Notifications.EventSubscription | null = null;

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Notifications",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#32acc1",
    });
    await Notifications.setNotificationChannelAsync("announcements", {
      name: "Annonces",
      importance: Notifications.AndroidImportance.HIGH,
    });
    await Notifications.setNotificationChannelAsync("grades", {
      name: "Notes",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync("events", {
      name: "Événements",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const expoPushToken = await Notifications.getExpoPushTokenAsync({
    projectId: undefined,
  });

  return expoPushToken.data;
}

export function setupNotificationListeners() {
  _notificationResponseListener?.remove();
  _foregroundListener?.remove();

  _notificationResponseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = extractData(response.notification);
      handleNavigation(data);
    }
  );

  _foregroundListener = Notifications.addNotificationReceivedListener((notification) => {
    const data = extractData(notification);
    if (data.category === "announcement" || data.priority === "high") {
      Notifications.scheduleNotificationAsync({
        content: {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: {},
        },
        trigger: null,
      });
    }
  });
}

export function cleanupNotificationListeners() {
  _notificationResponseListener?.remove();
  _foregroundListener?.remove();
}

export async function syncFcmTokenToBackend(token: string | null) {
  if (!token) return;
  try {
    await apiFetch("auth/fcm-token", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  } catch (e) {
    console.warn("Failed to sync FCM token:", e);
  }
}

export async function getBadgeCount(): Promise<number> {
  try {
    const res = await apiFetch<{ unread_count: number }>("api/v1/notifications/unread-count");
    return res.unread_count;
  } catch {
    return 0;
  }
}

export async function setBadgeCount(count: number) {
  await Notifications.setBadgeCountAsync(count);
}

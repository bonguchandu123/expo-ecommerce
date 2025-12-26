import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useApi } from "@/lib/api";
import { useAuth } from "@clerk/clerk-expo";

export default function useNotifications() {
  const api = useApi();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    registerForPushNotifications();
  }, [isLoaded, isSignedIn]);

  async function registerForPushNotifications() {
    try {
      if (!Device.isDevice) return;

      const { status } =
        await Notifications.requestPermissionsAsync();

      if (status !== "granted") return;

      const token =
        (await Notifications.getExpoPushTokenAsync()).data;

      await api.post("/users/push-token", {
        expoPushToken: token,
      });

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "default",
          {
            name: "default",
            importance:
              Notifications.AndroidImportance.MAX,
          }
        );
      }
    } catch (error) {
      console.log("Notification error:", error);
    }
  }
}

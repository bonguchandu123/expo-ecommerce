import { useEffect } from "react";
import * as Notifications from "expo-notifications";

export function useNotificationHandler() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowSound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);
}

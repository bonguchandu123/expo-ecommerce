import { Stack } from "expo-router";
import "../global.css";

import {MutationCache,QueryCache,QueryClient,QueryClientProvider,} from "@tanstack/react-query";

import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import * as Sentry from "@sentry/react-native";
import { StripeProvider } from "@stripe/stripe-react-native";

import useNotifications from "@/hooks/useNotifications";
import { useNotificationHandler } from "@/lib/notifications";

// ---------------- SENTRY ----------------
Sentry.init({
  dsn: "https://3a4b4be1cbf696badb3181f4bead5fd1@o4510228015480832.ingest.us.sentry.io/4510504507998208",
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

// ---------------- QUERY CLIENT ----------------
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey?.[0]?.toString() || "unknown",
        },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
          queryKey: query.queryKey,
        },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      Sentry.captureException(error, {
        tags: { type: "react-query-mutation-error" },
        extra: {
          errorMessage: error.message,
          statusCode: error.response?.status,
        },
      });
    },
  }),
});

// ---------------- ROOT ----------------
function Root() {
  useNotifications(); // ✅ SAFE now (inside ClerkProvider)
    useNotificationHandler();

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
        <Stack screenOptions={{ headerShown: false }} />
      </StripeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <Root />
    </ClerkProvider>
  );
});
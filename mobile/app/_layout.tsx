import { Stack } from "expo-router";
import "../global.css"
import {MutationCache, QueryCache, QueryClient,QueryClientProvider,} from '@tanstack/react-query'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import * as Sentry from '@sentry/react-native';
import {StripeProvider} from '@stripe/stripe-react-native'
import { useState, useEffect } from 'react';
import * as SplashScreenExpo from 'expo-splash-screen';
import SplashScreen from "@/components/SplashScreen";


// Prevent auto-hiding
SplashScreenExpo.preventAutoHideAsync();

Sentry.init({
  dsn: 'https://3a4b4be1cbf696badb3181f4bead5fd1@o4510228015480832.ingest.us.sentry.io/4510504507998208',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      Sentry.captureException(error, {
        tags: {
          type: "react-query-error",
          queryKey: query.queryKey[0]?.toString() || "unknown",
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

function RootLayoutContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isLoaded } = useAuth();

  useEffect(() => {
    async function prepare() {
      try {
        // Add any initialization logic here
        // For example: preload fonts, images, or check authentication
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
        Sentry.captureException(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && isLoaded) {
      SplashScreenExpo.hideAsync();
    }
  }, [appIsReady, isLoaded]);

  if (!appIsReady || !isLoaded || showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
        <Stack screenOptions={{headerShown:false}}/>
      </StripeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <RootLayoutContent />
    </ClerkProvider>
  );
});
import { Stack } from "expo-router";
import "../global.css"
import {MutationCache, QueryCache, QueryClient,QueryClientProvider,} from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import * as Sentry from '@sentry/react-native';
import {StripeProvider} from '@stripe/stripe-react-native'

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

const clerkPublishableKey = "pk_test_dHJ1ZS10ZXJyYXBpbi05OS5jbGVyay5hY2NvdW50cy5kZXYk";

export default Sentry.wrap(function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <StripeProvider publishableKey={"pk_test_51SeU5NJKw4HPfVtG3YjIM3pCbjHC5uauPuLmyK1tLdp90GFLTmbX9NMJn4YR51sw6pHmM1QD9ykTotm1bf2NvgSi00EovPTACX"}>
          <Stack screenOptions={{headerShown:false}}/>
        </StripeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
});
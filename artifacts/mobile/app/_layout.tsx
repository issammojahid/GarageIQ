import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl } from "@workspace/api-client-react";

import { ErrorBoundary } from "@/components/ErrorBoundary";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
    },
  },
});

const HEADER_STYLE = {
  backgroundColor: "#0A0A0A" as const,
};

const HEADER_TITLE_STYLE = {
  fontFamily: "Inter_600SemiBold",
};

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="diagnose/new"
        options={{ headerShown: true, title: "New Diagnosis", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE, presentation: "modal" }}
      />
      <Stack.Screen
        name="diagnose/result"
        options={{ headerShown: true, title: "Diagnosis Result", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="vehicle/add"
        options={{ headerShown: true, title: "Add Vehicle", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE, presentation: "modal" }}
      />
      <Stack.Screen
        name="vehicle/edit"
        options={{ headerShown: true, title: "Edit Vehicle", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE, presentation: "modal" }}
      />
      <Stack.Screen
        name="screens/fuel-log"
        options={{ headerShown: true, title: "Fuel Log", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="screens/maintenance"
        options={{ headerShown: true, title: "Maintenance", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="screens/documents"
        options={{ headerShown: true, title: "Documents", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="screens/identify-part"
        options={{ headerShown: true, title: "Identify Part", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="screens/statistics"
        options={{ headerShown: true, title: "Statistics", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="screens/nearby-workshops"
        options={{ headerShown: true, title: "Nearby Workshops", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
      <Stack.Screen
        name="screens/settings"
        options={{ headerShown: true, title: "Settings", headerStyle: HEADER_STYLE, headerTintColor: "#FFFFFF", headerTitleStyle: HEADER_TITLE_STYLE }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

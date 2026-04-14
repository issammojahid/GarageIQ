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
import { TranslationProvider } from "@/i18n/TranslationContext";
import { useI18n } from "@/i18n/TranslationContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

// Install a global error handler before anything else runs.
// All errors are logged for visibility, then forwarded to the previous handler
// so React Native's default crash/error behavior is preserved.
if (typeof global.ErrorUtils !== "undefined") {
  const prevHandler = global.ErrorUtils.getGlobalHandler();
  global.ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.error("[GarageIQ] Unhandled error:", error?.message, "fatal:", isFatal);
    prevHandler(error, isFatal);
  });
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

function RootLayoutNav() {
  const { t } = useI18n();
  const { colors } = useTheme();

  const headerStyle = { backgroundColor: colors.card };
  const headerTintColor = colors.text;
  const headerTitleStyle = { fontFamily: "Inter_600SemiBold", color: colors.text };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="diagnose/new"
        options={{ headerShown: true, title: t("screen_new_diagnosis"), headerStyle, headerTintColor, headerTitleStyle, presentation: "modal" }}
      />
      <Stack.Screen
        name="diagnose/result"
        options={{ headerShown: true, title: t("screen_result"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="vehicle/add"
        options={{ headerShown: true, title: t("screen_add_vehicle"), headerStyle, headerTintColor, headerTitleStyle, presentation: "modal" }}
      />
      <Stack.Screen
        name="vehicle/edit"
        options={{ headerShown: true, title: t("screen_edit_vehicle"), headerStyle, headerTintColor, headerTitleStyle, presentation: "modal" }}
      />
      <Stack.Screen
        name="screens/fuel-log"
        options={{ headerShown: true, title: t("screen_fuel_log"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/maintenance"
        options={{ headerShown: true, title: t("screen_maintenance"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/documents"
        options={{ headerShown: true, title: t("screen_documents"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/identify-part"
        options={{ headerShown: true, title: t("screen_identify_part"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/statistics"
        options={{ headerShown: true, title: t("screen_statistics"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/nearby-workshops"
        options={{ headerShown: true, title: t("screen_nearby"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/settings"
        options={{ headerShown: true, title: t("screen_settings"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/parts-history"
        options={{ headerShown: true, title: t("screen_parts_history"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/cost-calculator"
        options={{ headerShown: true, title: t("screen_cost_calculator"), headerStyle, headerTintColor, headerTitleStyle }}
      />
      <Stack.Screen
        name="screens/mechanic-register"
        options={{ headerShown: true, title: t("screen_mechanic_register"), headerStyle, headerTintColor, headerTitleStyle }}
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
              <TranslationProvider>
                <ThemeProvider>
                  <RootLayoutNav />
                </ThemeProvider>
              </TranslationProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

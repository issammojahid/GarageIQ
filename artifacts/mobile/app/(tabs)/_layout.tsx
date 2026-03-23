import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.bg,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 0,
          paddingBottom: isWeb ? 34 : insets.bottom,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.bg }]} />
          ),
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Diagnose",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="stethoscope" tintColor={color} size={size} />
            ) : (
              <MaterialCommunityIcons name="stethoscope" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="clock" tintColor={color} size={size} />
            ) : (
              <Feather name="clock" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="garage"
        options={{
          title: "My Garage",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="car.2" tintColor={color} size={size} />
            ) : (
              <Ionicons name="car-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) =>
            isIOS ? (
              <SymbolView name="square.grid.2x2" tintColor={color} size={size} />
            ) : (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

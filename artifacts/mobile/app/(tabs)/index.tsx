import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles } from "@workspace/api-client-react";
import type { MaterialCommunityIconsName } from "@/types/icons";

const SYSTEMS: Array<{ id: string; label: string; icon: MaterialCommunityIconsName }> = [
  { id: "engine", label: "Engine", icon: "engine" },
  { id: "brakes", label: "Brakes", icon: "car-brake-alert" },
  { id: "transmission", label: "Transmission", icon: "car-shift-pattern" },
  { id: "electrical", label: "Electrical", icon: "flash" },
  { id: "suspension", label: "Suspension", icon: "car-seat" },
  { id: "cooling", label: "Cooling", icon: "thermometer" },
  { id: "exhaust", label: "Exhaust", icon: "smoke" },
  { id: "fuel", label: "Fuel System", icon: "fuel" },
  { id: "ac", label: "A/C", icon: "air-conditioner" },
  { id: "steering", label: "Steering", icon: "steering" },
];

export default function DiagnoseTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const { data: vehicles } = useListVehicles();

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GarageIQ</Text>
          <Text style={styles.headerSub}>AI Car Diagnosis</Text>
        </View>
        <MaterialCommunityIcons name="shield-car" size={32} color={Colors.accent} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero CTA */}
        <Pressable
          style={({ pressed }) => [styles.heroCta, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          onPress={() => {
            if (!vehicles || vehicles.length === 0) {
              router.push("/vehicle/add");
            } else {
              router.push("/diagnose/new");
            }
          }}
        >
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="stethoscope" size={48} color={Colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Start New Diagnosis</Text>
          <Text style={styles.heroSub}>
            Describe your symptoms and get an AI-powered diagnosis in seconds
          </Text>
          <View style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>Diagnose Now</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </View>
        </Pressable>

        {/* Quick Tips */}
        <Text style={styles.sectionTitle}>Common Warning Signs</Text>
        {QUICK_TIPS.map((tip) => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={[styles.tipIcon, { backgroundColor: tip.color + "20" }]}>
              <MaterialCommunityIcons name={tip.icon} size={22} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}

        {/* System Overview */}
        <Text style={styles.sectionTitle}>Vehicle Systems</Text>
        <View style={styles.systemGrid}>
          {SYSTEMS.map((sys) => (
            <Pressable
              key={sys.id}
              style={({ pressed }) => [styles.systemItem, pressed && { opacity: 0.7 }]}
              onPress={() => router.push({ pathname: "/diagnose/new", params: { system: sys.id } })}
            >
              <MaterialCommunityIcons name={sys.icon} size={26} color={Colors.accent} />
              <Text style={styles.systemLabel}>{sys.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const QUICK_TIPS: Array<{ id: string; icon: MaterialCommunityIconsName; color: string; title: string; desc: string }> = [
  {
    id: "1",
    icon: "alert-circle",
    color: Colors.danger,
    title: "Check Engine Light",
    desc: "A lit check engine light often means a sensor or emissions issue — scan your OBD-II codes first.",
  },
  {
    id: "2",
    icon: "car-brake-alert",
    color: Colors.warning,
    title: "Squeaking Brakes",
    desc: "High-pitched squealing when braking usually means worn brake pads that need replacement.",
  },
  {
    id: "3",
    icon: "thermometer-high",
    color: "#EF4444",
    title: "Overheating",
    desc: "Temperature gauge in the red zone — pull over safely. May indicate coolant leak or thermostat failure.",
  },
  {
    id: "4",
    icon: "oil",
    color: "#F59E0B",
    title: "Low Oil Pressure",
    desc: "Oil pressure warning? Stop driving immediately. Running without oil causes severe engine damage.",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: Colors.text,
  },
  headerSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  heroCta: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.accent + "40",
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  heroBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
  },
  tipDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  systemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  systemItem: {
    width: "30%",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  systemLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

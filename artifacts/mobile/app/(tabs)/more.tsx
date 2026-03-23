import React from "react";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BannerAd } from "@/components/AdBanner";

import type { MaterialCommunityIconsName } from "@/types/icons";

const MENU_ITEMS: Array<{
  id: string;
  label: string;
  desc: string;
  icon: MaterialCommunityIconsName;
  color: string;
  bgColor: string;
  route: string;
}> = [
  {
    id: "identify-part",
    label: "Identify Part",
    desc: "AI-powered part identification",
    icon: "magnify-scan",
    color: "#7C3AED",
    bgColor: "#7C3AED20",
    route: "/screens/identify-part",
  },
  {
    id: "statistics",
    label: "Statistics",
    desc: "Fuel & cost analytics",
    icon: "chart-bar",
    color: "#3B82F6",
    bgColor: "#3B82F620",
    route: "/screens/statistics",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    desc: "Service records & schedule",
    icon: "wrench",
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    route: "/screens/maintenance",
  },
  {
    id: "fuel-log",
    label: "Fuel Log",
    desc: "Track fill-ups & economy",
    icon: "gas-station",
    color: "#10B981",
    bgColor: "#10B98120",
    route: "/screens/fuel-log",
  },
  {
    id: "documents",
    label: "Documents",
    desc: "Insurance & registration",
    icon: "file-document",
    color: "#EF4444",
    bgColor: "#EF444420",
    route: "/screens/documents",
  },
  {
    id: "nearby-workshops",
    label: "Nearby Workshops",
    desc: "Find mechanics near you",
    icon: "map-marker",
    color: "#EC4899",
    bgColor: "#EC489920",
    route: "/screens/nearby-workshops",
  },
  {
    id: "settings",
    label: "Settings",
    desc: "App preferences",
    icon: "cog",
    color: "#6B7280",
    bgColor: "#6B728020",
    route: "/screens/settings",
  },
];

export default function MoreTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const topRow = MENU_ITEMS.slice(0, 6);
  const bottomRow = MENU_ITEMS.slice(6);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {topRow.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.gridItem,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
            >
              <View style={[styles.iconWrap, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.itemLabel}>{item.label}</Text>
              <Text style={styles.itemDesc} numberOfLines={1}>{item.desc}</Text>
            </Pressable>
          ))}
        </View>

        {bottomRow.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.listItem,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
          >
            <View style={[styles.listIconWrap, { backgroundColor: item.bgColor }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.listItemContent}>
              <Text style={styles.listItemLabel}>{item.label}</Text>
              <Text style={styles.listItemDesc}>{item.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textTertiary} />
          </Pressable>
        ))}

        <View style={styles.adBanner}>
          <BannerAd size="banner" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.text },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    width: "47%",
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  itemLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text, marginBottom: 4 },
  itemDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  listIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  listItemContent: { flex: 1 },
  listItemLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  listItemDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  adBanner: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 60,
  },
  adText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textTertiary },
});

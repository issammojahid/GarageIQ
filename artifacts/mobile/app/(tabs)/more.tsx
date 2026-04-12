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
import { BannerAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

type MenuItem = {
  id: string;
  labelKey: keyof T;
  descKey: keyof T;
  icon: MaterialCommunityIconsName;
  color: string;
  bgColor: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "identify-part", labelKey: "menu_identify_part", descKey: "menu_identify_part_desc", icon: "magnify-scan", color: "#7C3AED", bgColor: "#7C3AED20", route: "/screens/identify-part" },
  { id: "statistics", labelKey: "menu_statistics", descKey: "menu_statistics_desc", icon: "chart-bar", color: "#3B82F6", bgColor: "#3B82F620", route: "/screens/statistics" },
  { id: "maintenance", labelKey: "menu_maintenance", descKey: "menu_maintenance_desc", icon: "wrench", color: "#F59E0B", bgColor: "#F59E0B20", route: "/screens/maintenance" },
  { id: "fuel-log", labelKey: "menu_fuel_log", descKey: "menu_fuel_log_desc", icon: "gas-station", color: "#10B981", bgColor: "#10B98120", route: "/screens/fuel-log" },
  { id: "parts-history", labelKey: "menu_parts_history", descKey: "menu_parts_history_desc", icon: "cog-sync", color: "#E85D04", bgColor: "#E85D0420", route: "/screens/parts-history" },
  { id: "cost-calculator", labelKey: "menu_cost_calculator", descKey: "menu_cost_calculator_desc", icon: "calculator-variant", color: "#8B5CF6", bgColor: "#8B5CF620", route: "/screens/cost-calculator" },
  { id: "documents", labelKey: "menu_documents", descKey: "menu_documents_desc", icon: "file-document", color: "#EF4444", bgColor: "#EF444420", route: "/screens/documents" },
  { id: "nearby-workshops", labelKey: "menu_nearby", descKey: "menu_nearby_desc", icon: "map-marker", color: "#EC4899", bgColor: "#EC489920", route: "/screens/nearby-workshops" },
  { id: "settings", labelKey: "menu_settings", descKey: "menu_settings_desc", icon: "cog", color: "#6B7280", bgColor: "#6B728020", route: "/screens/settings" },
];

export default function MoreTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, isRTL } = useI18n();
  const { colors } = useTheme();

  const topRow = MENU_ITEMS.slice(0, 6);
  const bottomRow = MENU_ITEMS.slice(6);

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={s.header}>
        <Text style={[s.headerTitle, isRTL && s.textRight]}>{t("more_title")}</Text>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.grid}>
          {topRow.map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [s.gridItem, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
            >
              <View style={[s.iconWrap, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={[s.itemLabel, isRTL && s.textRight]}>{t(item.labelKey)}</Text>
              <Text style={[s.itemDesc, isRTL && s.textRight]} numberOfLines={1}>{t(item.descKey)}</Text>
            </Pressable>
          ))}
        </View>

        {bottomRow.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [s.listItem, isRTL && s.rowReverse, pressed && { opacity: 0.85 }]}
            onPress={() => router.push(item.route as Parameters<typeof router.push>[0])}
          >
            <View style={[s.listIconWrap, { backgroundColor: item.bgColor }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={s.listItemContent}>
              <Text style={[s.listItemLabel, isRTL && s.textRight]}>{t(item.labelKey)}</Text>
              <Text style={[s.listItemDesc, isRTL && s.textRight]}>{t(item.descKey)}</Text>
            </View>
            <MaterialCommunityIcons name={isRTL ? "chevron-left" : "chevron-right"} size={20} color={colors.textTertiary} />
          </Pressable>
        ))}

        <View style={s.adBanner}>
          <BannerAd size="banner" />
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: colors.text },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
    gridItem: { width: "47%", backgroundColor: colors.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border },
    iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 12 },
    itemLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text, marginBottom: 4 },
    itemDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    listItem: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12 },
    listIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    listItemContent: { flex: 1 },
    listItemLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
    listItemDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    adBanner: { marginHorizontal: 20, marginTop: 8, backgroundColor: colors.card, borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.border, minHeight: 60 },
  });
}

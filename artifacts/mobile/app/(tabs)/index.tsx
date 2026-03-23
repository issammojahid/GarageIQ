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
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles } from "@workspace/api-client-react";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { BannerAd } from "@/components/AdBanner";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";

export default function DiagnoseTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, isRTL } = useI18n();

  const { data: vehicles } = useListVehicles();

  const SYSTEMS: Array<{ id: string; labelKey: keyof T; icon: MaterialCommunityIconsName }> = [
    { id: "engine", labelKey: "sys_engine", icon: "engine" },
    { id: "brakes", labelKey: "sys_brakes", icon: "car-brake-alert" },
    { id: "transmission", labelKey: "sys_transmission", icon: "car-shift-pattern" },
    { id: "electrical", labelKey: "sys_electrical", icon: "flash" },
    { id: "suspension", labelKey: "sys_suspension", icon: "car-seat" },
    { id: "cooling", labelKey: "sys_cooling", icon: "thermometer" },
    { id: "exhaust", labelKey: "sys_exhaust", icon: "smoke" },
    { id: "fuel", labelKey: "sys_fuel", icon: "fuel" },
    { id: "ac", labelKey: "sys_ac", icon: "air-conditioner" },
    { id: "steering", labelKey: "sys_steering", icon: "steering" },
  ];

  const QUICK_TIPS = [
    { id: "1", icon: "alert-circle" as MaterialCommunityIconsName, color: Colors.danger, titleKey: "tip1_title" as const, descKey: "tip1_desc" as const },
    { id: "2", icon: "car-brake-alert" as MaterialCommunityIconsName, color: Colors.warning, titleKey: "tip2_title" as const, descKey: "tip2_desc" as const },
    { id: "3", icon: "thermometer-high" as MaterialCommunityIconsName, color: "#EF4444", titleKey: "tip3_title" as const, descKey: "tip3_desc" as const },
    { id: "4", icon: "oil" as MaterialCommunityIconsName, color: "#F59E0B", titleKey: "tip4_title" as const, descKey: "tip4_desc" as const },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <View>
          <Text style={[styles.headerTitle, isRTL && styles.textRight]}>GarageIQ</Text>
          <Text style={[styles.headerSub, isRTL && styles.textRight]}>{t("home_tagline")}</Text>
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
          <Text style={styles.heroTitle}>{t("home_start_diagnosis")}</Text>
          <Text style={styles.heroSub}>{t("home_cta_desc")}</Text>
          <View style={styles.heroBtn}>
            <Text style={styles.heroBtnText}>{t("home_diagnose_now")}</Text>
            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={18} color="#fff" />
          </View>
        </Pressable>

        {/* Quick Tips */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t("home_warning_signs")}</Text>
        {QUICK_TIPS.map((tip) => (
          <View key={tip.id} style={[styles.tipCard, isRTL && styles.rowReverse]}>
            <View style={[styles.tipIcon, { backgroundColor: tip.color + "20" }]}>
              <MaterialCommunityIcons name={tip.icon} size={22} color={tip.color} />
            </View>
            <View style={styles.tipContent}>
              <Text style={[styles.tipTitle, isRTL && styles.textRight]}>{t(tip.titleKey)}</Text>
              <Text style={[styles.tipDesc, isRTL && styles.textRight]}>{t(tip.descKey)}</Text>
            </View>
          </View>
        ))}

        {/* System Overview */}
        <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t("home_vehicle_systems")}</Text>
        <View style={styles.systemGrid}>
          {SYSTEMS.map((sys) => (
            <Pressable
              key={sys.id}
              style={({ pressed }) => [styles.systemItem, pressed && { opacity: 0.7 }]}
              onPress={() => router.push({ pathname: "/diagnose/new", params: { system: sys.id } })}
            >
              <MaterialCommunityIcons name={sys.icon} size={26} color={Colors.accent} />
              <Text style={styles.systemLabel}>{t(sys.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        <BannerAd size="banner" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.text },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 1 },
  heroCta: { marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.card, borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: Colors.accent + "40" },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.accent + "15", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  heroTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text, marginBottom: 8, textAlign: "center" },
  heroSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  heroBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28, flexDirection: "row", alignItems: "center", gap: 8 },
  heroBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.text, marginHorizontal: 20, marginBottom: 12 },
  tipCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: Colors.card, marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: Colors.border },
  tipIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tipContent: { flex: 1 },
  tipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text, marginBottom: 4 },
  tipDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  systemGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 16, marginBottom: 20, gap: 10 },
  systemItem: { width: "30%", backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: Colors.border },
  systemLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary, textAlign: "center" },
});

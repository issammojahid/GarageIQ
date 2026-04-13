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
import { useListVehicles } from "@/hooks/useLocalVehicles";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { BannerAd } from "@/components/AdBanner";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

export default function DiagnoseTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, isRTL } = useI18n();
  const { colors } = useTheme();

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
    { id: "1", icon: "alert-circle" as MaterialCommunityIconsName, color: colors.danger, titleKey: "tip1_title" as const, descKey: "tip1_desc" as const },
    { id: "2", icon: "car-brake-alert" as MaterialCommunityIconsName, color: colors.warning, titleKey: "tip2_title" as const, descKey: "tip2_desc" as const },
    { id: "3", icon: "thermometer-high" as MaterialCommunityIconsName, color: "#EF4444", titleKey: "tip3_title" as const, descKey: "tip3_desc" as const },
    { id: "4", icon: "oil" as MaterialCommunityIconsName, color: "#F59E0B", titleKey: "tip4_title" as const, descKey: "tip4_desc" as const },
  ];

  const s = makeStyles(colors);

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={[s.header, isRTL && s.rowReverse]}>
        <View>
          <Text style={[s.headerTitle, isRTL && s.textRight]}>GarageIQ</Text>
          <Text style={[s.headerSub, isRTL && s.textRight]}>{t("home_tagline")}</Text>
        </View>
        <MaterialCommunityIcons name="shield-car" size={32} color={colors.accent} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero CTA */}
        <Pressable
          style={({ pressed }) => [s.heroCta, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          onPress={() => {
            if (!vehicles || vehicles.length === 0) {
              router.push("/vehicle/add");
            } else {
              router.push("/diagnose/new");
            }
          }}
        >
          <View style={s.heroIcon}>
            <MaterialCommunityIcons name="stethoscope" size={48} color={colors.accent} />
          </View>
          <Text style={s.heroTitle}>{t("home_start_diagnosis")}</Text>
          <Text style={s.heroSub}>{t("home_cta_desc")}</Text>
          <View style={s.heroBtn}>
            <Text style={s.heroBtnText}>{t("home_diagnose_now")}</Text>
            <Ionicons name={isRTL ? "arrow-back" : "arrow-forward"} size={18} color="#fff" />
          </View>
        </Pressable>

        {/* Quick Tips */}
        <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("home_warning_signs")}</Text>
        {QUICK_TIPS.map((tip) => (
          <View key={tip.id} style={[s.tipCard, isRTL && s.rowReverse]}>
            <View style={[s.tipIcon, { backgroundColor: tip.color + "20" }]}>
              <MaterialCommunityIcons name={tip.icon} size={22} color={tip.color} />
            </View>
            <View style={s.tipContent}>
              <Text style={[s.tipTitle, isRTL && s.textRight]}>{t(tip.titleKey)}</Text>
              <Text style={[s.tipDesc, isRTL && s.textRight]}>{t(tip.descKey)}</Text>
            </View>
          </View>
        ))}

        {/* System Overview */}
        <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("home_vehicle_systems")}</Text>
        <View style={s.systemGrid}>
          {SYSTEMS.map((sys) => (
            <Pressable
              key={sys.id}
              style={({ pressed }) => [s.systemItem, pressed && { opacity: 0.7 }]}
              onPress={() => router.push({ pathname: "/diagnose/new", params: { system: sys.id } })}
            >
              <MaterialCommunityIcons name={sys.icon} size={26} color={colors.accent} />
              <Text style={s.systemLabel}>{t(sys.labelKey)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Become a Mechanic CTA */}
        <Pressable
          style={({ pressed }) => [s.mechCta, pressed && { opacity: 0.88 }]}
          onPress={() => router.push("/screens/mechanic-register")}
        >
          <MaterialCommunityIcons name="garage-open" size={28} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[s.mechCtaTitle, isRTL && s.textRight]}>{t("mech_cta_title")}</Text>
            <Text style={[s.mechCtaDesc, isRTL && s.textRight]}>{t("mech_cta_desc")}</Text>
          </View>
          <View style={s.mechCtaBtn}>
            <Text style={s.mechCtaBtnText}>{t("mech_cta_btn")}</Text>
          </View>
        </Pressable>

        <BannerAd size="banner" />
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: colors.text },
    headerSub: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 1 },
    heroCta: { marginHorizontal: 20, marginBottom: 24, backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: "center", borderWidth: 1, borderColor: colors.accent + "40" },
    heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    heroTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text, marginBottom: 8, textAlign: "center" },
    heroSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20, marginBottom: 20 },
    heroBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 28, flexDirection: "row", alignItems: "center", gap: 8 },
    heroBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: colors.text, marginHorizontal: 20, marginBottom: 12 },
    tipCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.card, marginHorizontal: 20, marginBottom: 10, borderRadius: 14, padding: 14, gap: 12, borderWidth: 1, borderColor: colors.border },
    tipIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    tipContent: { flex: 1 },
    tipTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text, marginBottom: 4 },
    tipDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    systemGrid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 16, marginBottom: 20, gap: 10 },
    systemItem: { width: "30%", backgroundColor: colors.card, borderRadius: 14, padding: 14, alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border },
    systemLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary, textAlign: "center" },
    mechCta: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.accent + "40" },
    mechCtaTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text, marginBottom: 2 },
    mechCtaDesc: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
    mechCtaBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
    mechCtaBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: "#fff" },
  });
}

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Modal, FlatList, Switch } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useListDiagnoses, useListFuelLogs } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { LANGUAGES } from "@/hooks/useLanguagePref";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { data: vehicles } = useListVehicles();
  const { data: diagnoses } = useListDiagnoses({});
  const { data: fuelLogs } = useListFuelLogs({});
  const { t, tf, isRTL, language, setLanguage } = useI18n();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  type SettingItem = {
    icon: MaterialCommunityIconsName;
    labelKey: keyof T;
    type: string;
    value?: string;
    url?: string;
  };

  const SETTINGS_SECTIONS: Array<{ titleKey: keyof T; items: SettingItem[] }> = [
    {
      titleKey: "settings_your_data",
      items: [
        { icon: "car", labelKey: "settings_vehicles", value: tf("settings_vehicles_count", vehicles?.length ?? 0), type: "info" },
        { icon: "stethoscope", labelKey: "settings_diagnoses", value: tf("settings_records_count", diagnoses?.length ?? 0), type: "info" },
        { icon: "gas-station", labelKey: "settings_fuel_logs", value: tf("settings_entries_count", fuelLogs?.length ?? 0), type: "info" },
      ],
    },
    {
      titleKey: "settings_app_info",
      items: [
        { icon: "information-outline", labelKey: "settings_version", value: "1.0.0", type: "info" },
        { icon: "shield-lock-outline", labelKey: "settings_privacy", type: "link", url: "https://garageiq.app/privacy" },
        { icon: "file-document-outline", labelKey: "settings_terms", type: "link", url: "https://garageiq.app/terms" },
      ],
    },
    {
      titleKey: "settings_support",
      items: [
        { icon: "email-outline", labelKey: "settings_contact", type: "link", url: "mailto:support@garageiq.app" },
        { icon: "star-outline", labelKey: "settings_rate", type: "link", url: "https://apps.apple.com" },
      ],
    },
  ];

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[s.profileCard, isRTL && s.rowReverse]}>
          <View style={s.avatarWrap}>
            <MaterialCommunityIcons name="shield-car" size={36} color={colors.accent} />
          </View>
          <View>
            <Text style={[s.appName, isRTL && s.textRight]}>GarageIQ</Text>
            <Text style={[s.appTagline, isRTL && s.textRight]}>AI-Powered Car Diagnosis</Text>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("settings_appearance")}</Text>
          <View style={s.sectionCard}>
            <View style={[s.settingRow, isRTL && s.rowReverse]}>
              <View style={[s.settingLeft, isRTL && s.rowReverse]}>
                <View style={[s.settingIconWrap, { backgroundColor: colors.accent + "20" }]}>
                  <Ionicons
                    name={isDark ? "moon-outline" : "sunny-outline"}
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <View>
                  <Text style={[s.settingLabel, isRTL && s.textRight]}>{t("settings_theme")}</Text>
                  <Text style={[s.settingSubLabel, isRTL && s.textRight]}>
                    {isDark ? t("settings_theme_dark") : t("settings_theme_light")}
                  </Text>
                </View>
              </View>
              <Switch
                value={!isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.accent + "80" }}
                thumbColor={isDark ? colors.textTertiary : colors.accent}
              />
            </View>
          </View>
        </View>

        {/* AI Settings */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("settings_ai_settings")}</Text>
          <View style={s.sectionCard}>
            <Pressable
              style={({ pressed }) => [s.settingRow, pressed && { opacity: 0.7 }]}
              onPress={() => setLanguageModalVisible(true)}
            >
              <View style={[s.settingLeft, isRTL && s.rowReverse]}>
                <View style={[s.settingIconWrap, { backgroundColor: colors.accent + "20" }]}>
                  <Ionicons name="language-outline" size={18} color={colors.accent} />
                </View>
                <View>
                  <Text style={[s.settingLabel, isRTL && s.textRight]}>{t("settings_ai_language")}</Text>
                  <Text style={[s.settingSubLabel, isRTL && s.textRight]}>{t("settings_ai_language_desc")}</Text>
                </View>
              </View>
              <View style={[s.settingRight, isRTL && s.rowReverse]}>
                <Text style={[s.settingValue, { color: colors.accent }]}>{selectedLang.native}</Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* For Mechanics Section */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("settings_for_mechanics")}</Text>
          <View style={s.sectionCard}>
            <Pressable
              style={({ pressed }) => [s.settingRow, isRTL && s.rowReverse, pressed && { opacity: 0.7 }]}
              onPress={() => router.push("/screens/mechanic-register")}
            >
              <View style={[s.settingLeft, isRTL && s.rowReverse]}>
                <View style={[s.settingIconWrap, { backgroundColor: colors.accent + "20" }]}>
                  <MaterialCommunityIcons name="garage" size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.settingLabel, isRTL && s.textRight]}>{t("menu_mechanic_register")}</Text>
                  <Text style={[s.settingSubLabel, isRTL && s.textRight]}>{t("menu_mechanic_register_desc")}</Text>
                </View>
              </View>
              <View style={[s.settingRight, isRTL && s.rowReverse]}>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>

        {SETTINGS_SECTIONS.map((section) => (
          <View key={String(section.titleKey)} style={s.section}>
            <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t(section.titleKey)}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={String(item.labelKey)}
                  style={({ pressed }) => [
                    s.settingRow,
                    isRTL && s.rowReverse,
                    index < section.items.length - 1 && s.settingRowBorder,
                    pressed && item.type === "link" && { opacity: 0.7 },
                  ]}
                  onPress={() => item.type === "link" && item.url && Linking.openURL(item.url)}
                >
                  <View style={[s.settingLeft, isRTL && s.rowReverse]}>
                    <View style={s.settingIconWrap}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={colors.textSecondary} />
                    </View>
                    <Text style={[s.settingLabel, isRTL && s.textRight]}>{t(item.labelKey)}</Text>
                  </View>
                  <View style={[s.settingRight, isRTL && s.rowReverse]}>
                    {item.value && <Text style={s.settingValue}>{item.value}</Text>}
                    {item.type === "link" && (
                      <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={colors.textTertiary} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* AdMob Info */}
        <View style={[s.adCard, isRTL && s.rowReverse]}>
          <MaterialCommunityIcons name="advertisements" size={20} color={colors.textTertiary} />
          <Text style={[s.adText, isRTL && s.textRight]}>{t("settings_ads")}</Text>
        </View>

        <Text style={s.footer}>{t("settings_footer")}</Text>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={s.modalSheet} onPress={() => {}}>
            <View style={s.modalHandle} />
            <Text style={[s.modalTitle, isRTL && s.textRight]}>{t("settings_modal_title")}</Text>
            <Text style={[s.modalSubtitle, isRTL && s.textRight]}>{t("settings_modal_desc")}</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    s.langRow,
                    isRTL && s.rowReverse,
                    item.code === language && s.langRowSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLanguageModalVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.langLabel, isRTL && s.textRight, item.code === language && s.langLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[s.langNative, isRTL && s.textRight]}>{item.native}</Text>
                  </View>
                  {item.code === language && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={s.langDivider} />}
              scrollEnabled={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.card, borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: colors.accent + "30" },
    avatarWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center" },
    appName: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text },
    appTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    section: { marginBottom: 20 },
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
    sectionCard: { backgroundColor: colors.card, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
    settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    settingRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
    settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    settingIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: colors.card2, alignItems: "center", justifyContent: "center" },
    settingLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: colors.text },
    settingSubLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, marginTop: 1 },
    settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
    settingValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary },
    adCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    adText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
    footer: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, textAlign: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 },
    modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, marginBottom: 4 },
    modalSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, marginBottom: 20, lineHeight: 18 },
    langRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4 },
    langRowSelected: { backgroundColor: colors.accent + "10", borderRadius: 10, paddingHorizontal: 10 },
    langLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: colors.text },
    langLabelSelected: { color: colors.accent, fontFamily: "Inter_600SemiBold" },
    langNative: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    langDivider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  });
}

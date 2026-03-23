import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Modal, FlatList } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles, useListDiagnoses, useListFuelLogs } from "@workspace/api-client-react";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { useLanguagePref, LANGUAGES } from "@/hooks/useLanguagePref";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";

export default function SettingsScreen() {
  const { data: vehicles } = useListVehicles();
  const { data: diagnoses } = useListDiagnoses({});
  const { data: fuelLogs } = useListFuelLogs({});
  const { language, setLanguage } = useLanguagePref();
  const { t, tf, isRTL } = useI18n();
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, isRTL && styles.rowReverse]}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="shield-car" size={36} color={Colors.accent} />
          </View>
          <View>
            <Text style={[styles.appName, isRTL && styles.textRight]}>GarageIQ</Text>
            <Text style={[styles.appTagline, isRTL && styles.textRight]}>AI-Powered Car Diagnosis</Text>
          </View>
        </View>

        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t("settings_ai_settings")}</Text>
          <View style={styles.sectionCard}>
            <Pressable
              style={({ pressed }) => [styles.settingRow, pressed && { opacity: 0.7 }]}
              onPress={() => setLanguageModalVisible(true)}
            >
              <View style={[styles.settingLeft, isRTL && styles.rowReverse]}>
                <View style={[styles.settingIconWrap, { backgroundColor: Colors.accent + "20" }]}>
                  <Ionicons name="language-outline" size={18} color={Colors.accent} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t("settings_ai_language")}</Text>
                  <Text style={[styles.settingSubLabel, isRTL && styles.textRight]}>{t("settings_ai_language_desc")}</Text>
                </View>
              </View>
              <View style={[styles.settingRight, isRTL && styles.rowReverse]}>
                <Text style={[styles.settingValue, { color: Colors.accent }]}>{selectedLang.native}</Text>
                <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={Colors.textTertiary} />
              </View>
            </Pressable>
          </View>
        </View>

        {SETTINGS_SECTIONS.map((section) => (
          <View key={String(section.titleKey)} style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t(section.titleKey)}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={String(item.labelKey)}
                  style={({ pressed }) => [
                    styles.settingRow,
                    isRTL && styles.rowReverse,
                    index < section.items.length - 1 && styles.settingRowBorder,
                    pressed && item.type === "link" && { opacity: 0.7 },
                  ]}
                  onPress={() => item.type === "link" && item.url && Linking.openURL(item.url)}
                >
                  <View style={[styles.settingLeft, isRTL && styles.rowReverse]}>
                    <View style={styles.settingIconWrap}>
                      <MaterialCommunityIcons name={item.icon} size={18} color={Colors.textSecondary} />
                    </View>
                    <Text style={[styles.settingLabel, isRTL && styles.textRight]}>{t(item.labelKey)}</Text>
                  </View>
                  <View style={[styles.settingRight, isRTL && styles.rowReverse]}>
                    {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                    {item.type === "link" && (
                      <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={16} color={Colors.textTertiary} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* AdMob Info */}
        <View style={[styles.adCard, isRTL && styles.rowReverse]}>
          <MaterialCommunityIcons name="advertisements" size={20} color={Colors.textTertiary} />
          <Text style={[styles.adText, isRTL && styles.textRight]}>{t("settings_ads")}</Text>
        </View>

        <Text style={styles.footer}>{t("settings_footer")}</Text>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, isRTL && styles.textRight]}>{t("settings_modal_title")}</Text>
            <Text style={[styles.modalSubtitle, isRTL && styles.textRight]}>{t("settings_modal_desc")}</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.langRow,
                    isRTL && styles.rowReverse,
                    item.code === language && styles.langRowSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    setLanguage(item.code);
                    setLanguageModalVisible(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langLabel, isRTL && styles.textRight, item.code === language && styles.langLabelSelected]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.langNative, isRTL && styles.textRight]}>{item.native}</Text>
                  </View>
                  {item.code === language && (
                    <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
                  )}
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.langDivider} />}
              scrollEnabled={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: Colors.card, borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: Colors.accent + "30" },
  avatarWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.accent + "15", alignItems: "center", justifyContent: "center" },
  appName: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  appTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  sectionCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.card2, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text },
  settingSubLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, marginTop: 1 },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  adCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  adText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  footer: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text, marginBottom: 4 },
  modalSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginBottom: 20, lineHeight: 18 },
  langRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4 },
  langRowSelected: { backgroundColor: Colors.accent + "10", borderRadius: 10, paddingHorizontal: 10 },
  langLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text },
  langLabelSelected: { color: Colors.accent, fontFamily: "Inter_600SemiBold" },
  langNative: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  langDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 2 },
});

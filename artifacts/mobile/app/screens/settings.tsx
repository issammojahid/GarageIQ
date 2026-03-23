import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Linking } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles, useListDiagnoses, useListFuelLogs } from "@workspace/api-client-react";

export default function SettingsScreen() {
  const { data: vehicles } = useListVehicles();
  const { data: diagnoses } = useListDiagnoses({});
  const { data: fuelLogs } = useListFuelLogs({});

  const SETTINGS_SECTIONS = [
    {
      title: "Your Data",
      items: [
        { icon: "car", label: "Vehicles", value: `${vehicles?.length ?? 0} vehicles`, type: "info" },
        { icon: "stethoscope", label: "Diagnoses", value: `${diagnoses?.length ?? 0} records`, type: "info" },
        { icon: "gas-station", label: "Fuel Logs", value: `${fuelLogs?.length ?? 0} entries`, type: "info" },
      ],
    },
    {
      title: "App Info",
      items: [
        { icon: "information-outline", label: "Version", value: "1.0.0", type: "info" },
        { icon: "shield-lock-outline", label: "Privacy Policy", type: "link", url: "https://garageiq.app/privacy" },
        { icon: "file-document-outline", label: "Terms of Service", type: "link", url: "https://garageiq.app/terms" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "email-outline", label: "Contact Support", type: "link", url: "mailto:support@garageiq.app" },
        { icon: "star-outline", label: "Rate GarageIQ", type: "link", url: "https://apps.apple.com" },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <MaterialCommunityIcons name="shield-car" size={36} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.appName}>GarageIQ</Text>
            <Text style={styles.appTagline}>AI-Powered Car Diagnosis</Text>
          </View>
        </View>

        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.settingRow,
                    index < section.items.length - 1 && styles.settingRowBorder,
                    pressed && item.type === "link" && { opacity: 0.7 },
                  ]}
                  onPress={() => item.type === "link" && item.url && Linking.openURL(item.url)}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconWrap}>
                      <MaterialCommunityIcons name={item.icon as any} size={18} color={Colors.textSecondary} />
                    </View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.settingRight}>
                    {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                    {item.type === "link" && (
                      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* AdMob Info */}
        <View style={styles.adCard}>
          <MaterialCommunityIcons name="advertisements" size={20} color={Colors.textTertiary} />
          <Text style={styles.adText}>
            GarageIQ uses ads to remain free. Your data stays on your device and is never sold.
          </Text>
        </View>

        <Text style={styles.footer}>Made with care for car enthusiasts everywhere</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: Colors.card, borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: Colors.accent + "30" },
  avatarWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.accent + "15", alignItems: "center", justifyContent: "center" },
  appName: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  appTagline: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.textSecondary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  sectionCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.card2, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.text },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  adCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  adText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  footer: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, textAlign: "center" },
});

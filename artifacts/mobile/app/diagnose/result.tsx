import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useGetDiagnosis, useListVehicles } from "@workspace/api-client-react";

const SEV_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  low: { color: Colors.success, bg: Colors.success + "18", label: "Low Severity", icon: "check-circle" },
  medium: { color: Colors.warning, bg: Colors.warning + "18", label: "Medium Severity", icon: "alert-circle" },
  high: { color: "#F97316", bg: "#F9731618", label: "High Severity", icon: "alert-octagon" },
  critical: { color: Colors.danger, bg: Colors.danger + "18", label: "Critical", icon: "alert-octagon" },
};

export default function DiagnosisResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: diagnosis, isLoading } = useGetDiagnosis(parseInt(id || "0"));
  const { data: vehicles } = useListVehicles();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Loading diagnosis...</Text>
      </View>
    );
  }

  if (!diagnosis) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>Diagnosis not found</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const result = diagnosis.result;
  const sev = SEV_CONFIG[result.severity] || SEV_CONFIG.medium;
  const vehicle = vehicles?.find((v) => v.id === diagnosis.vehicleId);
  const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Vehicle & Date */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="car" size={14} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{vehicleName}</Text>
        </View>
        <Text style={styles.metaDate}>
          {new Date(diagnosis.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </View>

      {/* Severity Banner */}
      <View style={[styles.severityBanner, { backgroundColor: sev.bg, borderColor: sev.color + "40" }]}>
        <MaterialCommunityIcons name={sev.icon as any} size={28} color={sev.color} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.severityLabel, { color: sev.color }]}>{sev.label}</Text>
          <Text style={styles.urgencyText}>{result.urgency}</Text>
        </View>
        <View style={[styles.diyBadge, { backgroundColor: result.diyFriendly ? Colors.success + "20" : Colors.danger + "20" }]}>
          <Text style={[styles.diyText, { color: result.diyFriendly ? Colors.success : Colors.danger }]}>
            {result.diyFriendly ? "DIY Friendly" : "See Mechanic"}
          </Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{result.summary}</Text>
      </View>

      {/* Issues */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identified Issues</Text>
        {result.issues.map((issue, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{issue}</Text>
          </View>
        ))}
      </View>

      {/* Repair Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repair Steps</Text>
        {result.repairSteps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Cost Estimate */}
      <View style={styles.costCard}>
        <MaterialCommunityIcons name="cash" size={22} color={Colors.success} />
        <View style={{ flex: 1 }}>
          <Text style={styles.costLabel}>Estimated Cost</Text>
          <Text style={styles.costRange}>
            ${result.estimatedCostMin} – ${result.estimatedCostMax}
          </Text>
        </View>
        <View style={[styles.diyBadge2, { backgroundColor: result.diyFriendly ? Colors.success + "20" : Colors.danger + "20" }]}>
          <Ionicons
            name={result.diyFriendly ? "hammer-outline" : "medical-outline"}
            size={16}
            color={result.diyFriendly ? Colors.success : Colors.danger}
          />
        </View>
      </View>

      {/* Systems */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Affected Systems</Text>
        <View style={styles.tagsRow}>
          {diagnosis.systems.map((s) => (
            <View key={s} style={styles.tag}>
              <Text style={styles.tagText}>{s}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <Pressable
        style={({ pressed }) => [styles.newDiagBtn, pressed && { opacity: 0.9 }]}
        onPress={() => router.push("/diagnose/new")}
      >
        <MaterialCommunityIcons name="stethoscope" size={18} color="#fff" />
        <Text style={styles.newDiagText}>New Diagnosis</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg, gap: 16 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary },
  errorText: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: Colors.text },
  backBtn: { backgroundColor: Colors.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  backBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.accent },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  metaDate: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textTertiary },
  severityBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  severityLabel: { fontFamily: "Inter_700Bold", fontSize: 17 },
  urgencyText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  diyBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: "center", justifyContent: "center" },
  diyText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: Colors.text, marginBottom: 12 },
  summaryText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent, marginTop: 7 },
  bulletText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 22 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" },
  stepText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 22, paddingTop: 4 },
  costCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  costLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  costRange: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text, marginTop: 2 },
  diyBadge2: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: Colors.card2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, textTransform: "capitalize" },
  newDiagBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  newDiagText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
});

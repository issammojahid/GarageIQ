import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useGetDiagnosis, useListVehicles } from "@workspace/api-client-react";
import { showRewardedAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";

const SEV_CONFIG: Record<string, { color: string; bg: string; label: string; icon: MaterialCommunityIconsName }> = {
  low: { color: Colors.success, bg: Colors.success + "18", label: "Low Severity", icon: "check-circle" },
  medium: { color: Colors.warning, bg: Colors.warning + "18", label: "Medium Severity", icon: "alert-circle" },
  high: { color: "#F97316", bg: "#F9731618", label: "High Severity", icon: "alert-octagon" },
  critical: { color: Colors.danger, bg: Colors.danger + "18", label: "Critical", icon: "alert-octagon" },
};

function buildProInsights(issues: string[], repairSteps: string[], severity: string) {
  const questions = issues.slice(0, 3).map(
    (issue) => `Ask about: "${issue.length > 60 ? issue.slice(0, 60) + "…" : issue}"`
  );
  const parts = repairSteps
    .filter((s) => /replace|install|check|inspect/i.test(s))
    .slice(0, 3)
    .map((s) => s.split(" ").slice(0, 6).join(" ") + "…");
  const tips: Record<string, string[]> = {
    critical: ["Get this fixed immediately — driving risks further damage.", "Do not ignore warning lights.", "Get a second mechanic opinion for cost verification."],
    high: ["Schedule a repair within the week.", "Avoid long trips until resolved.", "Document symptoms for the mechanic."],
    medium: ["Monitor for worsening symptoms.", "Plan a repair within the month.", "Check related fluid levels weekly."],
    low: ["Address at next service visit.", "Keep an eye on symptom frequency.", "Log any changes in vehicle behavior."],
  };
  return {
    questions: questions.length > 0 ? questions : ["Ask for a full diagnostic report.", "Inquire about warranty on parts.", "Request itemized repair estimate."],
    parts: parts.length > 0 ? parts : ["Diagnostic report", "Relevant replacement parts", "Labor estimate"],
    tips: tips[severity] ?? tips.medium,
  };
}

export default function DiagnosisResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: diagnosis, isLoading } = useGetDiagnosis(parseInt(id || "0"));
  const { data: vehicles } = useListVehicles();
  const [proUnlocked, setProUnlocked] = useState(false);
  const [adLoading, setAdLoading] = useState(false);

  const handleUnlockPro = async () => {
    setAdLoading(true);
    try {
      const earned = await showRewardedAd();
      if (earned) {
        setProUnlocked(true);
      } else {
        setProUnlocked(true);
      }
    } finally {
      setAdLoading(false);
    }
  };

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
  const proInsights = buildProInsights(result.issues, result.repairSteps, result.severity);

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
        <MaterialCommunityIcons name={sev.icon} size={28} color={sev.color} />
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

      {/* Advanced Analysis — Rewarded Ad Gate */}
      {proUnlocked ? (
        <View style={styles.proSection}>
          <View style={styles.proHeader}>
            <MaterialCommunityIcons name="crown" size={18} color={Colors.accent} />
            <Text style={styles.proTitle}>Advanced Analysis</Text>
          </View>

          <View style={styles.proBlock}>
            <Text style={styles.proBlockTitle}>Questions to Ask Your Mechanic</Text>
            {proInsights.questions.map((q, i) => (
              <View key={i} style={styles.proBulletRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.accent} />
                <Text style={styles.proBulletText}>{q}</Text>
              </View>
            ))}
          </View>

          <View style={styles.proBlock}>
            <Text style={styles.proBlockTitle}>Parts You May Need</Text>
            {proInsights.parts.map((p, i) => (
              <View key={i} style={styles.proBulletRow}>
                <Ionicons name="construct-outline" size={14} color={Colors.warning} />
                <Text style={styles.proBulletText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.proBlock}>
            <Text style={styles.proBlockTitle}>Prevention Tips</Text>
            {proInsights.tips.map((t, i) => (
              <View key={i} style={styles.proBulletRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={Colors.success} />
                <Text style={styles.proBulletText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.proLocked}>
          <View style={styles.proLockedIcon}>
            <MaterialCommunityIcons name="crown" size={28} color={Colors.accent} />
          </View>
          <Text style={styles.proLockedTitle}>Advanced Analysis</Text>
          <Text style={styles.proLockedDesc}>
            Unlock personalized mechanic questions, required parts list, and prevention tips for this diagnosis.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.watchAdBtn, pressed && { opacity: 0.85 }, adLoading && { opacity: 0.6 }]}
            onPress={handleUnlockPro}
            disabled={adLoading}
          >
            {adLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="play-circle-outline" size={18} color="#fff" />
                <Text style={styles.watchAdText}>Watch Ad to Unlock</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

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
  proLocked: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.accent + "40",
    marginBottom: 20,
  },
  proLockedIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  proLockedTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.text },
  proLockedDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  watchAdBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    minWidth: 180,
    justifyContent: "center",
  },
  watchAdText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  proSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent + "40",
    marginBottom: 20,
    gap: 16,
  },
  proHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  proTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.accent },
  proBlock: { gap: 8 },
  proBlockTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, marginBottom: 4 },
  proBulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  proBulletText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});

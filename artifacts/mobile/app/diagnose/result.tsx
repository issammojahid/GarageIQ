import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Share,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useGetDiagnosis } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { showRewardedAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { useI18n } from "@/i18n/TranslationContext";

const CONFIDENCE_CONFIG: Record<string, { color: string; bg: string }> = {
  High: { color: Colors.success, bg: Colors.success + "20" },
  Medium: { color: Colors.warning, bg: Colors.warning + "20" },
  Low: { color: Colors.danger, bg: Colors.danger + "20" },
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
    dangerous: ["Get this fixed immediately — driving risks further damage.", "Do not ignore warning lights.", "Get a second mechanic opinion for cost verification."],
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
  const { t, isRTL } = useI18n();

  const SEV_CONFIG: Record<string, { color: string; bg: string; label: string; icon: MaterialCommunityIconsName }> = {
    low: { color: Colors.success, bg: Colors.success + "18", label: t("sev_label_low"), icon: "check-circle" },
    medium: { color: Colors.warning, bg: Colors.warning + "18", label: t("sev_label_medium"), icon: "alert-circle" },
    high: { color: "#F97316", bg: "#F9731618", label: t("sev_label_high"), icon: "alert-octagon" },
    critical: { color: Colors.danger, bg: Colors.danger + "18", label: t("sev_label_critical"), icon: "alert-octagon" },
    dangerous: { color: Colors.danger, bg: Colors.danger + "18", label: t("sev_label_dangerous"), icon: "alert-octagon" },
  };

  const handleShare = async () => {
    if (!diagnosis) return;
    const r = diagnosis.result;
    const v = vehicles?.find((veh) => veh.id === diagnosis.vehicleId);
    const vName = v ? `${v.year} ${v.make} ${v.model}` : "Vehicle";
    const cost = r.estimatedCost
      ? r.estimatedCost
      : r.estimatedCostMin === 0 && r.estimatedCostMax === 0
      ? t("result_contact_mechanic")
      : `$${r.estimatedCostMin} – $${r.estimatedCostMax}`;
    const lines: string[] = [
      `🔧 ${t("share_diagnosis_title")}`,
      `📅 ${new Date(diagnosis.createdAt).toLocaleDateString()}`,
      `🚗 ${vName}`,
      "",
      `📝 ${t("result_symptoms")}`,
      diagnosis.symptoms,
      "",
      `⚠️ ${t("result_summary")}`,
      r.summary,
      "",
      `🔍 ${t("result_likely_causes")}`,
      ...r.issues.map((i) => `• ${i}`),
      "",
      `🛠 ${t("result_solution")}`,
      ...r.repairSteps.map((s, idx) => `${idx + 1}. ${s}`),
      "",
      `💰 ${t("result_cost")}: ${cost}`,
    ];
    if (r.maintenanceTips && r.maintenanceTips.length > 0) {
      lines.push("", `✅ ${t("result_tips")}`);
      r.maintenanceTips.forEach((tip) => lines.push(`• ${tip}`));
    }
    lines.push("", "— GarageIQ");
    await Share.share({ message: lines.join("\n"), title: t("share_diagnosis_title") });
  };

  const handleUnlockPro = async () => {
    setAdLoading(true);
    try {
      const earned = await showRewardedAd();
      if (earned) {
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
        <Text style={styles.loadingText}>{t("result_loading")}</Text>
      </View>
    );
  }

  if (!diagnosis) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>{t("result_not_found")}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t("result_go_back")}</Text>
        </Pressable>
      </View>
    );
  }

  const result = diagnosis.result;
  const sev = SEV_CONFIG[result.severity] || SEV_CONFIG.medium;
  const vehicle = vehicles?.find((v) => v.id === diagnosis.vehicleId);
  const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Vehicle";
  const proInsights = buildProInsights(result.issues, result.repairSteps, result.severity);
  const confidenceCfg = result.confidence ? CONFIDENCE_CONFIG[result.confidence] : null;

  const costDisplay = result.estimatedCost
    ? result.estimatedCost
    : result.estimatedCostMin === 0 && result.estimatedCostMax === 0
    ? t("result_contact_mechanic")
    : `$${result.estimatedCostMin} – $${result.estimatedCostMax}`;

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

      {/* Safe to Drive Card */}
      {result.safeToDrive && (
        <View style={[
          styles.safeToDriveCard,
          {
            backgroundColor: result.safeToDrive.answer === "Yes" ? Colors.success + "15" : Colors.danger + "15",
            borderColor: result.safeToDrive.answer === "Yes" ? Colors.success + "50" : Colors.danger + "50",
          },
        ]}>
          <View style={[
            styles.safeToDriveIcon,
            { backgroundColor: result.safeToDrive.answer === "Yes" ? Colors.success + "25" : Colors.danger + "25" },
          ]}>
            <MaterialCommunityIcons
              name={result.safeToDrive.answer === "Yes" ? "check-circle" : "car-off"}
              size={26}
              color={result.safeToDrive.answer === "Yes" ? Colors.success : Colors.danger}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.safeToDriveRow, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={styles.safeToDriveLabel}>{t("result_safe_to_drive")}</Text>
              <Text style={[
                styles.safeToDriveAnswer,
                { color: result.safeToDrive.answer === "Yes" ? Colors.success : Colors.danger },
              ]}>
                {result.safeToDrive.answer}
              </Text>
            </View>
            {result.safeToDrive.explanation ? (
              <Text style={styles.safeToDriveExplanation}>{result.safeToDrive.explanation}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Severity Banner */}
      <View style={[styles.severityBanner, { backgroundColor: sev.bg, borderColor: sev.color + "40" }]}>
        <MaterialCommunityIcons name={sev.icon} size={28} color={sev.color} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.severityLabel, { color: sev.color }]}>{sev.label}</Text>
          <Text style={styles.urgencyText}>{result.urgency}</Text>
        </View>
        {result.confidence && confidenceCfg ? (
          <View style={[styles.confidenceBadge, { backgroundColor: confidenceCfg.bg }]}>
            <Text style={[styles.confidenceText, { color: confidenceCfg.color }]}>
              {result.confidence}
            </Text>
            <Text style={[styles.confidenceLabel, { color: confidenceCfg.color }]}>{t("result_confidence")}</Text>
          </View>
        ) : (
          <View style={[styles.diyBadge, { backgroundColor: result.diyFriendly ? Colors.success + "20" : Colors.danger + "20" }]}>
            <Text style={[styles.diyText, { color: result.diyFriendly ? Colors.success : Colors.danger }]}>
              {result.diyFriendly ? t("result_diy_friendly") : t("result_see_mechanic")}
            </Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_summary")}</Text>
        <Text style={[styles.summaryText, isRTL && { textAlign: "right" }]}>{result.summary}</Text>
      </View>

      {/* Issues / Causes */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_likely_causes")}</Text>
        {result.issues.map((issue, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{issue}</Text>
          </View>
        ))}
      </View>

      {/* Repair Steps / Solution */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_solution")}</Text>
        {result.repairSteps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            {result.repairSteps.length > 1 ? (
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
            ) : null}
            <Text style={[styles.stepText, result.repairSteps.length === 1 && { paddingTop: 0 }]}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Cost Estimate */}
      <View style={[styles.costCard, isRTL && { flexDirection: "row-reverse" }]}>
        <MaterialCommunityIcons name="cash" size={22} color={Colors.success} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.costLabel, isRTL && { textAlign: "right" }]}>{t("result_cost")}</Text>
          <Text style={styles.costRange}>{costDisplay}</Text>
        </View>
        <View style={[styles.diyBadge2, { backgroundColor: result.diyFriendly ? Colors.success + "20" : Colors.danger + "20" }]}>
          <Ionicons
            name={result.diyFriendly ? "hammer-outline" : "medical-outline"}
            size={16}
            color={result.diyFriendly ? Colors.success : Colors.danger}
          />
        </View>
      </View>

      {/* Maintenance Tips */}
      {result.maintenanceTips && result.maintenanceTips.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_tips")}</Text>
          {result.maintenanceTips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.accent} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {result.notes ? (
        <View style={styles.notesCard}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.notesText}>{result.notes}</Text>
        </View>
      ) : null}

      {/* Systems */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_systems")}</Text>
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
            <Text style={[styles.proTitle, isRTL && { textAlign: "right" }]}>{t("result_advanced")}</Text>
          </View>

          <View style={styles.proBlock}>
            <Text style={[styles.proBlockTitle, isRTL && { textAlign: "right" }]}>{t("result_questions_title")}</Text>
            {proInsights.questions.map((q, i) => (
              <View key={i} style={styles.proBulletRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.accent} />
                <Text style={styles.proBulletText}>{q}</Text>
              </View>
            ))}
          </View>

          <View style={styles.proBlock}>
            <Text style={[styles.proBlockTitle, isRTL && { textAlign: "right" }]}>{t("result_parts_title")}</Text>
            {proInsights.parts.map((p, i) => (
              <View key={i} style={styles.proBulletRow}>
                <Ionicons name="construct-outline" size={14} color={Colors.warning} />
                <Text style={styles.proBulletText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={styles.proBlock}>
            <Text style={[styles.proBlockTitle, isRTL && { textAlign: "right" }]}>{t("result_prevention_title")}</Text>
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
          <Text style={[styles.proLockedTitle, isRTL && { textAlign: "right" }]}>{t("result_advanced")}</Text>
          <Text style={[styles.proLockedDesc, isRTL && { textAlign: "right" }]}>{t("result_pro_desc")}</Text>
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
                <Text style={styles.watchAdText}>{t("result_watch_ad")}</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.9 }]}
          onPress={handleShare}
        >
          <Feather name="share-2" size={17} color={Colors.accent} />
          <Text style={styles.shareBtnText}>{t("result_share")}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.newDiagBtn, pressed && { opacity: 0.9 }]}
          onPress={() => router.push("/diagnose/new")}
        >
          <MaterialCommunityIcons name="stethoscope" size={18} color="#fff" />
          <Text style={styles.newDiagText}>{t("result_new")}</Text>
        </Pressable>
      </View>
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
  safeToDriveCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  safeToDriveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  safeToDriveRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  safeToDriveLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  safeToDriveAnswer: { fontFamily: "Inter_700Bold", fontSize: 16 },
  safeToDriveExplanation: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
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
  confidenceBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  confidenceText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  confidenceLabel: { fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 1 },
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
  costRange: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text, marginTop: 2 },
  diyBadge2: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  tipText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 21 },
  notesCard: {
    backgroundColor: Colors.card2 ?? Colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  notesText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: Colors.card2 ?? Colors.card, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary, textTransform: "capitalize" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.accent + "50",
  },
  shareBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.accent },
  newDiagBtn: {
    flex: 2,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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

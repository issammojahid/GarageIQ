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
import { useGetDiagnosis } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { showRewardedAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { useI18n } from "@/i18n/TranslationContext";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

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
  const { colors } = useTheme();
  const s = makeStyles(colors);

  const CONFIDENCE_CONFIG: Record<string, { color: string; bg: string }> = {
    High: { color: colors.success, bg: colors.success + "20" },
    Medium: { color: colors.warning, bg: colors.warning + "20" },
    Low: { color: colors.danger, bg: colors.danger + "20" },
  };

  const SEV_CONFIG: Record<string, { color: string; bg: string; label: string; icon: MaterialCommunityIconsName }> = {
    low: { color: colors.success, bg: colors.success + "18", label: t("sev_label_low"), icon: "check-circle" },
    medium: { color: colors.warning, bg: colors.warning + "18", label: t("sev_label_medium"), icon: "alert-circle" },
    high: { color: "#F97316", bg: "#F9731618", label: t("sev_label_high"), icon: "alert-octagon" },
    critical: { color: colors.danger, bg: colors.danger + "18", label: t("sev_label_critical"), icon: "alert-octagon" },
    dangerous: { color: colors.danger, bg: colors.danger + "18", label: t("sev_label_dangerous"), icon: "alert-octagon" },
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
      ...r.repairSteps.map((step, idx) => `${idx + 1}. ${step}`),
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
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={s.loadingText}>{t("result_loading")}</Text>
      </View>
    );
  }

  if (!diagnosis) {
    return (
      <View style={s.center}>
        <Feather name="alert-circle" size={48} color={colors.danger} />
        <Text style={s.errorText}>{t("result_not_found")}</Text>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Text style={s.backBtnText}>{t("result_go_back")}</Text>
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
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Vehicle & Date */}
      <View style={s.metaRow}>
        <View style={s.metaItem}>
          <MaterialCommunityIcons name="car" size={14} color={colors.textSecondary} />
          <Text style={s.metaText}>{vehicleName}</Text>
        </View>
        <Text style={s.metaDate}>
          {new Date(diagnosis.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </View>

      {/* Safe to Drive Card */}
      {result.safeToDrive && (
        <View style={[
          s.safeToDriveCard,
          {
            backgroundColor: result.safeToDrive.answer === "Yes" ? colors.success + "15" : colors.danger + "15",
            borderColor: result.safeToDrive.answer === "Yes" ? colors.success + "50" : colors.danger + "50",
          },
        ]}>
          <View style={[
            s.safeToDriveIcon,
            { backgroundColor: result.safeToDrive.answer === "Yes" ? colors.success + "25" : colors.danger + "25" },
          ]}>
            <MaterialCommunityIcons
              name={result.safeToDrive.answer === "Yes" ? "check-circle" : "car-off"}
              size={26}
              color={result.safeToDrive.answer === "Yes" ? colors.success : colors.danger}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[s.safeToDriveRow, isRTL && { flexDirection: "row-reverse" }]}>
              <Text style={s.safeToDriveLabel}>{t("result_safe_to_drive")}</Text>
              <Text style={[
                s.safeToDriveAnswer,
                { color: result.safeToDrive.answer === "Yes" ? colors.success : colors.danger },
              ]}>
                {result.safeToDrive.answer}
              </Text>
            </View>
            {result.safeToDrive.explanation ? (
              <Text style={s.safeToDriveExplanation}>{result.safeToDrive.explanation}</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Severity Banner */}
      <View style={[s.severityBanner, { backgroundColor: sev.bg, borderColor: sev.color + "40" }]}>
        <MaterialCommunityIcons name={sev.icon} size={28} color={sev.color} />
        <View style={{ flex: 1 }}>
          <Text style={[s.severityLabel, { color: sev.color }]}>{sev.label}</Text>
          <Text style={s.urgencyText}>{result.urgency}</Text>
        </View>
        {result.confidence && confidenceCfg ? (
          <View style={[s.confidenceBadge, { backgroundColor: confidenceCfg.bg }]}>
            <Text style={[s.confidenceText, { color: confidenceCfg.color }]}>
              {result.confidence}
            </Text>
            <Text style={[s.confidenceLabel, { color: confidenceCfg.color }]}>{t("result_confidence")}</Text>
          </View>
        ) : (
          <View style={[s.diyBadge, { backgroundColor: result.diyFriendly ? colors.success + "20" : colors.danger + "20" }]}>
            <Text style={[s.diyText, { color: result.diyFriendly ? colors.success : colors.danger }]}>
              {result.diyFriendly ? t("result_diy_friendly") : t("result_see_mechanic")}
            </Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_summary")}</Text>
        <Text style={[s.summaryText, isRTL && { textAlign: "right" }]}>{result.summary}</Text>
      </View>

      {/* Issues / Causes */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_likely_causes")}</Text>
        {result.issues.map((issue, i) => (
          <View key={i} style={s.bulletRow}>
            <View style={s.bullet} />
            <Text style={s.bulletText}>{issue}</Text>
          </View>
        ))}
      </View>

      {/* Repair Steps / Solution */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_solution")}</Text>
        {result.repairSteps.map((step, i) => (
          <View key={i} style={s.stepRow}>
            {result.repairSteps.length > 1 ? (
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
            ) : null}
            <Text style={[s.stepText, result.repairSteps.length === 1 && { paddingTop: 0 }]}>{step}</Text>
          </View>
        ))}
      </View>

      {/* Cost Estimate */}
      <View style={[s.costCard, isRTL && { flexDirection: "row-reverse" }]}>
        <MaterialCommunityIcons name="cash" size={22} color={colors.success} />
        <View style={{ flex: 1 }}>
          <Text style={[s.costLabel, isRTL && { textAlign: "right" }]}>{t("result_cost")}</Text>
          <Text style={s.costRange}>{costDisplay}</Text>
        </View>
        <View style={[s.diyBadge2, { backgroundColor: result.diyFriendly ? colors.success + "20" : colors.danger + "20" }]}>
          <Ionicons
            name={result.diyFriendly ? "hammer-outline" : "medical-outline"}
            size={16}
            color={result.diyFriendly ? colors.success : colors.danger}
          />
        </View>
      </View>

      {/* Maintenance Tips */}
      {result.maintenanceTips && result.maintenanceTips.length > 0 && (
        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_tips")}</Text>
          {result.maintenanceTips.map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.accent} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {result.notes ? (
        <View style={s.notesCard}>
          <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
          <Text style={s.notesText}>{result.notes}</Text>
        </View>
      ) : null}

      {/* Systems */}
      <View style={s.section}>
        <Text style={[s.sectionTitle, isRTL && { textAlign: "right" }]}>{t("result_systems")}</Text>
        <View style={s.tagsRow}>
          {diagnosis.systems.map((sys) => (
            <View key={sys} style={s.tag}>
              <Text style={s.tagText}>{sys}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Advanced Analysis — Rewarded Ad Gate */}
      {proUnlocked ? (
        <View style={s.proSection}>
          <View style={s.proHeader}>
            <MaterialCommunityIcons name="crown" size={18} color={colors.accent} />
            <Text style={[s.proTitle, isRTL && { textAlign: "right" }]}>{t("result_advanced")}</Text>
          </View>

          <View style={s.proBlock}>
            <Text style={[s.proBlockTitle, isRTL && { textAlign: "right" }]}>{t("result_questions_title")}</Text>
            {proInsights.questions.map((q, i) => (
              <View key={i} style={s.proBulletRow}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.accent} />
                <Text style={s.proBulletText}>{q}</Text>
              </View>
            ))}
          </View>

          <View style={s.proBlock}>
            <Text style={[s.proBlockTitle, isRTL && { textAlign: "right" }]}>{t("result_parts_title")}</Text>
            {proInsights.parts.map((p, i) => (
              <View key={i} style={s.proBulletRow}>
                <Ionicons name="construct-outline" size={14} color={colors.warning} />
                <Text style={s.proBulletText}>{p}</Text>
              </View>
            ))}
          </View>

          <View style={s.proBlock}>
            <Text style={[s.proBlockTitle, isRTL && { textAlign: "right" }]}>{t("result_prevention_title")}</Text>
            {proInsights.tips.map((tip, i) => (
              <View key={i} style={s.proBulletRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.success} />
                <Text style={s.proBulletText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={s.proLocked}>
          <View style={s.proLockedIcon}>
            <MaterialCommunityIcons name="crown" size={28} color={colors.accent} />
          </View>
          <Text style={[s.proLockedTitle, isRTL && { textAlign: "right" }]}>{t("result_advanced")}</Text>
          <Text style={[s.proLockedDesc, isRTL && { textAlign: "right" }]}>{t("result_pro_desc")}</Text>
          <Pressable
            style={({ pressed }) => [s.watchAdBtn, pressed && { opacity: 0.85 }, adLoading && { opacity: 0.6 }]}
            onPress={handleUnlockPro}
            disabled={adLoading}
          >
            {adLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="play-circle-outline" size={18} color="#fff" />
                <Text style={s.watchAdText}>{t("result_watch_ad")}</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Actions */}
      <View style={s.actionsRow}>
        <Pressable
          style={({ pressed }) => [s.shareBtn, pressed && { opacity: 0.9 }]}
          onPress={handleShare}
        >
          <Feather name="share-2" size={17} color={colors.accent} />
          <Text style={s.shareBtnText}>{t("result_share")}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [s.newDiagBtn, pressed && { opacity: 0.9 }]}
          onPress={() => router.push("/diagnose/new")}
        >
          <MaterialCommunityIcons name="stethoscope" size={18} color="#fff" />
          <Text style={s.newDiagText}>{t("result_new")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 16 },
    loadingText: { fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary },
    errorText: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: colors.text },
    backBtn: { backgroundColor: colors.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
    backBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.accent },
    metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    metaText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    metaDate: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textTertiary },
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
    safeToDriveLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text },
    safeToDriveAnswer: { fontFamily: "Inter_700Bold", fontSize: 16 },
    safeToDriveExplanation: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
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
    urgencyText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 2 },
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
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: colors.text, marginBottom: 12 },
    summaryText: { fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
    bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 7 },
    bulletText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text, lineHeight: 22 },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    stepNumText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" },
    stepText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text, lineHeight: 22, paddingTop: 4 },
    costCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    costLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    costRange: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, marginTop: 2 },
    diyBadge2: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
    tipText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text, lineHeight: 21 },
    notesCard: {
      backgroundColor: colors.card2,
      borderRadius: 14,
      padding: 14,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    notesText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tag: { backgroundColor: colors.card2, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
    tagText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary, textTransform: "capitalize" },
    actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    shareBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.accent + "50",
    },
    shareBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.accent },
    newDiagBtn: {
      flex: 2,
      backgroundColor: colors.accent,
      borderRadius: 14,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    newDiagText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
    proLocked: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: colors.accent + "40",
      marginBottom: 20,
    },
    proLockedIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.accent + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    proLockedTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: colors.text },
    proLockedDesc: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    watchAdBtn: {
      backgroundColor: colors.accent,
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
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.accent + "40",
      marginBottom: 20,
      gap: 16,
    },
    proHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
    proTitle: { fontFamily: "Inter_700Bold", fontSize: 17, color: colors.accent },
    proBlock: { gap: 8 },
    proBlockTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text, marginBottom: 4 },
    proBulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    proBulletText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  });
}

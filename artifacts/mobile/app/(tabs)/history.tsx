import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useListDiagnoses, type Diagnosis } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { BannerAd } from "@/components/AdBanner";
import { useI18n } from "@/i18n/TranslationContext";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

type SeverityKey = "low" | "medium" | "high" | "critical";
type DateRange = "all" | "7d" | "30d" | "3m";

export default function HistoryTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, isRTL } = useI18n();
  const { colors } = useTheme();

  const [vehicleFilter, setVehicleFilter] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityKey | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange>("all");

  const { data: diagnoses, isLoading, refetch } = useListDiagnoses(
    vehicleFilter != null ? { vehicleId: vehicleFilter } : {}
  );
  const { data: vehicles } = useListVehicles();

  const SEV_CONFIG: Record<SeverityKey, { color: string; label: string }> = {
    low: { color: colors.success, label: t("sev_low") },
    medium: { color: colors.warning, label: t("sev_medium") },
    high: { color: "#F97316", label: t("sev_high") },
    critical: { color: colors.danger, label: t("sev_critical") },
  };

  const DATE_RANGES: { key: DateRange; label: string }[] = [
    { key: "all", label: t("filter_all") },
    { key: "7d", label: t("filter_7d") },
    { key: "30d", label: t("filter_30d") },
    { key: "3m", label: t("filter_3m") },
  ];

  const SEVERITIES: { key: SeverityKey; label: string; color: string }[] = [
    { key: "low", label: t("sev_low"), color: colors.success },
    { key: "medium", label: t("sev_medium"), color: colors.warning },
    { key: "high", label: t("sev_high"), color: "#F97316" },
    { key: "critical", label: t("sev_critical"), color: colors.danger },
  ];

  const getVehicleName = (vehicleId: number) => {
    const v = vehicles?.find((v) => v.id === vehicleId);
    return v ? `${v.year} ${v.make} ${v.model}` : t("unknown_vehicle");
  };

  const filteredDiagnoses = useMemo(() => {
    let items = diagnoses?.slice().reverse() ?? [];

    if (severityFilter) {
      items = items.filter((d) => d.result?.severity === severityFilter);
    }

    if (dateFilter !== "all") {
      const days = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      items = items.filter((d) => new Date(d.createdAt).getTime() >= cutoff);
    }

    return items;
  }, [diagnoses, severityFilter, dateFilter]);

  const hasActiveFilters = vehicleFilter != null || severityFilter != null || dateFilter !== "all";

  const s = makeStyles(colors);

  const renderItem = ({ item }: { item: Diagnosis }) => {
    const sev = SEV_CONFIG[item.result?.severity as SeverityKey] || SEV_CONFIG.medium;
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <Pressable
        style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}
        onPress={() => router.push({ pathname: "/diagnose/result", params: { id: item.id } })}
      >
        <View style={[s.cardHeader, isRTL && s.rowReverse]}>
          <View style={[s.vehicleInfo, isRTL && s.rowReverse]}>
            <MaterialCommunityIcons name="car" size={16} color={colors.textSecondary} />
            <Text style={s.vehicleName}>{getVehicleName(item.vehicleId)}</Text>
          </View>
          <View style={[s.severityBadge, { backgroundColor: sev.color + "20" }]}>
            <View style={[s.severityDot, { backgroundColor: sev.color }]} />
            <Text style={[s.severityText, { color: sev.color }]}>{sev.label}</Text>
          </View>
        </View>
        <Text style={[s.summary, isRTL && s.textRight]} numberOfLines={2}>{item.result?.summary}</Text>
        <View style={[s.cardFooter, isRTL && s.rowReverse]}>
          <Text style={s.dateText}>{date}</Text>
          <View style={[s.systemTags, isRTL && s.rowReverse]}>
            {(item.systems || []).slice(0, 2).map((sys: string) => (
              <View key={sys} style={s.tag}>
                <Text style={s.tagText}>{sys}</Text>
              </View>
            ))}
            {(item.systems || []).length > 2 && (
              <View style={s.tag}>
                <Text style={s.tagText}>+{item.systems.length - 2}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={[s.header, isRTL && s.rowReverse]}>
        <Text style={[s.headerTitle, isRTL && s.textRight]}>{t("history_title")}</Text>
        <Text style={s.headerCount}>
          {filteredDiagnoses.length} {t("history_diagnoses")}
        </Text>
      </View>

      {/* Vehicle Filter */}
      {vehicles && vehicles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
        >
          <Pressable
            style={[s.chip, vehicleFilter == null && s.chipActive]}
            onPress={() => setVehicleFilter(null)}
          >
            <Text style={[s.chipText, vehicleFilter == null && s.chipTextActive]}>
              {t("filter_all_vehicles")}
            </Text>
          </Pressable>
          {vehicles.map((v) => (
            <Pressable
              key={v.id}
              style={[s.chip, vehicleFilter === v.id && s.chipActive]}
              onPress={() => setVehicleFilter(vehicleFilter === v.id ? null : v.id)}
            >
              <Text style={[s.chipText, vehicleFilter === v.id && s.chipTextActive]}>
                {v.year} {v.make}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Severity Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
      >
        <Pressable
          style={[s.chip, severityFilter == null && s.chipActive]}
          onPress={() => setSeverityFilter(null)}
        >
          <Text style={[s.chipText, severityFilter == null && s.chipTextActive]}>
            {t("filter_all")}
          </Text>
        </Pressable>
        {SEVERITIES.map((sv) => (
          <Pressable
            key={sv.key}
            style={[
              s.chip,
              severityFilter === sv.key && { backgroundColor: sv.color + "25", borderColor: sv.color },
            ]}
            onPress={() => setSeverityFilter(severityFilter === sv.key ? null : sv.key)}
          >
            {severityFilter === sv.key && (
              <View style={[s.chipDot, { backgroundColor: sv.color }]} />
            )}
            <Text style={[s.chipText, severityFilter === sv.key && { color: sv.color, fontFamily: "Inter_600SemiBold" }]}>
              {sv.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Date Range Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[s.filterRow, s.filterRowBottom]}
      >
        {DATE_RANGES.map((d) => (
          <Pressable
            key={d.key}
            style={[s.chip, dateFilter === d.key && s.chipActive]}
            onPress={() => setDateFilter(d.key)}
          >
            <Text style={[s.chipText, dateFilter === d.key && s.chipTextActive]}>
              {d.label}
            </Text>
          </Pressable>
        ))}
        {hasActiveFilters && (
          <Pressable
            style={s.clearBtn}
            onPress={() => {
              setVehicleFilter(null);
              setSeverityFilter(null);
              setDateFilter("all");
            }}
          >
            <Feather name="x" size={12} color={colors.textSecondary} />
            <Text style={s.clearText}>{t("filter_clear")}</Text>
          </Pressable>
        )}
      </ScrollView>

      <BannerAd size="banner" />

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredDiagnoses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[s.list, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={s.empty}>
              <Feather name="clock" size={48} color={colors.textTertiary} />
              <Text style={s.emptyTitle}>{t("history_empty_title")}</Text>
              <Text style={[s.emptyDesc, isRTL && s.textRight]}>
                {hasActiveFilters
                  ? t("filter_no_results")
                  : t("history_empty_desc")}
              </Text>
              {!hasActiveFilters && (
                <Pressable
                  style={s.emptyBtn}
                  onPress={() => router.push("/diagnose/new")}
                >
                  <Text style={s.emptyBtnText}>{t("history_start_first")}</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10, paddingTop: 12 },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: colors.text },
    headerCount: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary },
    filterRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 4, flexDirection: "row" },
    filterRowBottom: { paddingBottom: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.accent + "20", borderColor: colors.accent },
    chipDot: { width: 6, height: 6, borderRadius: 3 },
    chipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    chipTextActive: { color: colors.accent, fontFamily: "Inter_600SemiBold" },
    clearBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.card2,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary },
    list: { paddingHorizontal: 20, paddingTop: 4 },
    card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
    vehicleInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
    vehicleName: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    severityBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    severityDot: { width: 6, height: 6, borderRadius: 3 },
    severityText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
    summary: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text, lineHeight: 20, marginBottom: 10 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    dateText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary },
    systemTags: { flexDirection: "row", gap: 6 },
    tag: { backgroundColor: colors.card2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    tagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: colors.textSecondary },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: colors.text, marginTop: 16, marginBottom: 8 },
    emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
    emptyBtn: { marginTop: 20, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
    emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  });
}

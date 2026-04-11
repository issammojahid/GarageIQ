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
import Colors from "@/constants/colors";
import { useListDiagnoses, type Diagnosis } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { BannerAd } from "@/components/AdBanner";
import { useI18n } from "@/i18n/TranslationContext";

type SeverityKey = "low" | "medium" | "high" | "critical";
type DateRange = "all" | "7d" | "30d" | "3m";

export default function HistoryTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, isRTL } = useI18n();

  const [vehicleFilter, setVehicleFilter] = useState<number | null>(null);
  const [severityFilter, setSeverityFilter] = useState<SeverityKey | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRange>("all");

  const { data: diagnoses, isLoading, refetch } = useListDiagnoses(
    vehicleFilter != null ? { vehicleId: vehicleFilter } : {}
  );
  const { data: vehicles } = useListVehicles();

  const SEV_CONFIG: Record<SeverityKey, { color: string; label: string }> = {
    low: { color: Colors.success, label: t("sev_low") },
    medium: { color: Colors.warning, label: t("sev_medium") },
    high: { color: "#F97316", label: t("sev_high") },
    critical: { color: Colors.danger, label: t("sev_critical") },
  };

  const DATE_RANGES: { key: DateRange; label: string }[] = [
    { key: "all", label: t("filter_all") },
    { key: "7d", label: t("filter_7d") },
    { key: "30d", label: t("filter_30d") },
    { key: "3m", label: t("filter_3m") },
  ];

  const SEVERITIES: { key: SeverityKey; label: string; color: string }[] = [
    { key: "low", label: t("sev_low"), color: Colors.success },
    { key: "medium", label: t("sev_medium"), color: Colors.warning },
    { key: "high", label: t("sev_high"), color: "#F97316" },
    { key: "critical", label: t("sev_critical"), color: Colors.danger },
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

  const renderItem = ({ item }: { item: Diagnosis }) => {
    const sev = SEV_CONFIG[item.result?.severity as SeverityKey] || SEV_CONFIG.medium;
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        onPress={() => router.push({ pathname: "/diagnose/result", params: { id: item.id } })}
      >
        <View style={[styles.cardHeader, isRTL && styles.rowReverse]}>
          <View style={[styles.vehicleInfo, isRTL && styles.rowReverse]}>
            <MaterialCommunityIcons name="car" size={16} color={Colors.textSecondary} />
            <Text style={styles.vehicleName}>{getVehicleName(item.vehicleId)}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: sev.color + "20" }]}>
            <View style={[styles.severityDot, { backgroundColor: sev.color }]} />
            <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
          </View>
        </View>
        <Text style={[styles.summary, isRTL && styles.textRight]} numberOfLines={2}>{item.result?.summary}</Text>
        <View style={[styles.cardFooter, isRTL && styles.rowReverse]}>
          <Text style={styles.dateText}>{date}</Text>
          <View style={[styles.systemTags, isRTL && styles.rowReverse]}>
            {(item.systems || []).slice(0, 2).map((s: string) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
            {(item.systems || []).length > 2 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{item.systems.length - 2}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t("history_title")}</Text>
        <Text style={styles.headerCount}>
          {filteredDiagnoses.length} {t("history_diagnoses")}
        </Text>
      </View>

      {/* Vehicle Filter */}
      {vehicles && vehicles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            style={[styles.chip, vehicleFilter == null && styles.chipActive]}
            onPress={() => setVehicleFilter(null)}
          >
            <Text style={[styles.chipText, vehicleFilter == null && styles.chipTextActive]}>
              {t("filter_all_vehicles")}
            </Text>
          </Pressable>
          {vehicles.map((v) => (
            <Pressable
              key={v.id}
              style={[styles.chip, vehicleFilter === v.id && styles.chipActive]}
              onPress={() => setVehicleFilter(vehicleFilter === v.id ? null : v.id)}
            >
              <Text style={[styles.chipText, vehicleFilter === v.id && styles.chipTextActive]}>
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
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          style={[styles.chip, severityFilter == null && styles.chipActive]}
          onPress={() => setSeverityFilter(null)}
        >
          <Text style={[styles.chipText, severityFilter == null && styles.chipTextActive]}>
            {t("filter_all")}
          </Text>
        </Pressable>
        {SEVERITIES.map((s) => (
          <Pressable
            key={s.key}
            style={[
              styles.chip,
              severityFilter === s.key && { backgroundColor: s.color + "25", borderColor: s.color },
            ]}
            onPress={() => setSeverityFilter(severityFilter === s.key ? null : s.key)}
          >
            {severityFilter === s.key && (
              <View style={[styles.chipDot, { backgroundColor: s.color }]} />
            )}
            <Text style={[styles.chipText, severityFilter === s.key && { color: s.color, fontFamily: "Inter_600SemiBold" }]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Date Range Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterRow, styles.filterRowBottom]}
      >
        {DATE_RANGES.map((d) => (
          <Pressable
            key={d.key}
            style={[styles.chip, dateFilter === d.key && styles.chipActive]}
            onPress={() => setDateFilter(d.key)}
          >
            <Text style={[styles.chipText, dateFilter === d.key && styles.chipTextActive]}>
              {d.label}
            </Text>
          </Pressable>
        ))}
        {hasActiveFilters && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setVehicleFilter(null);
              setSeverityFilter(null);
              setDateFilter("all");
            }}
          >
            <Feather name="x" size={12} color={Colors.textSecondary} />
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
      </ScrollView>

      <BannerAd size="banner" />

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filteredDiagnoses}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="clock" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t("history_empty_title")}</Text>
              <Text style={[styles.emptyDesc, isRTL && styles.textRight]}>
                {hasActiveFilters
                  ? "No results match the selected filters"
                  : t("history_empty_desc")}
              </Text>
              {!hasActiveFilters && (
                <Pressable
                  style={styles.emptyBtn}
                  onPress={() => router.push("/diagnose/new")}
                >
                  <Text style={styles.emptyBtnText}>{t("history_start_first")}</Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10, paddingTop: 12 },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.text },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 4, flexDirection: "row" },
  filterRowBottom: { paddingBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.accent + "20", borderColor: Colors.accent },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  chipTextActive: { color: Colors.accent, fontFamily: "Inter_600SemiBold" },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.card2,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vehicleInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  vehicleName: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  severityBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  summary: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary },
  systemTags: { flexDirection: "row", gap: 6 },
  tag: { backgroundColor: Colors.card2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 },
  emptyBtn: { marginTop: 20, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});

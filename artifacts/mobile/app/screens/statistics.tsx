import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import {
  useListFuelLogs,
  useListDiagnoses,
  useListMaintenance,
} from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";

export default function StatisticsScreen() {
  const { colors } = useTheme();
  const { data: vehicles } = useListVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const vehicleId = selectedVehicleId ?? vehicles?.[0]?.id;

  const { data: fuelLogs } = useListFuelLogs({ vehicleId });
  const { data: diagnoses } = useListDiagnoses({ vehicleId });
  const { data: maintenance } = useListMaintenance({ vehicleId });

  const totalFuelCost = fuelLogs?.reduce((s, l) => s + l.totalCost, 0) ?? 0;
  const totalLiters = fuelLogs?.reduce((s, l) => s + l.liters, 0) ?? 0;
  const totalMaintenanceCost = maintenance?.reduce((s, m) => s + (m.cost ?? 0), 0) ?? 0;
  const totalDiagnoses = diagnoses?.length ?? 0;

  const fuelByMonth: Record<string, number> = {};
  fuelLogs?.forEach((l) => {
    const month = l.date.substring(0, 7);
    fuelByMonth[month] = (fuelByMonth[month] || 0) + l.totalCost;
  });
  const monthKeys = Object.keys(fuelByMonth).sort().slice(-6);
  const maxMonth = Math.max(...monthKeys.map((k) => fuelByMonth[k]), 1);

  const sevBreakdown = {
    low: diagnoses?.filter((d) => d.result?.severity === "low").length ?? 0,
    medium: diagnoses?.filter((d) => d.result?.severity === "medium").length ?? 0,
    high: diagnoses?.filter((d) => d.result?.severity === "high").length ?? 0,
    critical: diagnoses?.filter((d) => d.result?.severity === "critical").length ?? 0,
  };

  const sevColors: Record<string, string> = { low: colors.success, medium: colors.warning, high: "#F97316", critical: colors.danger };

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.vehicleBar}>
        {(vehicles ?? []).map((v) => (
          <Pressable key={v.id} style={[s.vehicleChip, vehicleId === v.id && s.vehicleChipActive]} onPress={() => setSelectedVehicleId(v.id)}>
            <Text style={[s.vehicleChipText, vehicleId === v.id && s.vehicleChipTextActive]}>{v.year} {v.make}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.statsGrid}>
          <View style={s.statCard}>
            <MaterialCommunityIcons name="gas-station" size={22} color={colors.success} />
            <Text style={s.statValue}>${totalFuelCost.toFixed(0)}</Text>
            <Text style={s.statLabel}>Fuel Spent</Text>
          </View>
          <View style={s.statCard}>
            <MaterialCommunityIcons name="fuel" size={22} color={colors.info} />
            <Text style={s.statValue}>{totalLiters.toFixed(0)}L</Text>
            <Text style={s.statLabel}>Total Fuel</Text>
          </View>
          <View style={s.statCard}>
            <MaterialCommunityIcons name="wrench" size={22} color={colors.warning} />
            <Text style={s.statValue}>${totalMaintenanceCost.toFixed(0)}</Text>
            <Text style={s.statLabel}>Maintenance</Text>
          </View>
          <View style={s.statCard}>
            <MaterialCommunityIcons name="stethoscope" size={22} color={colors.accent} />
            <Text style={s.statValue}>{totalDiagnoses}</Text>
            <Text style={s.statLabel}>Diagnoses</Text>
          </View>
        </View>

        {monthKeys.length > 0 && (
          <View style={s.chartSection}>
            <Text style={s.chartTitle}>Fuel Cost by Month</Text>
            <View style={s.barChart}>
              {monthKeys.map((month) => {
                const val = fuelByMonth[month];
                const pct = val / maxMonth;
                return (
                  <View key={month} style={s.barGroup}>
                    <Text style={s.barValue}>${val.toFixed(0)}</Text>
                    <View style={s.barBg}>
                      <View style={[s.bar, { height: `${Math.max(pct * 100, 4)}%` }]} />
                    </View>
                    <Text style={s.barLabel}>{month.slice(5)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {totalDiagnoses > 0 && (
          <View style={s.chartSection}>
            <Text style={s.chartTitle}>Diagnosis Severity</Text>
            {Object.entries(sevBreakdown).map(([sev, count]) => {
              const pct = totalDiagnoses > 0 ? (count / totalDiagnoses) * 100 : 0;
              return (
                <View key={sev} style={s.sevRow}>
                  <View style={[s.sevDot, { backgroundColor: sevColors[sev] }]} />
                  <Text style={s.sevLabel}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</Text>
                  <View style={s.sevBarBg}>
                    <View style={[s.sevBar, { width: `${pct}%`, backgroundColor: sevColors[sev] }]} />
                  </View>
                  <Text style={s.sevCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={s.totalCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={s.totalLabel}>Total Vehicle Cost</Text>
            <Text style={s.totalValue}>${(totalFuelCost + totalMaintenanceCost).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    vehicleBar: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
    vehicleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: 8 },
    vehicleChipActive: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    vehicleChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    vehicleChipTextActive: { color: colors.accent },
    content: { padding: 20, paddingBottom: 40 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
    statCard: { width: "47%", backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    chartSection: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    chartTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.text, marginBottom: 16 },
    barChart: { flexDirection: "row", height: 120, alignItems: "flex-end", gap: 8 },
    barGroup: { flex: 1, alignItems: "center", height: "100%" },
    barValue: { fontFamily: "Inter_400Regular", fontSize: 9, color: colors.textSecondary, marginBottom: 4 },
    barBg: { flex: 1, width: "100%", backgroundColor: colors.card2, borderRadius: 4, justifyContent: "flex-end" },
    bar: { width: "100%", backgroundColor: colors.accent, borderRadius: 4 },
    barLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: colors.textSecondary, marginTop: 4 },
    sevRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    sevDot: { width: 8, height: 8, borderRadius: 4 },
    sevLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.text, width: 60 },
    sevBarBg: { flex: 1, height: 6, backgroundColor: colors.card2, borderRadius: 3 },
    sevBar: { height: 6, borderRadius: 3 },
    sevCount: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text, width: 24, textAlign: "right" },
    totalCard: { backgroundColor: colors.accent + "15", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.accent + "40" },
    totalLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    totalValue: { fontFamily: "Inter_700Bold", fontSize: 24, color: colors.text },
  });
}

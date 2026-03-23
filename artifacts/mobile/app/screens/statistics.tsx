import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  useListVehicles,
  useListFuelLogs,
  useListDiagnoses,
  useListMaintenance,
} from "@workspace/api-client-react";

export default function StatisticsScreen() {
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
  const criticalDiagnoses = diagnoses?.filter((d) => d.result?.severity === "critical" || d.result?.severity === "high").length ?? 0;

  // Last 6 months fuel data
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

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleBar}>
        {(vehicles ?? []).map((v) => (
          <Pressable key={v.id} style={[styles.vehicleChip, vehicleId === v.id && styles.vehicleChipActive]} onPress={() => setSelectedVehicleId(v.id)}>
            <Text style={[styles.vehicleChipText, vehicleId === v.id && styles.vehicleChipTextActive]}>{v.year} {v.make}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gas-station" size={22} color={Colors.success} />
            <Text style={styles.statValue}>${totalFuelCost.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Fuel Spent</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="fuel" size={22} color={Colors.info} />
            <Text style={styles.statValue}>{totalLiters.toFixed(0)}L</Text>
            <Text style={styles.statLabel}>Total Fuel</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="wrench" size={22} color={Colors.warning} />
            <Text style={styles.statValue}>${totalMaintenanceCost.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Maintenance</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="stethoscope" size={22} color={Colors.accent} />
            <Text style={styles.statValue}>{totalDiagnoses}</Text>
            <Text style={styles.statLabel}>Diagnoses</Text>
          </View>
        </View>

        {/* Fuel Chart */}
        {monthKeys.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Fuel Cost by Month</Text>
            <View style={styles.barChart}>
              {monthKeys.map((month) => {
                const val = fuelByMonth[month];
                const pct = val / maxMonth;
                return (
                  <View key={month} style={styles.barGroup}>
                    <Text style={styles.barValue}>${val.toFixed(0)}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.bar, { height: `${Math.max(pct * 100, 4)}%` }]} />
                    </View>
                    <Text style={styles.barLabel}>{month.slice(5)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Diagnosis Breakdown */}
        {totalDiagnoses > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Diagnosis Severity</Text>
            {Object.entries(sevBreakdown).map(([sev, count]) => {
              const colors: Record<string, string> = { low: Colors.success, medium: Colors.warning, high: "#F97316", critical: Colors.danger };
              const pct = totalDiagnoses > 0 ? (count / totalDiagnoses) * 100 : 0;
              return (
                <View key={sev} style={styles.sevRow}>
                  <View style={[styles.sevDot, { backgroundColor: colors[sev] }]} />
                  <Text style={styles.sevLabel}>{sev.charAt(0).toUpperCase() + sev.slice(1)}</Text>
                  <View style={styles.sevBarBg}>
                    <View style={[styles.sevBar, { width: `${pct}%`, backgroundColor: colors[sev] }]} />
                  </View>
                  <Text style={styles.sevCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Total Cost Summary */}
        <View style={styles.totalCard}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color={Colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.totalLabel}>Total Vehicle Cost</Text>
            <Text style={styles.totalValue}>${(totalFuelCost + totalMaintenanceCost).toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  vehicleBar: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
  vehicleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, marginRight: 8 },
  vehicleChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  vehicleChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  vehicleChipTextActive: { color: Colors.accent },
  content: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  statCard: { width: "47%", backgroundColor: Colors.card, borderRadius: 16, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: Colors.border },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.text },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  chartSection: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  chartTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, marginBottom: 16 },
  barChart: { flexDirection: "row", height: 120, alignItems: "flex-end", gap: 8 },
  barGroup: { flex: 1, alignItems: "center", height: "100%" },
  barValue: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.textSecondary, marginBottom: 4 },
  barBg: { flex: 1, width: "100%", backgroundColor: Colors.card2, borderRadius: 4, justifyContent: "flex-end" },
  bar: { width: "100%", backgroundColor: Colors.accent, borderRadius: 4 },
  barLabel: { fontFamily: "Inter_500Medium", fontSize: 10, color: Colors.textSecondary, marginTop: 4 },
  sevRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sevDot: { width: 8, height: 8, borderRadius: 4 },
  sevLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.text, width: 60 },
  sevBarBg: { flex: 1, height: 6, backgroundColor: Colors.card2, borderRadius: 3 },
  sevBar: { height: 6, borderRadius: 3 },
  sevCount: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text, width: 24, textAlign: "right" },
  totalCard: { backgroundColor: Colors.accent + "15", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: Colors.accent + "40" },
  totalLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  totalValue: { fontFamily: "Inter_700Bold", fontSize: 24, color: Colors.text },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import {
  useListFuelLogs,
  useCreateFuelLog,
  useDeleteFuelLog,
  useListVehicles,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function FuelLogScreen() {
  const queryClient = useQueryClient();
  const { data: vehicles } = useListVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [odometer, setOdometer] = useState("");
  const [fuelType, setFuelType] = useState("gasoline");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const vehicleId = selectedVehicleId ?? vehicles?.[0]?.id;
  const { data: fuelLogs, isLoading, refetch } = useListFuelLogs({ vehicleId });
  const createFuelLog = useCreateFuelLog();
  const deleteFuelLog = useDeleteFuelLog();

  const totalCost = liters && pricePerLiter
    ? (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2)
    : "0.00";

  const handleSave = async () => {
    if (!vehicleId) { Alert.alert("No vehicle", "Please add a vehicle first"); return; }
    if (!liters || !pricePerLiter || !odometer) { Alert.alert("Missing info", "Please fill all required fields"); return; }
    setSaving(true);
    try {
      await createFuelLog.mutateAsync({
        data: {
          vehicleId,
          liters: parseFloat(liters),
          pricePerLiter: parseFloat(pricePerLiter),
          totalCost: parseFloat(totalCost),
          odometer: parseInt(odometer),
          fuelType,
          date,
          notes: notes || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["listFuelLogs"] });
      setShowModal(false);
      setLiters(""); setPricePerLiter(""); setOdometer(""); setNotes("");
    } catch { Alert.alert("Error", "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Remove this fuel log?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await deleteFuelLog.mutateAsync({ id });
          queryClient.invalidateQueries({ queryKey: ["listFuelLogs"] });
        }
      }
    ]);
  };

  const logs = fuelLogs ?? [];
  const totalSpent = logs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);

  return (
    <View style={styles.container}>
      {/* Vehicle Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleBar}>
        {(vehicles ?? []).map((v) => (
          <Pressable
            key={v.id}
            style={[styles.vehicleChip, vehicleId === v.id && styles.vehicleChipActive]}
            onPress={() => setSelectedVehicleId(v.id)}
          >
            <Text style={[styles.vehicleChipText, vehicleId === v.id && styles.vehicleChipTextActive]}>
              {v.year} {v.make}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalLiters.toFixed(0)}L</Text>
          <Text style={styles.statLabel}>Total Liters</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{logs.length}</Text>
          <Text style={styles.statLabel}>Fill-ups</Text>
        </View>
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={logs.slice().reverse()}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          scrollEnabled={!!logs.length}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <View style={styles.logLeft}>
                <MaterialCommunityIcons name="gas-station" size={22} color={Colors.success} />
                <View>
                  <Text style={styles.logDate}>{item.date}</Text>
                  <Text style={styles.logOdo}>{item.odometer.toLocaleString()} km</Text>
                </View>
              </View>
              <View style={styles.logRight}>
                <Text style={styles.logCost}>${item.totalCost.toFixed(2)}</Text>
                <Text style={styles.logLiters}>{item.liters.toFixed(1)}L</Text>
              </View>
              <Pressable hitSlop={10} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="gas-station-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No fuel logs yet</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Fuel Log</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Liters *</Text>
                <TextInput style={styles.input} placeholder="45.5" placeholderTextColor={Colors.textTertiary} value={liters} onChangeText={setLiters} keyboardType="decimal-pad" />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Price/L *</Text>
                <TextInput style={styles.input} placeholder="1.85" placeholderTextColor={Colors.textTertiary} value={pricePerLiter} onChangeText={setPricePerLiter} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.fieldLabel}>Total Cost</Text>
              <Text style={styles.totalCost}>${totalCost}</Text>
            </View>
            <Text style={styles.fieldLabel}>Odometer (km) *</Text>
            <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="85000" placeholderTextColor={Colors.textTertiary} value={odometer} onChangeText={setOdometer} keyboardType="number-pad" />
            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textTertiary} value={date} onChangeText={setDate} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  statsRow: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80 },
  logCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: Colors.border },
  logLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logDate: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
  logOdo: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  logRight: { alignItems: "flex-end", marginRight: 8 },
  logCost: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.success },
  logLiters: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.textSecondary },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text, marginBottom: 20 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  halfField: { flex: 1 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.card2, borderRadius: 12, padding: 12, color: Colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  totalCost: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.success },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, backgroundColor: Colors.card2, borderRadius: 12, padding: 14, alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textSecondary },
  saveBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});

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
  useListMaintenance,
  useCreateMaintenance,
  useDeleteMaintenance,
  useListVehicles,
  getListMaintenanceQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const MAINTENANCE_TYPES = [
  "Oil Change", "Tire Rotation", "Brake Inspection", "Air Filter",
  "Spark Plugs", "Battery", "Coolant Flush", "Transmission Service",
  "Belt & Hose", "Wheel Alignment", "Other",
];

export default function MaintenanceScreen() {
  const queryClient = useQueryClient();
  const { data: vehicles } = useListVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("Oil Change");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [nextDueMileage, setNextDueMileage] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const vehicleId = selectedVehicleId ?? vehicles?.[0]?.id;
  const { data: records, isLoading, refetch } = useListMaintenance({ vehicleId });
  const createMaintenance = useCreateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const handleSave = async () => {
    if (!vehicleId) { Alert.alert("No vehicle", "Please add a vehicle first"); return; }
    if (!mileage) { Alert.alert("Missing info", "Mileage is required"); return; }
    setSaving(true);
    try {
      await createMaintenance.mutateAsync({
        data: {
          vehicleId,
          type,
          date,
          mileage: parseInt(mileage),
          cost: cost ? parseFloat(cost) : undefined,
          nextDueDate: nextDueDate || undefined,
          nextDueMileage: nextDueMileage ? parseInt(nextDueMileage) : undefined,
          notes: notes || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListMaintenanceQueryKey() });
      setShowModal(false);
      setMileage(""); setCost(""); setNextDueDate(""); setNextDueMileage(""); setNotes("");
    } catch { Alert.alert("Error", "Failed to save"); }
    finally { setSaving(false); }
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

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={(records ?? []).slice().reverse()}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          scrollEnabled={!!(records && records.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View style={styles.record}>
              <View style={styles.recordIconWrap}>
                <MaterialCommunityIcons name="wrench" size={20} color={Colors.warning} />
              </View>
              <View style={styles.recordContent}>
                <Text style={styles.recordType}>{item.type}</Text>
                <Text style={styles.recordMeta}>{item.date} · {item.mileage.toLocaleString()} km{item.cost ? ` · $${item.cost}` : ""}</Text>
                {item.nextDueDate && <Text style={styles.nextDue}>Next: {item.nextDueDate}</Text>}
                {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}
              </View>
              <Pressable hitSlop={10} onPress={() => {
                Alert.alert("Delete", "Remove this record?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: async () => { await deleteMaintenance.mutateAsync({ id: item.id }); queryClient.invalidateQueries({ queryKey: getListMaintenanceQueryKey() }); } }
                ]);
              }}>
                <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="wrench" size={48} color={Colors.textTertiary} /><Text style={styles.emptyText}>No maintenance records</Text></View>}
        />
      )}

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Maintenance Record</Text>
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {MAINTENANCE_TYPES.map((t) => (
                <Pressable key={t} style={[styles.typeChip, type === t && styles.typeChipActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Date</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textTertiary} value={date} onChangeText={setDate} />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Mileage (km) *</Text>
                <TextInput style={styles.input} placeholder="85000" placeholderTextColor={Colors.textTertiary} value={mileage} onChangeText={setMileage} keyboardType="number-pad" />
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Cost ($)</Text>
                <TextInput style={styles.input} placeholder="45.00" placeholderTextColor={Colors.textTertiary} value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Next Due Date</Text>
                <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textTertiary} value={nextDueDate} onChangeText={setNextDueDate} />
              </View>
            </View>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput style={[styles.input, { marginBottom: 16 }]} placeholder="Notes..." placeholderTextColor={Colors.textTertiary} value={notes} onChangeText={setNotes} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
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
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80 },
  record: { flexDirection: "row", alignItems: "flex-start", backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: Colors.border },
  recordIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.warning + "20", alignItems: "center", justifyContent: "center" },
  recordContent: { flex: 1 },
  recordType: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text, marginBottom: 2 },
  recordMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  nextDue: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.accent, marginTop: 4 },
  recordNotes: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.textSecondary },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text, marginBottom: 16 },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  halfField: { flex: 1 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.card2, borderRadius: 12, padding: 12, color: Colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card2, marginRight: 8 },
  typeChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  typeChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.accent },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: Colors.card2, borderRadius: 12, padding: 14, alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textSecondary },
  saveBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});

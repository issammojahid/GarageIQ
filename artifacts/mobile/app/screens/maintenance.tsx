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
  useUpdateMaintenanceRecord,
  useDeleteMaintenance,
  getListMaintenanceQueryKey,
  type MaintenanceRecord,
} from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMaintenanceReminder,
  scheduleMaintenanceReminder,
  cancelMaintenanceReminder,
} from "@/hooks/useMaintenanceReminders";

const MAINTENANCE_TYPES = [
  "Oil Change", "Tire Rotation", "Brake Inspection", "Air Filter",
  "Spark Plugs", "Battery", "Coolant Flush", "Transmission Service",
  "Belt & Hose", "Wheel Alignment", "Other",
];

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

interface RecordItemProps {
  item: MaintenanceRecord;
  onEdit: (item: MaintenanceRecord) => void;
  onDelete: (item: MaintenanceRecord) => void;
}

function RecordItem({ item, onEdit, onDelete }: RecordItemProps) {
  const { reminder, refresh } = useMaintenanceReminder(item.id);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [reminderDate, setReminderDate] = useState(
    item.nextDueDate ?? todayPlusDays(30)
  );
  const [scheduling, setScheduling] = useState(false);

  const handleSetReminder = () => {
    setReminderDate(item.nextDueDate ?? todayPlusDays(30));
    setReminderModalVisible(true);
  };

  const handleConfirmReminder = async () => {
    if (!reminderDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("Invalid date", "Please enter a date in YYYY-MM-DD format.");
      return;
    }
    const target = new Date(`${reminderDate}T09:00:00`);
    if (isNaN(target.getTime()) || target <= new Date()) {
      Alert.alert("Invalid date", "Please enter a future date.");
      return;
    }
    setScheduling(true);
    const success = await scheduleMaintenanceReminder(item.id, item.type, target);
    setScheduling(false);
    if (success) {
      await refresh();
      setReminderModalVisible(false);
      Alert.alert("Reminder set", `You'll be notified on ${reminderDate} at 9:00 AM.`);
    } else {
      Alert.alert(
        "Permission denied",
        "Notifications are blocked. To receive reminders, enable them in your device Settings → Notifications → GarageIQ. In the meantime, you can set a calendar reminder for this date manually."
      );
    }
  };

  const handleCancelReminder = async () => {
    Alert.alert("Cancel reminder", "Remove this maintenance reminder?", [
      { text: "Keep", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await cancelMaintenanceReminder(item.id);
          await refresh();
        },
      },
    ]);
  };

  const handleMarkDone = async () => {
    Alert.alert(
      "Dismiss reminder",
      `Dismiss the reminder for "${item.type}"?`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Dismiss",
          style: "destructive",
          onPress: async () => {
            await cancelMaintenanceReminder(item.id);
            await refresh();
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={styles.record}>
        <View style={styles.recordIconWrap}>
          <MaterialCommunityIcons name="wrench" size={20} color={Colors.warning} />
        </View>
        <View style={styles.recordContent}>
          <View style={styles.recordTitleRow}>
            <Text style={styles.recordType}>{item.type}</Text>
            {reminder && (
              <View style={styles.bellWrap}>
                <Ionicons name="notifications" size={14} color={Colors.accent} />
                <Text style={styles.bellDate}>{reminder.reminderDate.split("T")[0]}</Text>
              </View>
            )}
          </View>
          <Text style={styles.recordMeta}>
            {item.date} · {item.mileage.toLocaleString()} km{item.cost ? ` · $${item.cost}` : ""}
          </Text>
          {item.nextDueDate && <Text style={styles.nextDue}>Next: {item.nextDueDate}</Text>}
          {item.notes ? <Text style={styles.recordNotes}>{item.notes}</Text> : null}

          <View style={styles.recordActions}>
            <Pressable
              style={[styles.reminderBtn, reminder && styles.reminderBtnActive]}
              onPress={reminder ? handleCancelReminder : handleSetReminder}
            >
              <Ionicons
                name={reminder ? "notifications" : "notifications-outline"}
                size={13}
                color={reminder ? Colors.accent : Colors.textSecondary}
              />
              <Text style={[styles.reminderBtnText, reminder && styles.reminderBtnTextActive]}>
                {reminder ? "Reminder set" : "Set reminder"}
              </Text>
            </Pressable>
            {reminder && (
              <Pressable style={styles.doneBtn} onPress={handleMarkDone}>
                <Ionicons name="checkmark-circle-outline" size={13} color={Colors.success} />
                <Text style={styles.doneBtnText}>Dismiss reminder</Text>
              </Pressable>
            )}
          </View>
        </View>
        <Pressable hitSlop={10} onPress={() => onEdit(item)} style={{ marginRight: 8, paddingTop: 2 }}>
          <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
        </Pressable>
        <Pressable hitSlop={10} onPress={() => onDelete(item)} style={{ paddingTop: 2 }}>
          <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
        </Pressable>
      </View>

      <Modal
        visible={reminderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.reminderModal}>
            <View style={styles.reminderModalHeader}>
              <Ionicons name="notifications" size={22} color={Colors.accent} />
              <Text style={styles.reminderModalTitle}>Set Reminder</Text>
            </View>
            <Text style={styles.reminderModalSub}>
              Reminder for: <Text style={{ color: Colors.text }}>{item.type}</Text>
            </Text>
            <Text style={styles.fieldLabel}>Reminder Date</Text>
            <TextInput
              style={styles.reminderInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textTertiary}
              value={reminderDate}
              onChangeText={setReminderDate}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <Text style={styles.reminderHint}>Notification fires at 9:00 AM on the selected date.</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setReminderModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleConfirmReminder} disabled={scheduling}>
                {scheduling
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Confirm</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function MaintenanceScreen() {
  const queryClient = useQueryClient();
  const { data: vehicles } = useListVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceRecord | null>(null);
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
  const updateMaintenance = useUpdateMaintenanceRecord();
  const deleteMaintenance = useDeleteMaintenance();

  const openAdd = () => {
    setEditingItem(null);
    setType("Oil Change");
    setDate(new Date().toISOString().split("T")[0]);
    setMileage(""); setCost(""); setNextDueDate(""); setNextDueMileage(""); setNotes("");
    setShowModal(true);
  };

  const openEdit = (item: MaintenanceRecord) => {
    setEditingItem(item);
    setType(item.type);
    setDate(item.date);
    setMileage(String(item.mileage));
    setCost(item.cost ? String(item.cost) : "");
    setNextDueDate(item.nextDueDate ?? "");
    setNextDueMileage(item.nextDueMileage ? String(item.nextDueMileage) : "");
    setNotes(item.notes ?? "");
    setShowModal(true);
  };

  const handleDelete = (item: MaintenanceRecord) => {
    Alert.alert("Delete", "Remove this record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelMaintenanceReminder(item.id);
          await deleteMaintenance.mutateAsync({ id: item.id });
          queryClient.invalidateQueries({ queryKey: getListMaintenanceQueryKey() });
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!vehicleId) { Alert.alert("No vehicle", "Please add a vehicle first"); return; }
    if (!mileage) { Alert.alert("Missing info", "Mileage is required"); return; }
    setSaving(true);
    try {
      if (editingItem) {
        await updateMaintenance.mutateAsync({
          id: editingItem.id,
          data: {
            type,
            date,
            mileage: parseInt(mileage),
            cost: cost ? parseFloat(cost) : undefined,
            nextDueDate: nextDueDate || undefined,
            nextDueMileage: nextDueMileage ? parseInt(nextDueMileage) : undefined,
            notes: notes || undefined,
          },
        });
      } else {
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
      }
      queryClient.invalidateQueries({ queryKey: getListMaintenanceQueryKey() });
      setShowModal(false);
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
            <RecordItem item={item} onEdit={openEdit} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="wrench" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No maintenance records</Text>
            </View>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingItem ? "Edit Record" : "Add Maintenance Record"}</Text>
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
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>{editingItem ? "Update" : "Save"}</Text>}
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
  recordTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 },
  recordType: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  bellWrap: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: Colors.accent + "15", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  bellDate: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.accent },
  recordMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  nextDue: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.accent, marginTop: 4 },
  recordNotes: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, marginTop: 4 },
  recordActions: { flexDirection: "row", marginTop: 8 },
  reminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card2,
  },
  reminderBtnActive: { borderColor: Colors.accent + "60", backgroundColor: Colors.accent + "10" },
  reminderBtnText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  reminderBtnTextActive: { color: Colors.accent },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success + "50",
    backgroundColor: Colors.success + "10",
    marginLeft: 8,
  },
  doneBtnText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.success },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.textSecondary },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text, marginBottom: 16 },
  reminderModal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  reminderModalHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  reminderModalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text },
  reminderModalSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  reminderInput: {
    backgroundColor: Colors.card2,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    letterSpacing: 1,
  },
  reminderHint: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, marginBottom: 20 },
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

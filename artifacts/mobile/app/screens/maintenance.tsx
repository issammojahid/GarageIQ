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
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
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
  const { colors } = useTheme();
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

  const s = makeStyles(colors);

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
      <View style={s.record}>
        <View style={s.recordIconWrap}>
          <MaterialCommunityIcons name="wrench" size={20} color={colors.warning} />
        </View>
        <View style={s.recordContent}>
          <View style={s.recordTitleRow}>
            <Text style={s.recordType}>{item.type}</Text>
            {reminder && (
              <View style={s.bellWrap}>
                <Ionicons name="notifications" size={14} color={colors.accent} />
                <Text style={s.bellDate}>{reminder.reminderDate.split("T")[0]}</Text>
              </View>
            )}
          </View>
          <Text style={s.recordMeta}>
            {item.date} · {item.mileage.toLocaleString()} km{item.cost ? ` · $${item.cost}` : ""}
          </Text>
          {item.nextDueDate && <Text style={s.nextDue}>Next: {item.nextDueDate}</Text>}
          {item.notes ? <Text style={s.recordNotes}>{item.notes}</Text> : null}

          <View style={s.recordActions}>
            <Pressable
              style={[s.reminderBtn, reminder && s.reminderBtnActive]}
              onPress={reminder ? handleCancelReminder : handleSetReminder}
            >
              <Ionicons
                name={reminder ? "notifications" : "notifications-outline"}
                size={13}
                color={reminder ? colors.accent : colors.textSecondary}
              />
              <Text style={[s.reminderBtnText, reminder && s.reminderBtnTextActive]}>
                {reminder ? "Reminder set" : "Set reminder"}
              </Text>
            </Pressable>
            {reminder && (
              <Pressable style={s.doneBtn} onPress={handleMarkDone}>
                <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
                <Text style={s.doneBtnText}>Dismiss reminder</Text>
              </Pressable>
            )}
          </View>
        </View>
        <Pressable hitSlop={10} onPress={() => onEdit(item)} style={{ marginRight: 8, paddingTop: 2 }}>
          <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
        </Pressable>
        <Pressable hitSlop={10} onPress={() => onDelete(item)} style={{ paddingTop: 2 }}>
          <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>

      <Modal
        visible={reminderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.reminderModal}>
            <View style={s.reminderModalHeader}>
              <Ionicons name="notifications" size={22} color={colors.accent} />
              <Text style={s.reminderModalTitle}>Set Reminder</Text>
            </View>
            <Text style={s.reminderModalSub}>
              Reminder for: <Text style={{ color: colors.text }}>{item.type}</Text>
            </Text>
            <Text style={s.fieldLabel}>Reminder Date</Text>
            <TextInput
              style={s.reminderInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
              value={reminderDate}
              onChangeText={setReminderDate}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <Text style={s.reminderHint}>Notification fires at 9:00 AM on the selected date.</Text>
            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={() => setReminderModalVisible(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={handleConfirmReminder} disabled={scheduling}>
                {scheduling
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.saveBtnText}>Confirm</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default function MaintenanceScreen() {
  const { colors } = useTheme();
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

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={(records ?? []).slice().reverse()}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          scrollEnabled={!!(records && records.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <RecordItem item={item} onEdit={openEdit} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialCommunityIcons name="wrench" size={48} color={colors.textTertiary} />
              <Text style={s.emptyText}>No maintenance records</Text>
            </View>
          }
        />
      )}

      <Pressable style={s.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editingItem ? "Edit Record" : "Add Maintenance Record"}</Text>
            <Text style={s.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {MAINTENANCE_TYPES.map((t) => (
                <Pressable key={t} style={[s.typeChip, type === t && s.typeChipActive]} onPress={() => setType(t)}>
                  <Text style={[s.typeChipText, type === t && s.typeChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={s.row}>
              <View style={s.halfField}>
                <Text style={s.fieldLabel}>Date</Text>
                <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={date} onChangeText={setDate} />
              </View>
              <View style={s.halfField}>
                <Text style={s.fieldLabel}>Mileage (km) *</Text>
                <TextInput style={s.input} placeholder="85000" placeholderTextColor={colors.textTertiary} value={mileage} onChangeText={setMileage} keyboardType="number-pad" />
              </View>
            </View>
            <View style={s.row}>
              <View style={s.halfField}>
                <Text style={s.fieldLabel}>Cost ($)</Text>
                <TextInput style={s.input} placeholder="45.00" placeholderTextColor={colors.textTertiary} value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
              </View>
              <View style={s.halfField}>
                <Text style={s.fieldLabel}>Next Due Date</Text>
                <TextInput style={s.input} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={nextDueDate} onChangeText={setNextDueDate} />
              </View>
            </View>
            <Text style={s.fieldLabel}>Notes</Text>
            <TextInput style={[s.input, { marginBottom: 16 }]} placeholder="Notes..." placeholderTextColor={colors.textTertiary} value={notes} onChangeText={setNotes} />
            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={() => setShowModal(false)}><Text style={s.cancelBtnText}>Cancel</Text></Pressable>
              <Pressable style={s.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>{editingItem ? "Update" : "Save"}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80 },
    record: { flexDirection: "row", alignItems: "flex-start", backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: colors.border },
    recordIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.warning + "20", alignItems: "center", justifyContent: "center" },
    recordContent: { flex: 1 },
    recordTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 },
    recordType: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
    bellWrap: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: colors.accent + "15", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
    bellDate: { fontFamily: "Inter_500Medium", fontSize: 11, color: colors.accent },
    recordMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    nextDue: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.accent, marginTop: 4 },
    recordNotes: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, marginTop: 4 },
    recordActions: { flexDirection: "row", marginTop: 8 },
    reminderBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card2,
    },
    reminderBtnActive: { borderColor: colors.accent + "60", backgroundColor: colors.accent + "10" },
    reminderBtnText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary },
    reminderBtnTextActive: { color: colors.accent },
    doneBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.success + "50",
      backgroundColor: colors.success + "10",
      marginLeft: 8,
    },
    doneBtnText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.success },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: colors.textSecondary },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text, marginBottom: 16 },
    reminderModal: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    reminderModalHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
    reminderModalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text },
    reminderModalSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
    reminderInput: {
      backgroundColor: colors.card2,
      borderRadius: 12,
      padding: 14,
      color: colors.text,
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
      letterSpacing: 1,
    },
    reminderHint: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, marginBottom: 20 },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    halfField: { flex: 1 },
    fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text, marginBottom: 6 },
    input: { backgroundColor: colors.card2, borderRadius: 12, padding: 12, color: colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: colors.border },
    typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card2, marginRight: 8 },
    typeChipActive: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    typeChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    typeChipTextActive: { color: colors.accent },
    modalActions: { flexDirection: "row", gap: 12 },
    cancelBtn: { flex: 1, backgroundColor: colors.card2, borderRadius: 12, padding: 14, alignItems: "center" },
    cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.textSecondary },
    saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  });
}

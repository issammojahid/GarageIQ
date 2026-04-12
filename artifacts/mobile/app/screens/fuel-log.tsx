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
  useListFuelLogs,
  useCreateFuelLog,
  useUpdateFuelLog,
  useDeleteFuelLog,
  getListFuelLogsQueryKey,
  type FuelLog,
} from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";

export default function FuelLogScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: vehicles } = useListVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FuelLog | null>(null);
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
  const updateFuelLog = useUpdateFuelLog();
  const deleteFuelLog = useDeleteFuelLog();

  const totalCost = liters && pricePerLiter
    ? (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2)
    : "0.00";

  const openAdd = () => {
    setEditingItem(null);
    setLiters(""); setPricePerLiter(""); setOdometer("");
    setFuelType("gasoline"); setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowModal(true);
  };

  const openEdit = (item: FuelLog) => {
    setEditingItem(item);
    setLiters(String(item.liters));
    setPricePerLiter(String(item.pricePerLiter));
    setOdometer(String(item.odometer));
    setFuelType(item.fuelType ?? "gasoline");
    setDate(item.date);
    setNotes(item.notes ?? "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!vehicleId) { Alert.alert("No vehicle", "Please add a vehicle first"); return; }
    if (!liters || !pricePerLiter || !odometer) { Alert.alert("Missing info", "Please fill all required fields"); return; }
    setSaving(true);
    try {
      if (editingItem) {
        await updateFuelLog.mutateAsync({
          id: editingItem.id,
          data: {
            liters: parseFloat(liters),
            pricePerLiter: parseFloat(pricePerLiter),
            totalCost: parseFloat(totalCost),
            odometer: parseInt(odometer),
            fuelType,
            date,
            notes: notes || undefined,
          },
        });
      } else {
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
      }
      queryClient.invalidateQueries({ queryKey: getListFuelLogsQueryKey() });
      setShowModal(false);
    } catch { Alert.alert("Error", "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Remove this fuel log?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await deleteFuelLog.mutateAsync({ id });
          queryClient.invalidateQueries({ queryKey: getListFuelLogsQueryKey() });
        }
      }
    ]);
  };

  const logs = fuelLogs ?? [];
  const totalSpent = logs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.vehicleBar}>
        {(vehicles ?? []).map((v) => (
          <Pressable
            key={v.id}
            style={[s.vehicleChip, vehicleId === v.id && s.vehicleChipActive]}
            onPress={() => setSelectedVehicleId(v.id)}
          >
            <Text style={[s.vehicleChipText, vehicleId === v.id && s.vehicleChipTextActive]}>
              {v.year} {v.make}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={s.statsRow}>
        <View style={s.stat}>
          <Text style={s.statValue}>${totalSpent.toFixed(0)}</Text>
          <Text style={s.statLabel}>Total Spent</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{totalLiters.toFixed(0)}L</Text>
          <Text style={s.statLabel}>Total Liters</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statValue}>{logs.length}</Text>
          <Text style={s.statLabel}>Fill-ups</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={logs.slice().reverse()}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          scrollEnabled={!!logs.length}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => (
            <View style={s.logCard}>
              <View style={s.logLeft}>
                <MaterialCommunityIcons name="gas-station" size={22} color={colors.success} />
                <View>
                  <Text style={s.logDate}>{item.date}</Text>
                  <Text style={s.logOdo}>{item.odometer.toLocaleString()} km</Text>
                </View>
              </View>
              <View style={s.logRight}>
                <Text style={s.logCost}>${item.totalCost.toFixed(2)}</Text>
                <Text style={s.logLiters}>{item.liters.toFixed(1)}L</Text>
              </View>
              <Pressable hitSlop={10} onPress={() => openEdit(item)} style={{ marginRight: 8 }}>
                <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable hitSlop={10} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialCommunityIcons name="gas-station-outline" size={48} color={colors.textTertiary} />
              <Text style={s.emptyText}>No fuel logs yet</Text>
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
            <Text style={s.modalTitle}>{editingItem ? "Edit Fuel Log" : "Add Fuel Log"}</Text>
            <View style={s.row}>
              <View style={s.halfField}>
                <Text style={s.fieldLabel}>Liters *</Text>
                <TextInput style={s.input} placeholder="45.5" placeholderTextColor={colors.textTertiary} value={liters} onChangeText={setLiters} keyboardType="decimal-pad" />
              </View>
              <View style={s.halfField}>
                <Text style={s.fieldLabel}>Price/L *</Text>
                <TextInput style={s.input} placeholder="1.85" placeholderTextColor={colors.textTertiary} value={pricePerLiter} onChangeText={setPricePerLiter} keyboardType="decimal-pad" />
              </View>
            </View>
            <View style={s.totalRow}>
              <Text style={s.fieldLabel}>Total Cost</Text>
              <Text style={s.totalCost}>${totalCost}</Text>
            </View>
            <Text style={s.fieldLabel}>Odometer (km) *</Text>
            <TextInput style={[s.input, { marginBottom: 12 }]} placeholder="85000" placeholderTextColor={colors.textTertiary} value={odometer} onChangeText={setOdometer} keyboardType="number-pad" />
            <Text style={s.fieldLabel}>Date</Text>
            <TextInput style={[s.input, { marginBottom: 12 }]} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={date} onChangeText={setDate} />
            <View style={s.modalActions}>
              <Pressable style={s.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
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
    statsRow: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    stat: { flex: 1, alignItems: "center" },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 80 },
    logCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: colors.border },
    logLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    logDate: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text },
    logOdo: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    logRight: { alignItems: "flex-end", marginRight: 8 },
    logCost: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.success },
    logLiters: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: colors.textSecondary },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text, marginBottom: 20 },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    halfField: { flex: 1 },
    fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text, marginBottom: 6 },
    input: { backgroundColor: colors.card2, borderRadius: 12, padding: 12, color: colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: colors.border },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    totalCost: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.success },
    modalActions: { flexDirection: "row", gap: 12, marginTop: 12 },
    cancelBtn: { flex: 1, backgroundColor: colors.card2, borderRadius: 12, padding: 14, alignItems: "center" },
    cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.textSecondary },
    saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  });
}

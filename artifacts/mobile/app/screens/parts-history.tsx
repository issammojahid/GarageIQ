import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable, Modal,
  TextInput, Alert, ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { useI18n } from "@/i18n/TranslationContext";
import { useListVehicles } from "@/hooks/useLocalVehicles";

const STORAGE_KEY = "parts-history";

type PartRecord = {
  id: string;
  partName: string;
  vehicleId: string;
  date: string;
  cost: string;
  mileage: string;
  notes: string;
};

export default function PartsHistoryScreen() {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  const { data: vehicles } = useListVehicles();
  const [parts, setParts] = useState<PartRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<PartRecord, "id">>({
    partName: "", vehicleId: "", date: "", cost: "", mileage: "", notes: "",
  });

  const loadParts = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setParts(JSON.parse(raw));
  }, []);

  useEffect(() => { loadParts(); }, [loadParts]);

  const saveParts = async (next: PartRecord[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setParts(next);
  };

  const resetForm = () => {
    setForm({ partName: "", vehicleId: vehicles?.[0]?.id ?? "", date: new Date().toISOString().split("T")[0], cost: "", mileage: "", notes: "" });
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (item: PartRecord) => {
    setForm({ partName: item.partName, vehicleId: item.vehicleId, date: item.date, cost: item.cost, mileage: item.mileage, notes: item.notes });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.partName.trim()) {
      Alert.alert("Required", "Part name is required.");
      return;
    }
    if (editingId) {
      const next = parts.map((p) => p.id === editingId ? { ...form, id: editingId } : p);
      await saveParts(next);
    } else {
      const record: PartRecord = { ...form, id: Date.now().toString() };
      await saveParts([record, ...parts]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Part", "Remove this part record?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await saveParts(parts.filter((p) => p.id !== id)); } },
    ]);
  };

  const getVehicleLabel = (id: string) => {
    const v = vehicles?.find((v) => v.id === id);
    return v ? `${v.year} ${v.make} ${v.model}` : "—";
  };

  const s = makeStyles(colors);

  const renderItem = ({ item }: { item: PartRecord }) => (
    <View style={[s.card, isRTL && s.rowReverse]}>
      <View style={[s.cardIcon, { backgroundColor: colors.accent + "20" }]}>
        <MaterialCommunityIcons name="cog" size={24} color={colors.accent} />
      </View>
      <View style={[s.cardContent, isRTL && s.textRight]}>
        <Text style={[s.partName, isRTL && s.textRight]}>{item.partName}</Text>
        {item.vehicleId ? (
          <Text style={[s.vehicleLabel, isRTL && s.textRight]}>{getVehicleLabel(item.vehicleId)}</Text>
        ) : null}
        <View style={[s.metaRow, isRTL && s.rowReverse]}>
          {item.date ? <Text style={s.meta}>{item.date}</Text> : null}
          {item.mileage ? <Text style={s.meta}>{item.mileage} km</Text> : null}
          {item.cost ? <Text style={[s.cost]}>${item.cost}</Text> : null}
        </View>
        {item.notes ? <Text style={[s.notes, isRTL && s.textRight]} numberOfLines={2}>{item.notes}</Text> : null}
      </View>
      <View style={s.actions}>
        <Pressable onPress={() => openEdit(item)} hitSlop={8}>
          <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => handleDelete(item.id)} hitSlop={8} style={{ marginTop: 12 }}>
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      {parts.length === 0 ? (
        <View style={s.empty}>
          <MaterialCommunityIcons name="cog-outline" size={56} color={colors.textTertiary} />
          <Text style={s.emptyTitle}>No parts recorded yet</Text>
          <Text style={s.emptyDesc}>Track every part you've replaced on your vehicles.</Text>
        </View>
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}

      <Pressable style={s.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable style={s.overlay} onPress={() => setShowModal(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>
              {editingId ? "Edit Part Record" : "Add Replaced Part"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <FormField label="Part Name *" value={form.partName} onChangeText={(v) => setForm((f) => ({ ...f, partName: v }))} placeholder="e.g. Brake pads" colors={colors} isRTL={isRTL} />
              <FormField label="Date" value={form.date} onChangeText={(v) => setForm((f) => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" colors={colors} isRTL={isRTL} />
              <FormField label="Cost ($)" value={form.cost} onChangeText={(v) => setForm((f) => ({ ...f, cost: v }))} placeholder="0.00" keyboardType="decimal-pad" colors={colors} isRTL={isRTL} />
              <FormField label="Mileage (km)" value={form.mileage} onChangeText={(v) => setForm((f) => ({ ...f, mileage: v }))} placeholder="e.g. 45000" keyboardType="numeric" colors={colors} isRTL={isRTL} />

              {vehicles && vehicles.length > 0 && (
                <View style={s.fieldWrap}>
                  <Text style={[s.label, isRTL && s.textRight]}>Vehicle</Text>
                  <View style={[s.vehiclePicker, isRTL && s.rowReverse]}>
                    {vehicles.map((v) => (
                      <Pressable
                        key={v.id}
                        style={[s.vehicleChip, form.vehicleId === v.id && s.vehicleChipSelected]}
                        onPress={() => setForm((f) => ({ ...f, vehicleId: v.id }))}
                      >
                        <Text style={[s.vehicleChipText, form.vehicleId === v.id && s.vehicleChipTextSelected]}>
                          {v.year} {v.make}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <FormField label="Notes" value={form.notes} onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))} placeholder="Optional notes..." multiline colors={colors} isRTL={isRTL} />

              <View style={[s.btnRow, isRTL && s.rowReverse]}>
                <Pressable style={s.cancelBtn} onPress={() => { setShowModal(false); resetForm(); }}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable style={s.saveBtn} onPress={handleSave}>
                  <Text style={s.saveBtnText}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  multiline?: boolean;
  colors: AppColors;
  isRTL: boolean;
};

function FormField({ label, value, onChangeText, placeholder, keyboardType = "default", multiline, colors, isRTL }: FormFieldProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary, marginBottom: 6, textAlign: isRTL ? "right" : "left" }}>{label}</Text>
      <TextInput
        style={{
          backgroundColor: colors.card2,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 10,
          padding: 12,
          fontFamily: "Inter_400Regular",
          fontSize: 15,
          color: colors.text,
          textAlign: isRTL ? "right" : "left",
          minHeight: multiline ? 80 : undefined,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 10 },
    emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: colors.text },
    emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
    card: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 12 },
    cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    cardContent: { flex: 1 },
    partName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
    vehicleLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    metaRow: { flexDirection: "row", gap: 10, marginTop: 6, flexWrap: "wrap" },
    meta: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary },
    cost: { fontFamily: "Inter_600SemiBold", fontSize: 12, color: colors.accent },
    notes: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, marginTop: 4, lineHeight: 16 },
    actions: { alignItems: "center", justifyContent: "flex-start", paddingTop: 2 },
    fab: { position: "absolute", bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, maxHeight: "92%" },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, marginBottom: 20 },
    fieldWrap: { marginBottom: 14 },
    label: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
    vehiclePicker: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    vehicleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border },
    vehicleChipSelected: { backgroundColor: colors.accent + "20", borderColor: colors.accent },
    vehicleChipText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    vehicleChipTextSelected: { color: colors.accent, fontFamily: "Inter_500Medium" },
    btnRow: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 20 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
    cancelBtnText: { fontFamily: "Inter_500Medium", fontSize: 15, color: colors.textSecondary },
    saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFF" },
  });
}

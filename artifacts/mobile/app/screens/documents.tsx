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
import { useListDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, getListDocumentsQueryKey, type Document } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import type { MaterialCommunityIconsName } from "@/types/icons";

const DOC_TYPES: Array<{ id: string; label: string; icon: MaterialCommunityIconsName; color: string }> = [
  { id: "insurance", label: "Insurance", icon: "shield-check", color: "#3B82F6" },
  { id: "registration", label: "Registration", icon: "card-account-details", color: "#10B981" },
  { id: "inspection", label: "Inspection", icon: "clipboard-check", color: "#F59E0B" },
  { id: "warranty", label: "Warranty", icon: "certificate", color: "#7C3AED" },
  { id: "service", label: "Service Report", icon: "file-document", color: "#EF4444" },
  { id: "other", label: "Other", icon: "file", color: "#6B7280" },
];

const getDocType = (id: string) => DOC_TYPES.find((t) => t.id === id) || DOC_TYPES[DOC_TYPES.length - 1];

export default function DocumentsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: vehicles } = useListVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [type, setType] = useState("insurance");
  const [title, setTitle] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const vehicleId = selectedVehicleId ?? vehicles?.[0]?.id;
  const { data: docs, isLoading, refetch } = useListDocuments({ vehicleId });
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  const openAdd = () => {
    setEditingItem(null);
    setType("insurance"); setTitle(""); setExpiryDate(""); setNotes("");
    setShowModal(true);
  };

  const openEdit = (item: Document) => {
    setEditingItem(item);
    setType(item.type);
    setTitle(item.title);
    setExpiryDate(item.expiryDate ?? "");
    setNotes(item.notes ?? "");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!vehicleId) { Alert.alert("No vehicle", "Add a vehicle first"); return; }
    if (!title.trim()) { Alert.alert("Required", "Title is required"); return; }
    setSaving(true);
    try {
      if (editingItem) {
        await updateDocument.mutateAsync({
          id: editingItem.id,
          data: { type, title: title.trim(), expiryDate: expiryDate || undefined, notes: notes || undefined },
        });
      } else {
        await createDocument.mutateAsync({
          data: { vehicleId, type, title: title.trim(), expiryDate: expiryDate || undefined, notes: notes || undefined },
        });
      }
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
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

      {isLoading ? <ActivityIndicator color={colors.accent} style={{ flex: 1 }} /> : (
        <FlatList
          data={docs ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.list}
          scrollEnabled={!!(docs && docs.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => {
            const docType = getDocType(item.type);
            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
            return (
              <View style={s.docCard}>
                <View style={[s.docIcon, { backgroundColor: docType.color + "20" }]}>
                  <MaterialCommunityIcons name={docType.icon} size={24} color={docType.color} />
                </View>
                <View style={s.docInfo}>
                  <Text style={s.docTitle}>{item.title}</Text>
                  <Text style={s.docType}>{docType.label}</Text>
                  {item.expiryDate && (
                    <Text style={[s.docExpiry, isExpired && s.docExpired]}>
                      {isExpired ? "Expired: " : "Expires: "}{item.expiryDate}
                    </Text>
                  )}
                </View>
                <Pressable hitSlop={10} onPress={() => openEdit(item)} style={{ marginRight: 8 }}>
                  <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                </Pressable>
                <Pressable hitSlop={10} onPress={() => {
                  Alert.alert("Delete", "Remove this document?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: async () => { await deleteDocument.mutateAsync({ id: item.id }); queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); } }
                  ]);
                }}>
                  <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<View style={s.empty}><MaterialCommunityIcons name="file-document-outline" size={48} color={colors.textTertiary} /><Text style={s.emptyText}>No documents stored</Text></View>}
        />
      )}

      <Pressable style={s.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>{editingItem ? "Edit Document" : "Add Document"}</Text>
            <Text style={s.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {DOC_TYPES.map((t) => (
                <Pressable key={t.id} style={[s.typeChip, type === t.id && s.typeChipActive]} onPress={() => setType(t.id)}>
                  <MaterialCommunityIcons name={t.icon} size={16} color={type === t.id ? colors.accent : colors.textSecondary} />
                  <Text style={[s.typeChipText, type === t.id && s.typeChipTextActive]}>{t.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={s.fieldLabel}>Title *</Text>
            <TextInput style={[s.input, { marginBottom: 12 }]} placeholder="e.g. Car Insurance 2026" placeholderTextColor={colors.textTertiary} value={title} onChangeText={setTitle} />
            <Text style={s.fieldLabel}>Expiry Date</Text>
            <TextInput style={[s.input, { marginBottom: 12 }]} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={expiryDate} onChangeText={setExpiryDate} />
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
    docCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: colors.border },
    docIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    docInfo: { flex: 1 },
    docTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
    docType: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
    docExpiry: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.warning, marginTop: 4 },
    docExpired: { color: colors.danger },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: colors.textSecondary },
    fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", elevation: 8 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
    modalContent: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text, marginBottom: 16 },
    fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text, marginBottom: 6 },
    input: { backgroundColor: colors.card2, borderRadius: 12, padding: 12, color: colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: colors.border },
    typeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card2, marginRight: 8 },
    typeChipActive: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    typeChipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary },
    typeChipTextActive: { color: colors.accent },
    modalActions: { flexDirection: "row", gap: 12 },
    cancelBtn: { flex: 1, backgroundColor: colors.card2, borderRadius: 12, padding: 14, alignItems: "center" },
    cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.textSecondary },
    saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  });
}

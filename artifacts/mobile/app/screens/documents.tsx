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
import { useListDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument, useListVehicles, getListDocumentsQueryKey, type Document } from "@workspace/api-client-react";
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

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleBar}>
        {(vehicles ?? []).map((v) => (
          <Pressable key={v.id} style={[styles.vehicleChip, vehicleId === v.id && styles.vehicleChipActive]} onPress={() => setSelectedVehicleId(v.id)}>
            <Text style={[styles.vehicleChipText, vehicleId === v.id && styles.vehicleChipTextActive]}>{v.year} {v.make}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} /> : (
        <FlatList
          data={docs ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          scrollEnabled={!!(docs && docs.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }) => {
            const docType = getDocType(item.type);
            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
            return (
              <View style={styles.docCard}>
                <View style={[styles.docIcon, { backgroundColor: docType.color + "20" }]}>
                  <MaterialCommunityIcons name={docType.icon} size={24} color={docType.color} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{item.title}</Text>
                  <Text style={styles.docType}>{docType.label}</Text>
                  {item.expiryDate && (
                    <Text style={[styles.docExpiry, isExpired && styles.docExpired]}>
                      {isExpired ? "Expired: " : "Expires: "}{item.expiryDate}
                    </Text>
                  )}
                </View>
                <Pressable hitSlop={10} onPress={() => openEdit(item)} style={{ marginRight: 8 }}>
                  <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
                </Pressable>
                <Pressable hitSlop={10} onPress={() => {
                  Alert.alert("Delete", "Remove this document?", [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: async () => { await deleteDocument.mutateAsync({ id: item.id }); queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }); } }
                  ]);
                }}>
                  <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="file-document-outline" size={48} color={Colors.textTertiary} /><Text style={styles.emptyText}>No documents stored</Text></View>}
        />
      )}

      <Pressable style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingItem ? "Edit Document" : "Add Document"}</Text>
            <Text style={styles.fieldLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {DOC_TYPES.map((t) => (
                <Pressable key={t.id} style={[styles.typeChip, type === t.id && styles.typeChipActive]} onPress={() => setType(t.id)}>
                  <MaterialCommunityIcons name={t.icon} size={16} color={type === t.id ? Colors.accent : Colors.textSecondary} />
                  <Text style={[styles.typeChipText, type === t.id && styles.typeChipTextActive]}>{t.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="e.g. Car Insurance 2026" placeholderTextColor={Colors.textTertiary} value={title} onChangeText={setTitle} />
            <Text style={styles.fieldLabel}>Expiry Date</Text>
            <TextInput style={[styles.input, { marginBottom: 12 }]} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textTertiary} value={expiryDate} onChangeText={setExpiryDate} />
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
  docCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: Colors.border },
  docIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  docInfo: { flex: 1 },
  docTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text },
  docType: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  docExpiry: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.warning, marginTop: 4 },
  docExpired: { color: Colors.danger },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.textSecondary },
  fab: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.accent, alignItems: "center", justifyContent: "center", elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.text, marginBottom: 16 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.card2, borderRadius: 12, padding: 12, color: Colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  typeChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card2, marginRight: 8 },
  typeChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  typeChipText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  typeChipTextActive: { color: Colors.accent },
  modalActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: Colors.card2, borderRadius: 12, padding: 14, alignItems: "center" },
  cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.textSecondary },
  saveBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 12, padding: 14, alignItems: "center" },
  saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});

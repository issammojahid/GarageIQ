import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { useI18n } from "@/i18n/TranslationContext";
import type { MaterialCommunityIconsName } from "@/types/icons";

type LineItem = {
  id: string;
  label: string;
  amount: string;
  type: "part" | "labor" | "other";
};

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "Pound" },
  { code: "MAD", symbol: "د.م.", label: "Dirham" },
  { code: "AED", symbol: "د.إ", label: "Dirham UAE" },
  { code: "SAR", symbol: "ر.س", label: "Saudi Riyal" },
  { code: "TRY", symbol: "₺", label: "Turkish Lira" },
];

const ITEM_TYPES: Array<{ key: LineItem["type"]; label: string; icon: MaterialCommunityIconsName; color: string }> = [
  { key: "part", label: "Part", icon: "cog-outline", color: "#E85D04" },
  { key: "labor", label: "Labor", icon: "wrench-outline", color: "#3B82F6" },
  { key: "other", label: "Other", icon: "plus-circle-outline", color: "#22C55E" },
];

export default function CostCalculatorScreen() {
  const { colors } = useTheme();
  const { isRTL } = useI18n();
  const [items, setItems] = useState<LineItem[]>([]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<LineItem["type"]>("part");
  const [taxRate, setTaxRate] = useState("0");

  const resetModal = () => { setNewLabel(""); setNewAmount(""); setNewType("part"); setEditId(null); };

  const openAdd = () => { resetModal(); setShowAddModal(true); };

  const openEdit = (item: LineItem) => {
    setNewLabel(item.label); setNewAmount(item.amount); setNewType(item.type); setEditId(item.id);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!newLabel.trim()) { Alert.alert("Required", "Label is required."); return; }
    if (editId) {
      setItems((prev) => prev.map((i) => i.id === editId ? { ...i, label: newLabel, amount: newAmount, type: newType } : i));
    } else {
      setItems((prev) => [...prev, { id: Date.now().toString(), label: newLabel, amount: newAmount, type: newType }]);
    }
    setShowAddModal(false);
    resetModal();
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove", "Remove this line item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setItems((prev) => prev.filter((i) => i.id !== id)) },
    ]);
  };

  const subtotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const taxAmount = subtotal * (parseFloat(taxRate) || 0) / 100;
  const total = subtotal + taxAmount;

  const byType = (type: LineItem["type"]) => items.filter((i) => i.type === type);

  const fmt = (n: number) => `${currency.symbol}${n.toFixed(2)}`;

  const s = makeStyles(colors);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Currency Row */}
        <View style={[s.row, isRTL && s.rowReverse]}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>Currency</Text>
          <Pressable style={s.currencyBtn} onPress={() => setShowCurrencyModal(true)}>
            <Text style={s.currencyBtnText}>{currency.code} {currency.symbol}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.accent} />
          </Pressable>
        </View>

        {/* Line Items grouped by type */}
        {ITEM_TYPES.map(({ key, label, icon, color }) => {
          const typeItems = byType(key);
          if (typeItems.length === 0) return null;
          return (
            <View key={key} style={s.section}>
              <View style={[s.typeHeader, isRTL && s.rowReverse]}>
                <MaterialCommunityIcons name={icon} size={15} color={color} />
                <Text style={[s.typeLabel, { color }]}>{label}</Text>
              </View>
              {typeItems.map((item) => (
                <View key={item.id} style={[s.lineItem, isRTL && s.rowReverse]}>
                  <Text style={[s.lineLabel, isRTL && s.textRight]} numberOfLines={1}>{item.label}</Text>
                  <View style={[s.lineRight, isRTL && s.rowReverse]}>
                    <Text style={s.lineAmount}>{item.amount ? fmt(parseFloat(item.amount) || 0) : "—"}</Text>
                    <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                      <Ionicons name="pencil-outline" size={16} color={colors.textTertiary} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {items.length === 0 && (
          <View style={s.empty}>
            <MaterialCommunityIcons name="calculator-variant-outline" size={52} color={colors.textTertiary} />
            <Text style={s.emptyTitle}>No items yet</Text>
            <Text style={s.emptyDesc}>Add parts, labor, and other costs to calculate your repair estimate.</Text>
          </View>
        )}

        {/* Tax Rate */}
        <View style={s.taxSection}>
          <View style={[s.row, isRTL && s.rowReverse]}>
            <Text style={[s.sectionTitle, isRTL && s.textRight]}>Tax Rate (%)</Text>
            <TextInput
              style={s.taxInput}
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Summary Card */}
        <View style={s.summaryCard}>
          <Text style={[s.summaryTitle, isRTL && s.textRight]}>Estimate Summary</Text>
          <SummaryRow label="Subtotal" value={fmt(subtotal)} colors={colors} isRTL={isRTL} />
          {parseFloat(taxRate) > 0 && (
            <SummaryRow label={`Tax (${taxRate}%)`} value={fmt(taxAmount)} colors={colors} isRTL={isRTL} />
          )}
          <View style={s.divider} />
          <View style={[s.totalRow, isRTL && s.rowReverse]}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{fmt(total)}</Text>
          </View>

          {/* Type breakdown */}
          <View style={s.breakdown}>
            {ITEM_TYPES.map(({ key, label, color }) => {
              const t = byType(key).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
              if (t === 0) return null;
              return (
                <View key={key} style={[s.breakdownRow, isRTL && s.rowReverse]}>
                  <View style={[s.dot, { backgroundColor: color }]} />
                  <Text style={s.breakdownLabel}>{label}</Text>
                  <Text style={s.breakdownValue}>{fmt(t)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Add button */}
      <Pressable style={s.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <Pressable style={s.overlay} onPress={() => setShowCurrencyModal(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>Select Currency</Text>
            {CURRENCIES.map((c) => (
              <Pressable
                key={c.code}
                style={[s.currencyRow, isRTL && s.rowReverse, c.code === currency.code && s.currencyRowSelected]}
                onPress={() => { setCurrency(c); setShowCurrencyModal(false); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.currencyCode, isRTL && s.textRight, c.code === currency.code && { color: colors.accent }]}>{c.code}</Text>
                  <Text style={[s.currencyLabel, isRTL && s.textRight]}>{c.label}</Text>
                </View>
                <Text style={s.currencySymbol}>{c.symbol}</Text>
                {c.code === currency.code && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add/Edit Item Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => { setShowAddModal(false); resetModal(); }}>
        <Pressable style={s.overlay} onPress={() => { setShowAddModal(false); resetModal(); }}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>{editId ? "Edit Item" : "Add Line Item"}</Text>

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>Type</Text>
            <View style={[s.typeRow, isRTL && s.rowReverse]}>
              {ITEM_TYPES.map(({ key, label, color }) => (
                <Pressable
                  key={key}
                  style={[s.typeChip, newType === key && { backgroundColor: color + "20", borderColor: color }]}
                  onPress={() => setNewType(key)}
                >
                  <Text style={[s.typeChipText, newType === key && { color }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>Description *</Text>
            <TextInput
              style={[s.input, isRTL && s.textRight]}
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="e.g. Brake pads"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>Amount ({currency.symbol})</Text>
            <TextInput
              style={[s.input, isRTL && s.textRight]}
              value={newAmount}
              onChangeText={setNewAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
            />

            <View style={[s.btnRow, isRTL && s.rowReverse]}>
              <Pressable style={s.cancelBtn} onPress={() => { setShowAddModal(false); resetModal(); }}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveBtnText}>{editId ? "Update" : "Add"}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SummaryRow({ label, value, colors, isRTL }: { label: string; value: string; colors: AppColors; isRTL: boolean }) {
  return (
    <View style={[{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", marginBottom: 8 }]}>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: colors.text }}>{value}</Text>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 16, paddingBottom: 100 },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.6 },
    section: { marginBottom: 12 },
    typeHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
    typeLabel: { fontFamily: "Inter_600SemiBold", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
    lineItem: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 12, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: colors.border },
    lineLabel: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text },
    lineRight: { flexDirection: "row", alignItems: "center", gap: 12 },
    lineAmount: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.accent },
    empty: { alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 },
    emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: colors.text },
    emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
    taxSection: { marginBottom: 16 },
    taxInput: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, fontFamily: "Inter_400Regular", fontSize: 15, color: colors.text, width: 80, textAlign: "center" },
    summaryCard: { backgroundColor: colors.card, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
    summaryTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.text, marginBottom: 14 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    totalLabel: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text },
    totalValue: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.accent },
    breakdown: { marginTop: 14, gap: 6 },
    breakdownRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    breakdownLabel: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    breakdownValue: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.text },
    currencyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    currencyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.accent },
    fab: { position: "absolute", bottom: 28, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40 },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 16 },
    sheetTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text, marginBottom: 16 },
    fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
    input: { backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, fontFamily: "Inter_400Regular", fontSize: 15, color: colors.text, marginBottom: 14 },
    typeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border },
    typeChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    btnRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
    cancelBtnText: { fontFamily: "Inter_500Medium", fontSize: 15, color: colors.textSecondary },
    saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center" },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFF" },
    currencyRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    currencyRowSelected: { backgroundColor: colors.accent + "10", borderRadius: 8, paddingHorizontal: 8, marginHorizontal: -8 },
    currencyCode: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
    currencyLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    currencySymbol: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.textSecondary },
  });
}

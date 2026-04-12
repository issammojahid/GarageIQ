import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { useI18n } from "@/i18n/TranslationContext";
import type { MaterialCommunityIconsName } from "@/types/icons";

const STORAGE_KEY = "cost-calculator-estimates";

type LineItem = {
  id: string;
  label: string;
  amount: string;
  type: "part" | "labor" | "other";
};

type SavedEstimate = {
  id: string;
  title: string;
  items: LineItem[];
  taxRate: string;
  currencyCode: string;
  savedAt: string;
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

type ItemTypeDef = { key: LineItem["type"]; labelKey: "cc_type_part" | "cc_type_labor" | "cc_type_other"; icon: MaterialCommunityIconsName; color: string };

const ITEM_TYPES: ItemTypeDef[] = [
  { key: "part", labelKey: "cc_type_part", icon: "cog-outline", color: "#E85D04" },
  { key: "labor", labelKey: "cc_type_labor", icon: "wrench-outline", color: "#3B82F6" },
  { key: "other", labelKey: "cc_type_other", icon: "plus-circle-outline", color: "#22C55E" },
];

export default function CostCalculatorScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useI18n();
  const [items, setItems] = useState<LineItem[]>([]);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [taxRate, setTaxRate] = useState("0");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<LineItem["type"]>("part");
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  const loadEstimates = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setSavedEstimates(JSON.parse(raw));
  }, []);

  useEffect(() => { loadEstimates(); }, [loadEstimates]);

  const persistEstimates = async (next: SavedEstimate[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSavedEstimates(next);
  };

  const resetModal = () => { setNewLabel(""); setNewAmount(""); setNewType("part"); setEditId(null); };

  const openAdd = () => { resetModal(); setShowAddModal(true); };

  const openEdit = (item: LineItem) => {
    setNewLabel(item.label); setNewAmount(item.amount); setNewType(item.type); setEditId(item.id);
    setShowAddModal(true);
  };

  const handleSaveItem = () => {
    if (!newLabel.trim()) { Alert.alert(t("cc_required_title"), t("cc_required_label")); return; }
    if (editId) {
      setItems((prev) => prev.map((i) => i.id === editId ? { ...i, label: newLabel, amount: newAmount, type: newType } : i));
    } else {
      setItems((prev) => [...prev, { id: Date.now().toString(), label: newLabel, amount: newAmount, type: newType }]);
    }
    setShowAddModal(false);
    resetModal();
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(t("cc_remove_title"), t("cc_remove_msg"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("ph_remove"), style: "destructive", onPress: () => setItems((prev) => prev.filter((i) => i.id !== id)) },
    ]);
  };

  const handleSaveEstimate = async () => {
    if (!saveTitle.trim()) { Alert.alert(t("cc_required_title"), t("cc_estimate_title")); return; }
    const estimate: SavedEstimate = {
      id: Date.now().toString(),
      title: saveTitle.trim(),
      items,
      taxRate,
      currencyCode: currency.code,
      savedAt: new Date().toISOString(),
    };
    await persistEstimates([estimate, ...savedEstimates]);
    setSaveTitle("");
    setShowSavePrompt(false);
    Alert.alert(t("cc_estimate_saved"), t("cc_estimate_saved_msg"));
  };

  const handleLoadEstimate = (estimate: SavedEstimate) => {
    const cur = CURRENCIES.find((c) => c.code === estimate.currencyCode) ?? CURRENCIES[0];
    setCurrency(cur);
    setTaxRate(estimate.taxRate);
    setItems(estimate.items);
    setShowSavedModal(false);
  };

  const handleDeleteEstimate = async (id: string) => {
    Alert.alert(t("cc_delete_estimate"), t("cc_delete_estimate_msg"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: async () => { await persistEstimates(savedEstimates.filter((e) => e.id !== id)); } },
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
        <View style={[s.topRow, isRTL && s.rowReverse]}>
          <Pressable style={s.currencyBtn} onPress={() => setShowCurrencyModal(true)}>
            <Text style={s.currencyBtnText}>{currency.code} {currency.symbol}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.accent} />
          </Pressable>
          <View style={[s.topActions, isRTL && s.rowReverse]}>
            {savedEstimates.length > 0 && (
              <Pressable style={s.topBtn} onPress={() => setShowSavedModal(true)}>
                <Ionicons name="folder-outline" size={16} color={colors.accent} />
                <Text style={s.topBtnText}>{t("cc_saved")}</Text>
              </Pressable>
            )}
            {items.length > 0 && (
              <Pressable style={s.topBtn} onPress={() => setShowSavePrompt(true)}>
                <Ionicons name="save-outline" size={16} color={colors.accent} />
                <Text style={s.topBtnText}>{t("cc_save")}</Text>
              </Pressable>
            )}
          </View>
        </View>

        {ITEM_TYPES.map(({ key, labelKey, icon, color }) => {
          const typeItems = byType(key);
          if (typeItems.length === 0) return null;
          return (
            <View key={key} style={s.section}>
              <View style={[s.typeHeader, isRTL && s.rowReverse]}>
                <MaterialCommunityIcons name={icon} size={15} color={color} />
                <Text style={[s.typeLabel, { color }]}>{t(labelKey)}</Text>
              </View>
              {typeItems.map((item) => (
                <View key={item.id} style={[s.lineItem, isRTL && s.rowReverse]}>
                  <Text style={[s.lineLabel, isRTL && s.textRight]} numberOfLines={1}>{item.label}</Text>
                  <View style={[s.lineRight, isRTL && s.rowReverse]}>
                    <Text style={s.lineAmount}>{item.amount ? fmt(parseFloat(item.amount) || 0) : "—"}</Text>
                    <Pressable onPress={() => openEdit(item)} hitSlop={8}>
                      <Ionicons name="pencil-outline" size={16} color={colors.textTertiary} />
                    </Pressable>
                    <Pressable onPress={() => handleDeleteItem(item.id)} hitSlop={8}>
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
            <Text style={s.emptyTitle}>{t("cc_no_items")}</Text>
            <Text style={s.emptyDesc}>{t("cc_no_items_desc")}</Text>
          </View>
        )}

        <View style={s.taxSection}>
          <View style={[s.row, isRTL && s.rowReverse]}>
            <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("cc_tax_rate")}</Text>
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

        <View style={s.summaryCard}>
          <Text style={[s.summaryTitle, isRTL && s.textRight]}>{t("cc_summary")}</Text>
          <SummaryRow label={t("cc_subtotal")} value={fmt(subtotal)} colors={colors} isRTL={isRTL} />
          {parseFloat(taxRate) > 0 && (
            <SummaryRow label={`${t("cc_tax_rate")} (${taxRate}%)`} value={fmt(taxAmount)} colors={colors} isRTL={isRTL} />
          )}
          <View style={s.divider} />
          <View style={[s.totalRow, isRTL && s.rowReverse]}>
            <Text style={s.totalLabel}>{t("cc_total")}</Text>
            <Text style={s.totalValue}>{fmt(total)}</Text>
          </View>

          <View style={s.breakdown}>
            {ITEM_TYPES.map(({ key, labelKey, color }) => {
              const typeTotal = byType(key).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
              if (typeTotal === 0) return null;
              return (
                <View key={key} style={[s.breakdownRow, isRTL && s.rowReverse]}>
                  <View style={[s.dot, { backgroundColor: color }]} />
                  <Text style={s.breakdownLabel}>{t(labelKey)}</Text>
                  <Text style={s.breakdownValue}>{fmt(typeTotal)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Pressable style={s.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>

      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => setShowCurrencyModal(false)}>
        <Pressable style={s.overlay} onPress={() => setShowCurrencyModal(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>{t("cc_select_currency")}</Text>
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

      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => { setShowAddModal(false); resetModal(); }}>
        <Pressable style={s.overlay} onPress={() => { setShowAddModal(false); resetModal(); }}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>{editId ? t("cc_edit_item") : t("cc_add_item")}</Text>

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("cc_type")}</Text>
            <View style={[s.typeRow, isRTL && s.rowReverse]}>
              {ITEM_TYPES.map(({ key, labelKey, color }) => (
                <Pressable
                  key={key}
                  style={[s.typeChip, newType === key && { backgroundColor: color + "20", borderColor: color }]}
                  onPress={() => setNewType(key)}
                >
                  <Text style={[s.typeChipText, newType === key && { color }]}>{t(labelKey)}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("cc_description")}</Text>
            <TextInput
              style={[s.input, isRTL && s.textRight]}
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder={t("cc_description_placeholder")}
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("cc_amount")} ({currency.symbol})</Text>
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
                <Text style={s.cancelBtnText}>{t("cancel")}</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={handleSaveItem}>
                <Text style={s.saveBtnText}>{editId ? t("cc_update") : t("cc_add")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showSavePrompt} transparent animationType="fade" onRequestClose={() => setShowSavePrompt(false)}>
        <Pressable style={s.overlay} onPress={() => setShowSavePrompt(false)}>
          <Pressable style={[s.sheet, { paddingBottom: 24 }]} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>{t("cc_save_estimate")}</Text>
            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("cc_estimate_title")}</Text>
            <TextInput
              style={[s.input, isRTL && s.textRight]}
              value={saveTitle}
              onChangeText={setSaveTitle}
              placeholder={t("cc_estimate_placeholder")}
              placeholderTextColor={colors.textTertiary}
            />
            <View style={[s.btnRow, isRTL && s.rowReverse]}>
              <Pressable style={s.cancelBtn} onPress={() => setShowSavePrompt(false)}>
                <Text style={s.cancelBtnText}>{t("cancel")}</Text>
              </Pressable>
              <Pressable style={s.saveBtn} onPress={handleSaveEstimate}>
                <Text style={s.saveBtnText}>{t("cc_save")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showSavedModal} transparent animationType="slide" onRequestClose={() => setShowSavedModal(false)}>
        <Pressable style={s.overlay} onPress={() => setShowSavedModal(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <View style={s.handle} />
            <Text style={[s.sheetTitle, isRTL && s.textRight]}>{t("cc_saved_estimates")}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {savedEstimates.map((est) => {
                const cur = CURRENCIES.find((c) => c.code === est.currencyCode) ?? CURRENCIES[0];
                const estTotal = est.items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
                const totalWithTax = estTotal * (1 + (parseFloat(est.taxRate) || 0) / 100);
                const date = new Date(est.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                return (
                  <View key={est.id} style={[s.savedRow, isRTL && s.rowReverse]}>
                    <Pressable style={{ flex: 1 }} onPress={() => handleLoadEstimate(est)}>
                      <Text style={[s.savedTitle, isRTL && s.textRight]}>{est.title}</Text>
                      <Text style={[s.savedMeta, isRTL && s.textRight]}>{date} · {cur.symbol}{totalWithTax.toFixed(2)}</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteEstimate(est.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SummaryRow({ label, value, colors, isRTL }: { label: string; value: string; colors: AppColors; isRTL: boolean }) {
  return (
    <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", marginBottom: 8 }}>
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
    topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    topActions: { flexDirection: "row", gap: 8 },
    topBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    topBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.accent },
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
    savedRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    savedTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text },
    savedMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  });
}

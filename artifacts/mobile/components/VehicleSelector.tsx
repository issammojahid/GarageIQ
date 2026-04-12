import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { filterMakes, getModelsForMake, getYears, CarMake } from "@/data/carData";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n/TranslationContext";
import type { AppColors } from "@/constants/colors";

type Step = "make" | "year" | "model";

export type VehicleSelection = {
  make: string;
  year: number;
  model: string;
};

type Props = {
  visible: boolean;
  initialMake?: string;
  initialYear?: number;
  initialModel?: string;
  onConfirm: (selection: VehicleSelection) => void;
  onClose: () => void;
};

const YEARS = getYears();
const CURRENT_YEAR = new Date().getFullYear();

export default function VehicleSelector({
  visible,
  initialMake = "",
  initialYear,
  initialModel = "",
  onConfirm,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();

  const [step, setStep] = useState<Step>("make");
  const [searchMake, setSearchMake] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [selectedMake, setSelectedMake] = useState(initialMake);
  const [selectedYear, setSelectedYear] = useState(initialYear ?? CURRENT_YEAR);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [useCustomMake, setUseCustomMake] = useState(false);
  const [useCustomModel, setUseCustomModel] = useState(false);

  const s = makeStyles(colors);

  useEffect(() => {
    if (visible) {
      setStep("make");
      setSearchMake("");
      setSearchModel("");
      setSelectedMake(initialMake);
      setSelectedYear(initialYear ?? CURRENT_YEAR);
      setSelectedModel(initialModel);
      setCustomMake("");
      setCustomModel("");
      setUseCustomMake(false);
      setUseCustomModel(false);
    }
  }, [visible, initialMake, initialYear, initialModel]);

  const filteredMakes = useMemo(() => filterMakes(searchMake), [searchMake]);

  const filteredModels = useMemo(
    () => getModelsForMake(selectedMake, searchModel),
    [selectedMake, searchModel]
  );

  const handlePickMake = (make: CarMake) => {
    setSelectedMake(make.name);
    setUseCustomMake(false);
    setCustomMake("");
    setSearchModel("");
    setUseCustomModel(false);
    setStep("year");
  };

  const handlePickYear = (year: number) => {
    setSelectedYear(year);
    setStep("model");
  };

  const handlePickModel = (model: string) => {
    setSelectedModel(model);
    const make = useCustomMake ? customMake.trim() : selectedMake;
    onConfirm({ make, year: selectedYear, model });
  };

  const handleConfirmCustomMake = () => {
    if (!customMake.trim()) return;
    setSelectedMake(customMake.trim());
    setUseCustomMake(true);
    setSearchModel("");
    setUseCustomModel(false);
    setStep("year");
  };

  const handleConfirmCustomModel = () => {
    if (!customModel.trim()) return;
    const make = useCustomMake ? customMake.trim() : selectedMake;
    onConfirm({ make, year: selectedYear, model: customModel.trim() });
  };

  const handleBack = () => {
    if (step === "year") setStep("make");
    else if (step === "model") setStep("year");
  };

  const activeMake = useCustomMake ? customMake.trim() : selectedMake;

  const stepTitle =
    step === "make"
      ? t("vs_select_make")
      : step === "year"
      ? t("vs_select_year")
      : t("vs_select_model");

  const stepSubtitle =
    step === "make"
      ? t("vs_brand_subtitle")
      : step === "year"
      ? activeMake
      : `${activeMake} · ${selectedYear}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={s.header}>
            <View style={s.headerLeft}>
              {step !== "make" ? (
                <Pressable onPress={handleBack} style={s.backBtn} hitSlop={12}>
                  <Ionicons name="chevron-back" size={22} color={colors.text} />
                </Pressable>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={s.headerTitle}>{stepTitle}</Text>
                <Text style={s.headerSubtitle} numberOfLines={1}>{stepSubtitle}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {step === "make" && (
            <View style={{ flex: 1 }}>
              <View style={s.searchRow}>
                <Ionicons name="search" size={16} color={colors.textTertiary} style={s.searchIcon} />
                <TextInput
                  style={s.searchInput}
                  placeholder={t("vs_search_brand_ph")}
                  placeholderTextColor={colors.textTertiary}
                  value={searchMake}
                  onChangeText={setSearchMake}
                  autoFocus
                  returnKeyType="search"
                />
                {searchMake.length > 0 && (
                  <Pressable onPress={() => setSearchMake("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              <Pressable
                style={s.customToggleRow}
                onPress={() => setUseCustomMake(!useCustomMake)}
              >
                <Ionicons
                  name={useCustomMake ? "checkbox" : "square-outline"}
                  size={18}
                  color={useCustomMake ? colors.accent : colors.textSecondary}
                />
                <Text style={[s.customLabel, useCustomMake && { color: colors.accent }]}>
                  {t("vs_enter_brand_manual")}
                </Text>
              </Pressable>

              {useCustomMake ? (
                <View style={s.customInputRow}>
                  <TextInput
                    style={[s.searchInput, { flex: 1 }]}
                    placeholder={t("vs_brand_manual_ph")}
                    placeholderTextColor={colors.textTertiary}
                    value={customMake}
                    onChangeText={setCustomMake}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={handleConfirmCustomMake}
                  />
                  <Pressable
                    style={[s.confirmBtn, !customMake.trim() && { opacity: 0.4 }]}
                    onPress={handleConfirmCustomMake}
                    disabled={!customMake.trim()}
                  >
                    <Text style={s.confirmBtnText}>{t("vs_next")}</Text>
                  </Pressable>
                </View>
              ) : null}

              <FlatList
                data={filteredMakes}
                keyExtractor={(item) => item.name}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.listContent}
                renderItem={({ item }) => {
                  const isSelected = item.name === selectedMake && !useCustomMake;
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        s.listItem,
                        pressed && s.listItemPressed,
                        isSelected && s.listItemSelected,
                      ]}
                      onPress={() => handlePickMake(item)}
                    >
                      <Text style={[s.listItemText, isSelected && s.listItemTextSelected]}>
                        {item.name}
                      </Text>
                      <Text style={s.listItemMeta}>{item.models.length} {t("vs_models_count")}</Text>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={18} color={colors.accent} />
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                      )}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  <Text style={s.emptyText}>{t("vs_no_brands")}</Text>
                }
              />
            </View>
          )}

          {step === "year" && (
            <FlatList
              data={YEARS}
              keyExtractor={(y) => String(y)}
              contentContainerStyle={s.listContent}
              renderItem={({ item: year }) => (
                <Pressable
                  style={({ pressed }) => [
                    s.listItem,
                    pressed && s.listItemPressed,
                    year === selectedYear && s.listItemSelected,
                  ]}
                  onPress={() => handlePickYear(year)}
                >
                  <Text style={[s.listItemText, year === selectedYear && s.listItemTextSelected]}>
                    {year}
                  </Text>
                  {year === selectedYear && (
                    <Ionicons name="checkmark" size={18} color={colors.accent} />
                  )}
                </Pressable>
              )}
              initialScrollIndex={YEARS.indexOf(selectedYear) >= 0 ? YEARS.indexOf(selectedYear) : 0}
              getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
            />
          )}

          {step === "model" && (
            <View style={{ flex: 1 }}>
              <View style={s.searchRow}>
                <Ionicons name="search" size={16} color={colors.textTertiary} style={s.searchIcon} />
                <TextInput
                  style={s.searchInput}
                  placeholder={t("vs_search_model_ph")}
                  placeholderTextColor={colors.textTertiary}
                  value={searchModel}
                  onChangeText={setSearchModel}
                  returnKeyType="search"
                />
                {searchModel.length > 0 && (
                  <Pressable onPress={() => setSearchModel("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              <Pressable
                style={s.customToggleRow}
                onPress={() => setUseCustomModel(!useCustomModel)}
              >
                <Ionicons
                  name={useCustomModel ? "checkbox" : "square-outline"}
                  size={18}
                  color={useCustomModel ? colors.accent : colors.textSecondary}
                />
                <Text style={[s.customLabel, useCustomModel && { color: colors.accent }]}>
                  {t("vs_enter_model_manual")}
                </Text>
              </Pressable>

              {useCustomModel ? (
                <View style={s.customInputRow}>
                  <TextInput
                    style={[s.searchInput, { flex: 1 }]}
                    placeholder={t("vs_model_manual_ph")}
                    placeholderTextColor={colors.textTertiary}
                    value={customModel}
                    onChangeText={setCustomModel}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmCustomModel}
                  />
                  <Pressable
                    style={[s.confirmBtn, !customModel.trim() && { opacity: 0.4 }]}
                    onPress={handleConfirmCustomModel}
                    disabled={!customModel.trim()}
                  >
                    <Text style={s.confirmBtnText}>{t("vs_done")}</Text>
                  </Pressable>
                </View>
              ) : null}

              <FlatList
                data={filteredModels}
                keyExtractor={(m) => m}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.listContent}
                renderItem={({ item: model }) => {
                  const isSelected = model === selectedModel;
                  return (
                    <Pressable
                      style={({ pressed }) => [
                        s.listItem,
                        pressed && s.listItemPressed,
                        isSelected && s.listItemSelected,
                      ]}
                      onPress={() => handlePickModel(model)}
                    >
                      <Text style={[s.listItemText, isSelected && s.listItemTextSelected]}>
                        {model}
                      </Text>
                      {isSelected ? (
                        <Ionicons name="checkmark" size={18} color={colors.accent} />
                      ) : (
                        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                      )}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={
                  !useCustomModel ? (
                    <Text style={s.emptyText}>{t("vs_no_models")}</Text>
                  ) : null
                }
              />
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
    backBtn: { padding: 4 },
    closeBtn: { padding: 4 },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.text },
    headerSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary, marginTop: 1 },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      paddingVertical: 12,
    },
    listContent: { paddingBottom: 40 },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      height: 52,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    listItemPressed: { backgroundColor: colors.card },
    listItemSelected: { backgroundColor: colors.card2 },
    listItemText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: colors.text },
    listItemTextSelected: { fontFamily: "Inter_600SemiBold", color: colors.accent },
    listItemMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, marginRight: 8 },
    emptyText: {
      textAlign: "center",
      color: colors.textSecondary,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      padding: 24,
    },
    customToggleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    customLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary },
    customInputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.card2,
    },
    confirmBtn: {
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    confirmBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  });
}

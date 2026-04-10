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
import Colors from "@/constants/colors";
import { filterMakes, getModelsForMake, getYears, CarMake } from "@/data/carData";

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
  const [step, setStep] = useState<Step>("make");
  const [searchMake, setSearchMake] = useState("");
  const [searchModel, setSearchModel] = useState("");
  const [selectedMake, setSelectedMake] = useState(initialMake);
  const [selectedYear, setSelectedYear] = useState(initialYear ?? CURRENT_YEAR);
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [useCustomMake, setUseCustomMake] = useState(false);
  const [useCustomModel, setUseCustomModel] = useState(false);

  useEffect(() => {
    if (visible) {
      setStep("make");
      setSearchMake("");
      setSearchModel("");
      setSelectedMake(initialMake);
      setSelectedYear(initialYear ?? CURRENT_YEAR);
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

  const stepTitle = step === "make" ? "Select Make" : step === "year" ? "Select Year" : "Select Model";
  const stepSubtitle =
    step === "make"
      ? "Search or enter your car brand"
      : step === "year"
      ? activeMake
      : `${activeMake} · ${selectedYear}`;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {step !== "make" ? (
                <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={12}>
                  <Ionicons name="chevron-back" size={22} color={Colors.text} />
                </Pressable>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{stepTitle}</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>{stepSubtitle}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {step === "make" && (
            <View style={{ flex: 1 }}>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={16} color={Colors.textTertiary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search brand..."
                  placeholderTextColor={Colors.textTertiary}
                  value={searchMake}
                  onChangeText={setSearchMake}
                  autoFocus
                  returnKeyType="search"
                />
                {searchMake.length > 0 && (
                  <Pressable onPress={() => setSearchMake("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              <Pressable
                style={styles.customToggleRow}
                onPress={() => setUseCustomMake(!useCustomMake)}
              >
                <Ionicons
                  name={useCustomMake ? "checkbox" : "square-outline"}
                  size={18}
                  color={useCustomMake ? Colors.accent : Colors.textSecondary}
                />
                <Text style={[styles.customLabel, useCustomMake && { color: Colors.accent }]}>
                  Enter brand manually
                </Text>
              </Pressable>

              {useCustomMake ? (
                <View style={styles.customInputRow}>
                  <TextInput
                    style={[styles.searchInput, { flex: 1 }]}
                    placeholder="e.g. Haval, MG, Geely..."
                    placeholderTextColor={Colors.textTertiary}
                    value={customMake}
                    onChangeText={setCustomMake}
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={handleConfirmCustomMake}
                  />
                  <Pressable
                    style={[styles.confirmBtn, !customMake.trim() && { opacity: 0.4 }]}
                    onPress={handleConfirmCustomMake}
                    disabled={!customMake.trim()}
                  >
                    <Text style={styles.confirmBtnText}>Next</Text>
                  </Pressable>
                </View>
              ) : null}

              <FlatList
                data={filteredMakes}
                keyExtractor={(item) => item.name}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}
                    onPress={() => handlePickMake(item)}
                  >
                    <Text style={styles.listItemText}>{item.name}</Text>
                    <Text style={styles.listItemMeta}>{item.models.length} models</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No brands found. Use "Enter brand manually" above.</Text>
                }
              />
            </View>
          )}

          {step === "year" && (
            <FlatList
              data={YEARS}
              keyExtractor={(y) => String(y)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item: year }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.listItem,
                    pressed && styles.listItemPressed,
                    year === selectedYear && styles.listItemSelected,
                  ]}
                  onPress={() => handlePickYear(year)}
                >
                  <Text style={[styles.listItemText, year === selectedYear && styles.listItemTextSelected]}>
                    {year}
                  </Text>
                  {year === selectedYear && (
                    <Ionicons name="checkmark" size={18} color={Colors.accent} />
                  )}
                </Pressable>
              )}
              initialScrollIndex={YEARS.indexOf(selectedYear) >= 0 ? YEARS.indexOf(selectedYear) : 0}
              getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
            />
          )}

          {step === "model" && (
            <View style={{ flex: 1 }}>
              <View style={styles.searchRow}>
                <Ionicons name="search" size={16} color={Colors.textTertiary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search model..."
                  placeholderTextColor={Colors.textTertiary}
                  value={searchModel}
                  onChangeText={setSearchModel}
                  returnKeyType="search"
                />
                {searchModel.length > 0 && (
                  <Pressable onPress={() => setSearchModel("")} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              <Pressable
                style={styles.customToggleRow}
                onPress={() => setUseCustomModel(!useCustomModel)}
              >
                <Ionicons
                  name={useCustomModel ? "checkbox" : "square-outline"}
                  size={18}
                  color={useCustomModel ? Colors.accent : Colors.textSecondary}
                />
                <Text style={[styles.customLabel, useCustomModel && { color: Colors.accent }]}>
                  Enter model manually
                </Text>
              </Pressable>

              {useCustomModel ? (
                <View style={styles.customInputRow}>
                  <TextInput
                    style={[styles.searchInput, { flex: 1 }]}
                    placeholder="Model name..."
                    placeholderTextColor={Colors.textTertiary}
                    value={customModel}
                    onChangeText={setCustomModel}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleConfirmCustomModel}
                  />
                  <Pressable
                    style={[styles.confirmBtn, !customModel.trim() && { opacity: 0.4 }]}
                    onPress={handleConfirmCustomModel}
                    disabled={!customModel.trim()}
                  >
                    <Text style={styles.confirmBtnText}>Done</Text>
                  </Pressable>
                </View>
              ) : null}

              <FlatList
                data={filteredModels}
                keyExtractor={(m) => m}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                renderItem={({ item: model }) => (
                  <Pressable
                    style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}
                    onPress={() => handlePickModel(model)}
                  >
                    <Text style={styles.listItemText}>{model}</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                  </Pressable>
                )}
                ListEmptyComponent={
                  !useCustomModel ? (
                    <Text style={styles.emptyText}>No models found. Use "Enter model manually" above.</Text>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  backBtn: { padding: 4 },
  closeBtn: { padding: 4 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text },
  headerSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: Colors.text,
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
    borderBottomColor: Colors.border,
  },
  listItemPressed: { backgroundColor: Colors.card },
  listItemSelected: { backgroundColor: Colors.card2 },
  listItemText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.text },
  listItemTextSelected: { fontFamily: "Inter_600SemiBold", color: Colors.accent },
  listItemMeta: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary, marginRight: 8 },
  emptyText: {
    textAlign: "center",
    color: Colors.textSecondary,
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
    borderBottomColor: Colors.border,
  },
  customLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  customInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card2,
  },
  confirmBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  confirmBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
});

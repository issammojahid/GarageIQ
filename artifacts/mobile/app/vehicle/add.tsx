import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useCreateVehicle, getListVehiclesQueryKey } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import VehicleSelector, { VehicleSelection } from "@/components/VehicleSelector";

const CURRENT_YEAR = new Date().getFullYear();

export default function AddVehicleScreen() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [mileage, setMileage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);

  const createVehicle = useCreateVehicle();
  const queryClient = useQueryClient();

  const handleSelectorConfirm = (selection: VehicleSelection) => {
    setMake(selection.make);
    setModel(selection.model);
    setYear(selection.year);
    setSelectorVisible(false);
  };

  const handleSave = async () => {
    if (!make.trim() || !model.trim()) {
      Alert.alert("Missing Info", "Please select your vehicle make and model first.");
      return;
    }
    if (isNaN(year) || year < 1980 || year > CURRENT_YEAR + 1) {
      Alert.alert("Invalid Year", `Year must be between 1980 and ${CURRENT_YEAR + 1}`);
      return;
    }
    const mileageNum = parseInt(mileage || "0");

    setLoading(true);
    try {
      await createVehicle.mutateAsync({
        data: {
          make: make.trim(),
          model: model.trim(),
          year,
          mileage: mileageNum,
          licensePlate: licensePlate.trim() || undefined,
          color: color.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      Alert.alert("Success", "Vehicle added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? `Failed to save vehicle: ${err.message}`
          : "Failed to add vehicle. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const vehicleLabel = make && model ? `${make} ${model} · ${year}` : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.subtitle}>Enter your vehicle details below</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Vehicle *</Text>
          <Pressable
            style={({ pressed }) => [styles.selectorBtn, pressed && styles.selectorBtnPressed]}
            onPress={() => setSelectorVisible(true)}
          >
            <View style={{ flex: 1 }}>
              {vehicleLabel ? (
                <Text style={styles.selectorBtnValue} numberOfLines={1}>{vehicleLabel}</Text>
              ) : (
                <Text style={styles.selectorBtnPlaceholder}>Select make, year & model...</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mileage (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="45000"
            placeholderTextColor={Colors.textTertiary}
            value={mileage}
            onChangeText={setMileage}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>License Plate</Text>
          <TextInput
            style={styles.input}
            placeholder="12345 A 6"
            placeholderTextColor={Colors.textTertiary}
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <TextInput
            style={styles.input}
            placeholder="Black, White, Red..."
            placeholderTextColor={Colors.textTertiary}
            value={color}
            onChangeText={setColor}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional info..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Add Vehicle</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <VehicleSelector
        visible={selectorVisible}
        initialMake={make}
        initialYear={year}
        initialModel={model}
        onConfirm={handleSelectorConfirm}
        onClose={() => setSelectorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, marginBottom: 8 },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { minHeight: 80 },
  selectorBtn: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  selectorBtnPressed: { opacity: 0.75 },
  selectorBtnValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  selectorBtnPlaceholder: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textTertiary,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
});

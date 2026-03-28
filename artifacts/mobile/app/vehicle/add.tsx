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

const CURRENT_YEAR = new Date().getFullYear();

export default function AddVehicleScreen() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(String(CURRENT_YEAR));
  const [mileage, setMileage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const createVehicle = useCreateVehicle();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (!make.trim() || !model.trim()) {
      Alert.alert("Missing Info", "Make and model are required");
      return;
    }
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > CURRENT_YEAR + 1) {
      Alert.alert("Invalid Year", `Year must be between 1900 and ${CURRENT_YEAR + 1}`);
      return;
    }
    const mileageNum = parseInt(mileage || "0");

    setLoading(true);
    console.log("[AddVehicle] Submitting:", { make: make.trim(), model: model.trim(), year: yearNum, mileage: mileageNum });
    try {
      await createVehicle.mutateAsync({
        data: {
          make: make.trim(),
          model: model.trim(),
          year: yearNum,
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
      console.log("[AddVehicle] Error:", err);
      const message =
        err instanceof Error
          ? `Failed to save vehicle: ${err.message}`
          : "Failed to add vehicle. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Enter your vehicle details below</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Make *</Text>
            <TextInput
              style={styles.input}
              placeholder="Toyota, BMW..."
              placeholderTextColor={Colors.textTertiary}
              value={make}
              onChangeText={setMake}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Model *</Text>
            <TextInput
              style={styles.input}
              placeholder="Corolla, X5..."
              placeholderTextColor={Colors.textTertiary}
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Year *</Text>
            <TextInput
              style={styles.input}
              placeholder="2020"
              placeholderTextColor={Colors.textTertiary}
              value={year}
              onChangeText={setYear}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  row: { flexDirection: "row", gap: 12 },
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

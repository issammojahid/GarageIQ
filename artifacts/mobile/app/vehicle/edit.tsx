import React, { useState, useEffect } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { useGetVehicle, useUpdateVehicle, getListVehiclesQueryKey, getGetVehicleQueryKey } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import VehicleSelector, { VehicleSelection } from "@/components/VehicleSelector";

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleId = parseInt(id || "0");
  const { data: vehicle, isLoading: fetching } = useGetVehicle(vehicleId);
  const updateVehicle = useUpdateVehicle();
  const queryClient = useQueryClient();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [mileage, setMileage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectorVisible, setSelectorVisible] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setMileage(String(vehicle.mileage));
      setLicensePlate(vehicle.licensePlate || "");
      setColor(vehicle.color || "");
      setNotes(vehicle.notes || "");
    }
  }, [vehicle]);

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
    setLoading(true);
    try {
      await updateVehicle.mutateAsync({
        id: vehicleId,
        data: {
          make: make.trim(),
          model: model.trim(),
          year,
          mileage: parseInt(mileage || "0"),
          licensePlate: licensePlate.trim() || undefined,
          color: color.trim() || undefined,
          notes: notes.trim() || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetVehicleQueryKey(vehicleId) });
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to update vehicle");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  const vehicleLabel = make && model ? `${make} ${model} · ${year}` : null;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

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
            placeholder="Black"
            placeholderTextColor={Colors.textTertiary}
            value={color}
            onChangeText={setColor}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            placeholder="Notes..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
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
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
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

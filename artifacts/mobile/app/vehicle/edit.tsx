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

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicleId = parseInt(id || "0");
  const { data: vehicle, isLoading: fetching } = useGetVehicle(vehicleId);
  const updateVehicle = useUpdateVehicle();
  const queryClient = useQueryClient();

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(String(vehicle.year));
      setMileage(String(vehicle.mileage));
      setLicensePlate(vehicle.licensePlate || "");
      setColor(vehicle.color || "");
      setNotes(vehicle.notes || "");
    }
  }, [vehicle]);

  const handleSave = async () => {
    if (!make.trim() || !model.trim()) {
      Alert.alert("Missing Info", "Make and model are required");
      return;
    }
    setLoading(true);
    try {
      await updateVehicle.mutateAsync({
        id: vehicleId,
        data: {
          make: make.trim(),
          model: model.trim(),
          year: parseInt(year),
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Make *</Text>
            <TextInput style={styles.input} placeholder="Toyota" placeholderTextColor={Colors.textTertiary} value={make} onChangeText={setMake} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Model *</Text>
            <TextInput style={styles.input} placeholder="Corolla" placeholderTextColor={Colors.textTertiary} value={model} onChangeText={setModel} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Year</Text>
            <TextInput style={styles.input} placeholder="2020" placeholderTextColor={Colors.textTertiary} value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Mileage (km)</Text>
            <TextInput style={styles.input} placeholder="45000" placeholderTextColor={Colors.textTertiary} value={mileage} onChangeText={setMileage} keyboardType="number-pad" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>License Plate</Text>
          <TextInput style={styles.input} placeholder="12345 A 6" placeholderTextColor={Colors.textTertiary} value={licensePlate} onChangeText={setLicensePlate} autoCapitalize="characters" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Color</Text>
          <TextInput style={styles.input} placeholder="Black" placeholderTextColor={Colors.textTertiary} value={color} onChangeText={setColor} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="Notes..." placeholderTextColor={Colors.textTertiary} value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
        </View>
        <Pressable
          style={[styles.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: "row", gap: 12 },
  field: { marginBottom: 16 },
  label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, marginBottom: 8 },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, color: Colors.text, fontFamily: "Inter_400Regular", fontSize: 14, borderWidth: 1, borderColor: Colors.border },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
});

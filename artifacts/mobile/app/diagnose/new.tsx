import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles, useCreateDiagnosis } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { showInterstitialAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";

const SYSTEMS: Array<{ id: string; label: string; icon: MaterialCommunityIconsName }> = [
  { id: "engine", label: "Engine", icon: "engine" },
  { id: "brakes", label: "Brakes", icon: "car-brake-alert" },
  { id: "transmission", label: "Transmission", icon: "car-shift-pattern" },
  { id: "electrical", label: "Electrical", icon: "flash" },
  { id: "suspension", label: "Suspension", icon: "car-seat" },
  { id: "cooling", label: "Cooling", icon: "thermometer" },
  { id: "exhaust", label: "Exhaust", icon: "smoke" },
  { id: "fuel", label: "Fuel System", icon: "fuel" },
  { id: "ac", label: "A/C", icon: "air-conditioner" },
  { id: "steering", label: "Steering", icon: "steering" },
];

export default function NewDiagnoseScreen() {
  const { vehicleId: paramVehicleId, system: paramSystem } = useLocalSearchParams<{
    vehicleId?: string;
    system?: string;
  }>();

  const { data: vehicles } = useListVehicles();
  const queryClient = useQueryClient();
  const createDiagnosis = useCreateDiagnosis();

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    paramVehicleId ? parseInt(paramVehicleId) : null
  );
  const [symptoms, setSymptoms] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(
    paramSystem ? [paramSystem] : []
  );
  const [errorCodes, setErrorCodes] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSystem = (id: string) => {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      Alert.alert("Select Vehicle", "Please select a vehicle to diagnose");
      return;
    }
    if (!symptoms.trim()) {
      Alert.alert("Describe Symptoms", "Please describe the symptoms you are experiencing");
      return;
    }
    if (selectedSystems.length === 0) {
      Alert.alert("Select System", "Please select at least one affected system");
      return;
    }

    setLoading(true);
    try {
      const result = await createDiagnosis.mutateAsync({
        data: {
          vehicleId: selectedVehicleId,
          symptoms: symptoms.trim(),
          systems: selectedSystems,
          errorCodes: errorCodes.trim() || undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["listDiagnoses"] });
      showInterstitialAd().catch(() => {});
      router.replace({ pathname: "/diagnose/result", params: { id: result.id } });
    } catch (e) {
      Alert.alert("Error", "Failed to create diagnosis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Select */}
        <Text style={styles.sectionLabel}>Select Vehicle</Text>
        {!vehicles || vehicles.length === 0 ? (
          <Pressable style={styles.addVehicleBtn} onPress={() => router.push("/vehicle/add")}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
            <Text style={styles.addVehicleText}>Add a Vehicle First</Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
            {vehicles.map((v) => (
              <Pressable
                key={v.id}
                style={[styles.vehicleChip, selectedVehicleId === v.id && styles.vehicleChipSelected]}
                onPress={() => setSelectedVehicleId(v.id)}
              >
                <MaterialCommunityIcons
                  name="car"
                  size={16}
                  color={selectedVehicleId === v.id ? Colors.accent : Colors.textSecondary}
                />
                <Text style={[styles.vehicleChipText, selectedVehicleId === v.id && styles.vehicleChipTextSelected]}>
                  {v.year} {v.make} {v.model}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Symptoms */}
        <Text style={styles.sectionLabel}>Describe Symptoms</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="e.g. My car makes a knocking sound when accelerating, especially at low RPM. The check engine light came on yesterday..."
          placeholderTextColor={Colors.textTertiary}
          value={symptoms}
          onChangeText={setSymptoms}
          textAlignVertical="top"
        />

        {/* Systems */}
        <Text style={styles.sectionLabel}>Affected Systems</Text>
        <View style={styles.systemGrid}>
          {SYSTEMS.map((sys) => (
            <Pressable
              key={sys.id}
              style={[styles.systemChip, selectedSystems.includes(sys.id) && styles.systemChipSelected]}
              onPress={() => toggleSystem(sys.id)}
            >
              <MaterialCommunityIcons
                name={sys.icon}
                size={18}
                color={selectedSystems.includes(sys.id) ? Colors.accent : Colors.textSecondary}
              />
              <Text
                style={[styles.systemChipText, selectedSystems.includes(sys.id) && styles.systemChipTextSelected]}
              >
                {sys.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Error Codes */}
        <Text style={styles.sectionLabel}>OBD-II Error Codes <Text style={styles.optional}>(optional)</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. P0300, P0171"
          placeholderTextColor={Colors.textTertiary}
          value={errorCodes}
          onChangeText={setErrorCodes}
          autoCapitalize="characters"
        />

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitBtn, (loading || !symptoms) && styles.submitDisabled, pressed && { opacity: 0.9 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="stethoscope" size={20} color="#fff" />
              <Text style={styles.submitText}>Diagnose with AI</Text>
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
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, marginBottom: 10, marginTop: 20 },
  optional: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textTertiary },
  vehicleScroll: { marginBottom: 4 },
  vehicleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleChipSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  vehicleChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  vehicleChipTextSelected: { color: Colors.accent },
  addVehicleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.accent + "40",
  },
  addVehicleText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.accent },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    minHeight: 110,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 20,
  },
  systemGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  systemChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  systemChipSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  systemChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  systemChipTextSelected: { color: Colors.accent },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    color: Colors.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 30,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
});

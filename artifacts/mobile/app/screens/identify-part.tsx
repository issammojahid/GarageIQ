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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles, useIdentifyPart, type IdentifyPartResult } from "@workspace/api-client-react";

export default function IdentifyPartScreen() {
  const { data: vehicles } = useListVehicles();
  const [description, setDescription] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPartResult | null>(null);

  const identifyPart = useIdentifyPart();
  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  const handleIdentify = async () => {
    if (!description.trim()) {
      Alert.alert("Describe the part", "Please describe what you see");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await identifyPart.mutateAsync({
        data: {
          description: description.trim(),
          vehicleMake: selectedVehicle?.make,
          vehicleModel: selectedVehicle?.model,
          vehicleYear: selectedVehicle?.year,
        },
      });
      setResult(data);
    } catch {
      Alert.alert("Error", "Failed to identify part. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <MaterialCommunityIcons name="magnify-scan" size={40} color="#7C3AED" />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>AI Part Identifier</Text>
            <Text style={styles.headerDesc}>Describe a car part and AI will identify it for you</Text>
          </View>
        </View>

        {/* Vehicle Context */}
        {vehicles && vehicles.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Vehicle Context <Text style={styles.optional}>(optional)</Text></Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              {vehicles.map((v) => (
                <Pressable
                  key={v.id}
                  style={[styles.vehicleChip, selectedVehicleId === v.id && styles.vehicleChipActive]}
                  onPress={() => setSelectedVehicleId(selectedVehicleId === v.id ? null : v.id)}
                >
                  <Text style={[styles.vehicleChipText, selectedVehicleId === v.id && styles.vehicleChipTextActive]}>
                    {v.year} {v.make} {v.model}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* Description */}
        <Text style={styles.sectionLabel}>Describe the Part</Text>
        <TextInput
          style={styles.textArea}
          multiline
          numberOfLines={4}
          placeholder="e.g. A rubber belt that runs around a pulley near the engine, connected to the alternator and AC compressor..."
          placeholderTextColor={Colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        <Pressable
          style={[styles.identifyBtn, (!description.trim() || loading) && { opacity: 0.6 }]}
          onPress={handleIdentify}
          disabled={loading || !description.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="magnify-scan" size={20} color="#fff" />
              <Text style={styles.identifyBtnText}>Identify Part</Text>
            </>
          )}
        </Pressable>

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIconWrap}>
                <MaterialCommunityIcons name="cog" size={28} color="#7C3AED" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.partName}>{result.partName}</Text>
                {result.partNumber && result.partNumber !== "N/A" && (
                  <Text style={styles.partNumber}>Part #: {result.partNumber}</Text>
                )}
              </View>
            </View>

            <Text style={styles.resultLabel}>Description</Text>
            <Text style={styles.resultText}>{result.partDescription}</Text>

            <Text style={styles.resultLabel}>Function</Text>
            <Text style={styles.resultText}>{result.function}</Text>

            <Text style={styles.resultLabel}>Location</Text>
            <Text style={styles.resultText}>{result.location}</Text>

            {result.commonIssues?.length > 0 && (
              <>
                <Text style={styles.resultLabel}>Common Issues</Text>
                {result.commonIssues.map((issue: string, i: number) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{issue}</Text>
                  </View>
                ))}
              </>
            )}

            <View style={styles.costRow}>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Estimated Cost</Text>
                <Text style={styles.costValue}>{result.estimatedCost}</Text>
              </View>
              <View style={styles.costItem}>
                <Text style={styles.costLabel}>Difficulty</Text>
                <Text style={styles.costValue}>{result.replacementDifficulty}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  headerCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#7C3AED15", borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#7C3AED30" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  headerDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text, marginBottom: 10, marginTop: 8 },
  optional: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textTertiary },
  vehicleChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card, marginRight: 8, marginBottom: 12 },
  vehicleChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  vehicleChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  vehicleChipTextActive: { color: Colors.accent },
  textArea: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, color: Colors.text, fontFamily: "Inter_400Regular", fontSize: 14, minHeight: 110, borderWidth: 1, borderColor: Colors.border, lineHeight: 20, marginBottom: 16 },
  identifyBtn: { backgroundColor: "#7C3AED", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  identifyBtnText: { fontFamily: "Inter_700Bold", fontSize: 17, color: "#fff" },
  resultCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: Colors.border },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  resultIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#7C3AED20", alignItems: "center", justifyContent: "center" },
  partName: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.text },
  partNumber: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  resultLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary, marginBottom: 6, marginTop: 14 },
  resultText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 20 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#7C3AED", marginTop: 7 },
  bulletText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 20 },
  costRow: { flexDirection: "row", gap: 12, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  costItem: { flex: 1, backgroundColor: Colors.card2, borderRadius: 12, padding: 12, alignItems: "center" },
  costLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary, marginBottom: 4 },
  costValue: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text, textAlign: "center" },
});

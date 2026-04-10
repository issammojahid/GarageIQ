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
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles, useIdentifyPart, type IdentifyPartResult } from "@workspace/api-client-react";

type PickedImage = {
  uri: string;
  base64: string;
  mimeType: string;
};

export default function IdentifyPartScreen() {
  const { data: vehicles } = useListVehicles();
  const [description, setDescription] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IdentifyPartResult | null>(null);
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);

  const identifyPart = useIdentifyPart();
  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed to take a photo.");
      return false;
    }
    return true;
  };

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Photo library access is needed to pick an image.");
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const granted = await requestCameraPermission();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPickedImage({
        uri: asset.uri,
        base64: asset.base64 ?? "",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  const handlePickImage = async () => {
    const granted = await requestMediaPermission();
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPickedImage({
        uri: asset.uri,
        base64: asset.base64 ?? "",
        mimeType: asset.mimeType ?? "image/jpeg",
      });
    }
  };

  const showImageOptions = () => {
    Alert.alert("Add Image", "Choose an option", [
      { text: "Take Photo", onPress: handleTakePhoto },
      { text: "Choose from Library", onPress: handlePickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleIdentify = async () => {
    if (!description.trim() && !pickedImage) {
      Alert.alert("Describe or photograph the part", "Please describe the part or add an image");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const data = await identifyPart.mutateAsync({
        data: {
          description: description.trim() || "See attached image",
          vehicleMake: selectedVehicle?.make,
          vehicleModel: selectedVehicle?.model,
          vehicleYear: selectedVehicle?.year,
          imageBase64: pickedImage?.base64,
          imageMimeType: pickedImage?.mimeType,
        },
      });
      setResult(data);
    } catch {
      Alert.alert("Error", "Failed to identify part. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canIdentify = !!(description.trim() || pickedImage);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <MaterialCommunityIcons name="magnify-scan" size={40} color="#7C3AED" />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>AI Part Identifier</Text>
            <Text style={styles.headerDesc}>Photograph or describe a part and AI will identify it</Text>
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

        {/* Image section */}
        <Text style={styles.sectionLabel}>Photo <Text style={styles.optional}>(optional, improves accuracy)</Text></Text>
        {pickedImage ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: pickedImage.uri }} style={styles.imagePreview} resizeMode="cover" />
            <Pressable style={styles.imageRemoveBtn} onPress={() => setPickedImage(null)}>
              <MaterialCommunityIcons name="close-circle" size={26} color="#fff" />
            </Pressable>
            <Pressable style={styles.imageChangeBtn} onPress={showImageOptions}>
              <MaterialCommunityIcons name="camera-retake" size={16} color="#fff" />
              <Text style={styles.imageChangeBtnText}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.imagePickerRow}>
            <Pressable style={styles.imagePickerBtn} onPress={handleTakePhoto}>
              <MaterialCommunityIcons name="camera" size={24} color="#7C3AED" />
              <Text style={styles.imagePickerBtnText}>Take Photo</Text>
            </Pressable>
            <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
              <MaterialCommunityIcons name="image-multiple" size={24} color="#7C3AED" />
              <Text style={styles.imagePickerBtnText}>From Library</Text>
            </Pressable>
          </View>
        )}

        {/* Description */}
        <Text style={styles.sectionLabel}>Describe the Part <Text style={styles.optional}>{pickedImage ? "(optional if photo added)" : ""}</Text></Text>
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
          style={[styles.identifyBtn, (!canIdentify || loading) && { opacity: 0.6 }]}
          onPress={handleIdentify}
          disabled={loading || !canIdentify}
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
  imagePickerRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  imagePickerBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#7C3AED15", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#7C3AED30" },
  imagePickerBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#7C3AED" },
  imagePreviewWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 16, position: "relative", height: 200, backgroundColor: Colors.card },
  imagePreview: { width: "100%", height: "100%" },
  imageRemoveBtn: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 14 },
  imageChangeBtn: { position: "absolute", bottom: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  imageChangeBtnText: { fontFamily: "Inter_500Medium", fontSize: 12, color: "#fff" },
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

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
  Image,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { useCreateDiagnosis, getListDiagnosesQueryKey, ApiError } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import { showInterstitialAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { useLanguagePref, LANGUAGES } from "@/hooks/useLanguagePref";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";

const SYSTEMS: Array<{ id: string; labelKey: keyof T; icon: MaterialCommunityIconsName }> = [
  { id: "engine", labelKey: "sys_engine", icon: "engine" },
  { id: "brakes", labelKey: "sys_brakes", icon: "car-brake-alert" },
  { id: "transmission", labelKey: "sys_transmission", icon: "car-shift-pattern" },
  { id: "electrical", labelKey: "sys_electrical", icon: "flash" },
  { id: "suspension", labelKey: "sys_suspension", icon: "car-seat" },
  { id: "cooling", labelKey: "sys_cooling", icon: "thermometer" },
  { id: "exhaust", labelKey: "sys_exhaust", icon: "smoke" },
  { id: "fuel", labelKey: "sys_fuel", icon: "fuel" },
  { id: "ac", labelKey: "sys_ac", icon: "air-conditioner" },
  { id: "steering", labelKey: "sys_steering", icon: "steering" },
];

const DRIVING_CONDITION_KEYS: Array<{ key: string; labelKey: keyof T }> = [
  { key: "City", labelKey: "form_condition_city" },
  { key: "Highway", labelKey: "form_condition_highway" },
  { key: "Off-road", labelKey: "form_condition_offroad" },
  { key: "Mixed", labelKey: "form_condition_mixed" },
];

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "MAD", symbol: "MAD" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "CA$" },
  { code: "AED", symbol: "AED" },
  { code: "SAR", symbol: "SAR" },
  { code: "TRY", symbol: "₺" },
];

export default function NewDiagnoseScreen() {
  const { vehicleId: paramVehicleId, system: paramSystem } = useLocalSearchParams<{
    vehicleId?: string;
    system?: string;
  }>();

  const { data: vehicles } = useListVehicles();
  const queryClient = useQueryClient();
  const createDiagnosis = useCreateDiagnosis();
  const { language: selectedLanguage } = useLanguagePref();
  const { t, isRTL } = useI18n();

  const selectedLangInfo = LANGUAGES.find((l) => l.code === selectedLanguage) ?? LANGUAGES[0];

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    paramVehicleId ? parseInt(paramVehicleId) : null
  );
  const [symptoms, setSymptoms] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>(
    paramSystem ? [paramSystem] : []
  );
  const [errorCodes, setErrorCodes] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMimeType, setPhotoMimeType] = useState<string>("image/jpeg");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [previousIssues, setPreviousIssues] = useState("");

  const toggleSystem = (id: string) => {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not supported", "Camera capture is not available on web. Please use Choose Photo instead.");
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please allow camera access in your settings to take a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      setPhotoMimeType(result.assets[0].mimeType ?? "image/jpeg");
    }
  };

  const handleChoosePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Photo Library Permission Required",
        "Please allow photo library access in your settings to choose a photo.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      setPhotoMimeType(result.assets[0].mimeType ?? "image/jpeg");
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    setPhotoBase64(null);
    setPhotoMimeType("image/jpeg");
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId) {
      Alert.alert("Select Vehicle", "Please select a vehicle to diagnose");
      return;
    }
    if (!symptoms.trim() && !photoBase64) {
      Alert.alert("Add Input", "Please add a photo or describe the symptoms");
      return;
    }
    if (selectedSystems.length === 0) {
      Alert.alert("Select System", "Please select at least one affected system");
      return;
    }

    const requestData = {
      vehicleId: selectedVehicleId,
      symptoms: symptoms.trim() || "Photo provided",
      systems: selectedSystems,
      errorCodes: errorCodes.trim() || undefined,
      imageBase64: photoBase64 ?? undefined,
      imageMimeType: photoBase64 ? photoMimeType : undefined,
      language: selectedLanguage,
      currency: selectedCurrency,
      drivingConditions: selectedCondition ?? undefined,
      previousIssues: previousIssues.trim() || undefined,
    };

    console.log("[Diagnose] Submitting:", {
      vehicleId: requestData.vehicleId,
      symptomsLength: requestData.symptoms.length,
      systems: requestData.systems,
      hasImage: !!requestData.imageBase64,
      language: requestData.language,
    });

    setLoading(true);
    const TIMEOUT_MS = 20000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("TIMEOUT")), TIMEOUT_MS)
    );

    try {
      const result = await Promise.race([
        createDiagnosis.mutateAsync({ data: requestData }),
        timeoutPromise,
      ]);
      console.log("[Diagnose] Success, id:", result.id);
      queryClient.invalidateQueries({ queryKey: getListDiagnosesQueryKey() });
      showInterstitialAd().catch(() => {});
      router.replace({ pathname: "/diagnose/result", params: { id: result.id } });
    } catch (err: unknown) {
      console.log("[Diagnose] Error:", err);
      let title = "Error";
      let message = "Unable to analyze now. Please try again later.";
      if (err instanceof Error && err.message === "TIMEOUT") {
        title = "Timeout";
        message = "Request took too long (20s). Check your connection and try again.";
      } else if (err instanceof TypeError) {
        title = "No Internet";
        message = "No internet connection. Check your network and try again.";
      } else if (err instanceof ApiError) {
        if (err.status === 400) {
          const errData = err.data as { details?: Record<string, string[]>; error?: string } | null;
          const fields = errData?.details
            ? Object.entries(errData.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n")
            : null;
          title = "Invalid Input";
          message = fields ?? errData?.error ?? "Please check your input and try again.";
        } else if (err.status === 401 || err.status === 403) {
          title = "Auth Error";
          message = "Invalid API key or unauthorized. Please contact support.";
        } else if (err.status === 503) {
          title = "AI Unavailable";
          message = "AI service is temporarily unavailable. Please try again later.";
        } else if (err.status >= 500) {
          title = "Server Error";
          message = `Server error (${err.status}). Please try again later.`;
        } else {
          message = `Request failed with status ${err.status}. Please try again.`;
        }
      }
      Alert.alert(title, message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Select */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t("form_select_vehicle")}</Text>
        {!vehicles || vehicles.length === 0 ? (
          <Pressable style={[styles.addVehicleBtn, isRTL && styles.rowReverse]} onPress={() => router.push("/vehicle/add")}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
            <Text style={styles.addVehicleText}>{t("form_add_vehicle_first")}</Text>
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
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t("form_symptoms_label")}</Text>
        <TextInput
          style={[styles.textArea, isRTL && styles.textRight]}
          multiline
          numberOfLines={4}
          placeholder={t("form_symptoms_placeholder")}
          placeholderTextColor={Colors.textTertiary}
          value={symptoms}
          onChangeText={setSymptoms}
          textAlignVertical="top"
          textAlign={isRTL ? "right" : "left"}
        />

        {/* Photo */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
          {t("form_photo_label")} <Text style={styles.optional}>({t("form_optional")})</Text>
        </Text>
        {photoUri ? (
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            <Pressable
              style={styles.removePhotoBtn}
              onPress={handleRemovePhoto}
              testID="remove-photo-btn"
            >
              <Ionicons name="close-circle" size={26} color={Colors.accent} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.photoButtonRow}>
            <Pressable
              style={({ pressed }) => [styles.photoBtn, pressed && { opacity: 0.7 }]}
              onPress={handleTakePhoto}
              testID="take-photo-btn"
            >
              <Ionicons name="camera-outline" size={20} color={Colors.accent} />
              <Text style={styles.photoBtnText}>{t("form_take_photo")}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.photoBtn, pressed && { opacity: 0.7 }]}
              onPress={handleChoosePhoto}
              testID="choose-photo-btn"
            >
              <Ionicons name="image-outline" size={20} color={Colors.accent} />
              <Text style={styles.photoBtnText}>{t("form_choose_photo")}</Text>
            </Pressable>
          </View>
        )}

        {/* Systems */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t("form_systems_label")}</Text>
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
                {t(sys.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Driving Conditions */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
          {t("form_conditions_label")} <Text style={styles.optional}>({t("form_optional")})</Text>
        </Text>
        <View style={[styles.conditionRow, isRTL && styles.rowReverse]}>
          {DRIVING_CONDITION_KEYS.map((cond) => (
            <Pressable
              key={cond.key}
              style={[styles.conditionChip, selectedCondition === cond.key && styles.conditionChipSelected]}
              onPress={() => setSelectedCondition(selectedCondition === cond.key ? null : cond.key)}
            >
              <Text style={[styles.conditionChipText, selectedCondition === cond.key && styles.conditionChipTextSelected]}>
                {t(cond.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Previous Issues */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
          {t("form_prev_issues_label")} <Text style={styles.optional}>({t("form_optional")})</Text>
        </Text>
        <TextInput
          style={[styles.textArea, isRTL && styles.textRight]}
          multiline
          numberOfLines={3}
          placeholder={t("form_prev_issues_placeholder")}
          placeholderTextColor={Colors.textTertiary}
          value={previousIssues}
          onChangeText={setPreviousIssues}
          textAlignVertical="top"
          textAlign={isRTL ? "right" : "left"}
        />

        {/* Error Codes */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>
          {t("form_error_codes_label")} <Text style={styles.optional}>({t("form_optional")})</Text>
        </Text>
        <TextInput
          style={[styles.input, isRTL && styles.textRight]}
          placeholder={t("form_error_codes_placeholder")}
          placeholderTextColor={Colors.textTertiary}
          value={errorCodes}
          onChangeText={setErrorCodes}
          autoCapitalize="characters"
          textAlign={isRTL ? "right" : "left"}
        />

        {/* Currency */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRight]}>{t("form_currency_label")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyScroll}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c.code}
              style={[styles.currencyChip, selectedCurrency === c.code && styles.currencyChipSelected]}
              onPress={() => setSelectedCurrency(c.code)}
            >
              <Text style={[styles.currencySymbol, selectedCurrency === c.code && styles.currencySymbolSelected]}>
                {c.symbol}
              </Text>
              <Text style={[styles.currencyCode, selectedCurrency === c.code && styles.currencyCodeSelected]}>
                {c.code}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Language indicator */}
        <View style={[styles.languageRow, isRTL && styles.rowReverse]}>
          <Ionicons name="language-outline" size={14} color={Colors.textTertiary} />
          <Text style={styles.languageText}>
            {t("form_language_prefix")} <Text style={styles.languageHighlight}>{selectedLangInfo.native}</Text>
          </Text>
          <Pressable onPress={() => router.push("/screens/settings")}>
            <Text style={styles.languageChange}>{t("form_change")}</Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [styles.submitBtn, (loading || !symptoms) && styles.submitDisabled, pressed && { opacity: 0.9 }]}
          onPress={handleSubmit}
          disabled={loading}
          testID="diagnose-submit-btn"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="stethoscope" size={20} color="#fff" />
              <Text style={styles.submitText}>{t("form_diagnose_btn")}</Text>
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
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
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
    minHeight: 90,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 20,
  },
  photoButtonRow: {
    flexDirection: "row",
    gap: 12,
  },
  photoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.accent + "50",
  },
  photoBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.accent },
  photoPreviewContainer: {
    position: "relative",
    alignSelf: "flex-start",
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removePhotoBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: Colors.bg,
    borderRadius: 13,
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
  conditionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  conditionChip: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conditionChipSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  conditionChipText: { fontFamily: "Inter_500Medium", fontSize: 14, color: Colors.textSecondary },
  conditionChipTextSelected: { color: Colors.accent },
  currencyScroll: { marginBottom: 4 },
  currencyChip: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 60,
  },
  currencyChipSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  currencySymbol: { fontFamily: "Inter_700Bold", fontSize: 15, color: Colors.textSecondary },
  currencySymbolSelected: { color: Colors.accent },
  currencyCode: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  currencyCodeSelected: { color: Colors.accent },
  languageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  languageText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary },
  languageHighlight: { fontFamily: "Inter_600SemiBold", color: Colors.accent },
  languageChange: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.accent, textDecorationLine: "underline" },
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

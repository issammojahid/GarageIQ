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
import { useCreateDiagnosis, getListDiagnosesQueryKey, ApiError } from "@workspace/api-client-react";
import { useListVehicles } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import { showInterstitialAd } from "@/components/AdBanner";
import type { MaterialCommunityIconsName } from "@/types/icons";
import { LANGUAGES } from "@/hooks/useLanguagePref";
import { useI18n } from "@/i18n/TranslationContext";
import type { T } from "@/i18n/translations";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

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

  const { colors } = useTheme();
  const { data: vehicles } = useListVehicles();
  const queryClient = useQueryClient();
  const createDiagnosis = useCreateDiagnosis();
  const { t, tf, isRTL, language: selectedLanguage } = useI18n();

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

  const s = makeStyles(colors);

  const toggleSystem = (id: string) => {
    setSelectedSystems((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert(t("diag_camera_web_title"), t("diag_camera_web_msg"));
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("diag_camera_perm_title"), t("diag_camera_perm_msg"));
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
      Alert.alert(t("diag_media_perm_title"), t("diag_media_perm_msg"));
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
      Alert.alert(t("form_no_vehicle_title"), t("form_select_vehicle"));
      return;
    }
    if (!symptoms.trim() && !photoBase64) {
      Alert.alert(t("form_no_input_title"), t("form_no_input_msg"));
      return;
    }
    if (selectedSystems.length === 0) {
      Alert.alert(t("form_no_system_title"), t("form_no_system_msg"));
      return;
    }

    const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);
    const requestData = {
      vehicleId: selectedVehicleId,
      symptoms: symptoms.trim() || t("diag_photo_provided"),
      systems: selectedSystems,
      errorCodes: errorCodes.trim() || undefined,
      imageBase64: photoBase64 ?? undefined,
      imageMimeType: photoBase64 ? photoMimeType : undefined,
      language: selectedLanguage,
      currency: selectedCurrency,
      drivingConditions: selectedCondition ?? undefined,
      previousIssues: previousIssues.trim() || undefined,
      vehicleMake: selectedVehicle?.make,
      vehicleModel: selectedVehicle?.model,
      vehicleYear: selectedVehicle?.year,
      vehicleMileage: selectedVehicle?.mileage,
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
      let title = t("error");
      let message = t("diag_err_default_msg");
      if (err instanceof Error && err.message === "TIMEOUT") {
        title = t("diag_err_timeout_title");
        message = t("diag_err_timeout_msg");
      } else if (err instanceof TypeError) {
        title = t("diag_err_no_internet_title");
        message = t("diag_err_no_internet_msg");
      } else if (err instanceof ApiError) {
        if (err.status === 400) {
          const errData = err.data as { details?: Record<string, string[]>; error?: string } | null;
          const fields = errData?.details
            ? Object.entries(errData.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n")
            : null;
          title = t("diag_err_invalid_input_title");
          message = fields ?? errData?.error ?? t("diag_err_invalid_input_msg");
        } else if (err.status === 401 || err.status === 403) {
          title = t("diag_err_auth_title");
          message = t("diag_err_auth_msg");
        } else if (err.status === 503) {
          title = t("diag_err_ai_title");
          message = t("diag_err_ai_msg");
        } else if (err.status >= 500) {
          title = t("diag_err_server_title");
          message = tf("diag_err_server_msg", err.status);
        } else {
          message = tf("diag_err_request_failed_msg", err.status);
        }
      }
      Alert.alert(title, message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Select */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>{t("form_select_vehicle")}</Text>
        {!vehicles || vehicles.length === 0 ? (
          <Pressable style={[s.addVehicleBtn, isRTL && s.rowReverse]} onPress={() => router.push("/vehicle/add")}>
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            <Text style={s.addVehicleText}>{t("form_add_vehicle_first")}</Text>
          </Pressable>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.vehicleScroll}>
            {vehicles.map((v) => (
              <Pressable
                key={v.id}
                style={[s.vehicleChip, selectedVehicleId === v.id && s.vehicleChipSelected]}
                onPress={() => setSelectedVehicleId(v.id)}
              >
                <MaterialCommunityIcons
                  name="car"
                  size={16}
                  color={selectedVehicleId === v.id ? colors.accent : colors.textSecondary}
                />
                <Text style={[s.vehicleChipText, selectedVehicleId === v.id && s.vehicleChipTextSelected]}>
                  {v.year} {v.make} {v.model}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Symptoms */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>{t("form_symptoms_label")}</Text>
        <TextInput
          style={[s.textArea, isRTL && s.textRight]}
          multiline
          numberOfLines={4}
          placeholder={t("form_symptoms_placeholder")}
          placeholderTextColor={colors.textTertiary}
          value={symptoms}
          onChangeText={setSymptoms}
          textAlignVertical="top"
          textAlign={isRTL ? "right" : "left"}
        />

        {/* Photo */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>
          {t("form_photo_label")} <Text style={s.optional}>({t("form_optional")})</Text>
        </Text>
        {photoUri ? (
          <View style={s.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={s.photoPreview} resizeMode="cover" />
            <Pressable
              style={s.removePhotoBtn}
              onPress={handleRemovePhoto}
              testID="remove-photo-btn"
            >
              <Ionicons name="close-circle" size={26} color={colors.accent} />
            </Pressable>
          </View>
        ) : (
          <View style={s.photoButtonRow}>
            <Pressable
              style={({ pressed }) => [s.photoBtn, pressed && { opacity: 0.7 }]}
              onPress={handleTakePhoto}
              testID="take-photo-btn"
            >
              <Ionicons name="camera-outline" size={20} color={colors.accent} />
              <Text style={s.photoBtnText}>{t("form_take_photo")}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.photoBtn, pressed && { opacity: 0.7 }]}
              onPress={handleChoosePhoto}
              testID="choose-photo-btn"
            >
              <Ionicons name="image-outline" size={20} color={colors.accent} />
              <Text style={s.photoBtnText}>{t("form_choose_photo")}</Text>
            </Pressable>
          </View>
        )}

        {/* Systems */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>{t("form_systems_label")}</Text>
        <View style={s.systemGrid}>
          {SYSTEMS.map((sys) => (
            <Pressable
              key={sys.id}
              style={[s.systemChip, selectedSystems.includes(sys.id) && s.systemChipSelected]}
              onPress={() => toggleSystem(sys.id)}
            >
              <MaterialCommunityIcons
                name={sys.icon}
                size={18}
                color={selectedSystems.includes(sys.id) ? colors.accent : colors.textSecondary}
              />
              <Text
                style={[s.systemChipText, selectedSystems.includes(sys.id) && s.systemChipTextSelected]}
              >
                {t(sys.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Driving Conditions */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>
          {t("form_conditions_label")} <Text style={s.optional}>({t("form_optional")})</Text>
        </Text>
        <View style={[s.conditionRow, isRTL && s.rowReverse]}>
          {DRIVING_CONDITION_KEYS.map((cond) => (
            <Pressable
              key={cond.key}
              style={[s.conditionChip, selectedCondition === cond.key && s.conditionChipSelected]}
              onPress={() => setSelectedCondition(selectedCondition === cond.key ? null : cond.key)}
            >
              <Text style={[s.conditionChipText, selectedCondition === cond.key && s.conditionChipTextSelected]}>
                {t(cond.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Previous Issues */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>
          {t("form_prev_issues_label")} <Text style={s.optional}>({t("form_optional")})</Text>
        </Text>
        <TextInput
          style={[s.textArea, isRTL && s.textRight]}
          multiline
          numberOfLines={3}
          placeholder={t("form_prev_issues_placeholder")}
          placeholderTextColor={colors.textTertiary}
          value={previousIssues}
          onChangeText={setPreviousIssues}
          textAlignVertical="top"
          textAlign={isRTL ? "right" : "left"}
        />

        {/* Error Codes */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>
          {t("form_error_codes_label")} <Text style={s.optional}>({t("form_optional")})</Text>
        </Text>
        <TextInput
          style={[s.input, isRTL && s.textRight]}
          placeholder={t("form_error_codes_placeholder")}
          placeholderTextColor={colors.textTertiary}
          value={errorCodes}
          onChangeText={setErrorCodes}
          autoCapitalize="characters"
          textAlign={isRTL ? "right" : "left"}
        />

        {/* Currency */}
        <Text style={[s.sectionLabel, isRTL && s.textRight]}>{t("form_currency_label")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.currencyScroll}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c.code}
              style={[s.currencyChip, selectedCurrency === c.code && s.currencyChipSelected]}
              onPress={() => setSelectedCurrency(c.code)}
            >
              <Text style={[s.currencySymbol, selectedCurrency === c.code && s.currencySymbolSelected]}>
                {c.symbol}
              </Text>
              <Text style={[s.currencyCode, selectedCurrency === c.code && s.currencyCodeSelected]}>
                {c.code}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Language indicator */}
        <View style={[s.languageRow, isRTL && s.rowReverse]}>
          <Ionicons name="language-outline" size={14} color={colors.textTertiary} />
          <Text style={s.languageText}>
            {t("form_language_prefix")} <Text style={s.languageHighlight}>{selectedLangInfo.native}</Text>
          </Text>
          <Pressable onPress={() => router.push("/screens/settings")}>
            <Text style={s.languageChange}>{t("form_change")}</Text>
          </Pressable>
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [s.submitBtn, (loading || !symptoms) && s.submitDisabled, pressed && { opacity: 0.9 }]}
          onPress={handleSubmit}
          disabled={loading}
          testID="diagnose-submit-btn"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="stethoscope" size={20} color="#fff" />
              <Text style={s.submitText}>{t("form_diagnose_btn")}</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.text, marginBottom: 10, marginTop: 20 },
    optional: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textTertiary },
    vehicleScroll: { marginBottom: 4 },
    vehicleChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    vehicleChipSelected: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    vehicleChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    vehicleChipTextSelected: { color: colors.accent },
    addVehicleBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.accent + "40",
    },
    addVehicleText: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.accent },
    textArea: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      color: colors.text,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      minHeight: 90,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.accent + "50",
    },
    photoBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.accent },
    photoPreviewContainer: {
      position: "relative",
      alignSelf: "flex-start",
    },
    photoPreview: {
      width: 120,
      height: 120,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    removePhotoBtn: {
      position: "absolute",
      top: -10,
      right: -10,
      backgroundColor: colors.bg,
      borderRadius: 13,
    },
    systemGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    systemChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    systemChipSelected: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    systemChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    systemChipTextSelected: { color: colors.accent },
    conditionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    conditionChip: {
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: colors.border,
    },
    conditionChipSelected: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    conditionChipText: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.textSecondary },
    conditionChipTextSelected: { color: colors.accent },
    currencyScroll: { marginBottom: 4 },
    currencyChip: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 60,
    },
    currencyChipSelected: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    currencySymbol: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.textSecondary },
    currencySymbolSelected: { color: colors.accent },
    currencyCode: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textTertiary, marginTop: 2 },
    currencyCodeSelected: { color: colors.accent },
    languageRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 10,
      marginBottom: 4,
      flexWrap: "wrap",
    },
    languageText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary },
    languageHighlight: { fontFamily: "Inter_600SemiBold", color: colors.accent },
    languageChange: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.accent, textDecorationLine: "underline" },
    input: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      color: colors.text,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitBtn: {
      backgroundColor: colors.accent,
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
}

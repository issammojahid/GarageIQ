import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { useI18n } from "@/i18n/TranslationContext";
import { useCreateMechanic } from "@workspace/api-client-react";

const SPECIALTIES_KEYS = [
  "mech_spec_engine",
  "mech_spec_brakes",
  "mech_spec_transmission",
  "mech_spec_electrical",
  "mech_spec_suspension",
  "mech_spec_cooling",
  "mech_spec_ac",
  "mech_spec_tires",
  "mech_spec_bodywork",
  "mech_spec_general",
] as const;

const SPECIALTY_VALUES = [
  "Engine", "Brakes", "Transmission", "Electrical", "Suspension",
  "Cooling", "AC", "Tires", "Bodywork", "General",
];

export default function MechanicRegisterScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useI18n();
  const s = makeStyles(colors);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState("");
  const [description, setDescription] = useState("");
  const [editCode, setEditCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [done, setDone] = useState(false);

  const createMutation = useCreateMechanic();

  function toggleSpecialty(value: string) {
    setSelectedSpecs((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !city.trim()) {
      Alert.alert("", t("mech_err_required"));
      return;
    }
    if (editCode.trim().length < 4) {
      Alert.alert("", t("mech_err_code"));
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim() || undefined,
        specialties: selectedSpecs,
        workingHours: workingHours.trim() || undefined,
        description: description.trim() || undefined,
        editCode: editCode.trim(),
      },
      {
        onSuccess: () => {
          setDone(true);
        },
        onError: () => {
          Alert.alert("", t("mech_err_failed"));
        },
      }
    );
  }

  if (done) {
    return (
      <View style={s.successContainer}>
        <View style={s.successIcon}>
          <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
        </View>
        <Text style={s.successTitle}>{t("mech_success_title")}</Text>
        <Text style={s.successMsg}>{t("mech_success_msg")}</Text>
        <View style={s.pinReminder}>
          <Ionicons name="key-outline" size={20} color={colors.accent} />
          <Text style={s.pinReminderText}>{editCode}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [s.doneBtn, pressed && { opacity: 0.85 }]}
          onPress={() => router.back()}
        >
          <Text style={s.doneBtnText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.heroCard}>
          <MaterialCommunityIcons name="garage" size={36} color={colors.accent} />
          <Text style={[s.heroTitle, isRTL && s.textRight]}>{t("mech_register_title")}</Text>
          <Text style={[s.heroDesc, isRTL && s.textRight]}>{t("mech_register_desc")}</Text>
        </View>

        <View style={s.section}>
          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_name")} *</Text>
          <TextInput
            style={[s.input, isRTL && s.inputRTL]}
            placeholder={t("mech_ph_name")}
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            textAlign={isRTL ? "right" : "left"}
          />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_phone")} *</Text>
          <TextInput
            style={[s.input, isRTL && s.inputRTL]}
            placeholder={t("mech_ph_phone")}
            placeholderTextColor={colors.textTertiary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign={isRTL ? "right" : "left"}
          />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_city")} *</Text>
          <TextInput
            style={[s.input, isRTL && s.inputRTL]}
            placeholder={t("mech_ph_city")}
            placeholderTextColor={colors.textTertiary}
            value={city}
            onChangeText={setCity}
            textAlign={isRTL ? "right" : "left"}
          />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_address")}</Text>
          <TextInput
            style={[s.input, isRTL && s.inputRTL]}
            placeholder={t("mech_ph_address")}
            placeholderTextColor={colors.textTertiary}
            value={address}
            onChangeText={setAddress}
            textAlign={isRTL ? "right" : "left"}
          />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_hours")}</Text>
          <TextInput
            style={[s.input, isRTL && s.inputRTL]}
            placeholder={t("mech_ph_hours")}
            placeholderTextColor={colors.textTertiary}
            value={workingHours}
            onChangeText={setWorkingHours}
            textAlign={isRTL ? "right" : "left"}
          />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_description")}</Text>
          <TextInput
            style={[s.input, s.inputMultiline, isRTL && s.inputRTL]}
            placeholder={t("mech_ph_description")}
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            textAlign={isRTL ? "right" : "left"}
          />
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("mech_field_specialties")}</Text>
          <View style={s.specialtiesGrid}>
            {SPECIALTIES_KEYS.map((key, idx) => {
              const value = SPECIALTY_VALUES[idx];
              const selected = selectedSpecs.includes(value);
              return (
                <Pressable
                  key={value}
                  style={[s.specChip, selected && s.specChipActive]}
                  onPress={() => toggleSpecialty(value)}
                >
                  <Text style={[s.specChipText, selected && s.specChipTextActive]}>{t(key)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("mech_field_edit_code")}</Text>
          <Text style={[s.hintText, isRTL && s.textRight]}>{t("mech_field_edit_code_hint")}</Text>
          <View style={s.codeInputRow}>
            <TextInput
              style={[s.input, s.codeInput, isRTL && s.inputRTL]}
              placeholder={t("mech_ph_edit_code")}
              placeholderTextColor={colors.textTertiary}
              value={editCode}
              onChangeText={setEditCode}
              secureTextEntry={!showCode}
              keyboardType="default"
              textAlign={isRTL ? "right" : "left"}
            />
            <Pressable style={s.eyeBtn} onPress={() => setShowCode((v) => !v)}>
              <Ionicons name={showCode ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [s.submitBtn, pressed && { opacity: 0.85 }, createMutation.isPending && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="garage" size={20} color="#fff" />
              <Text style={s.submitBtnText}>{t("mech_submit")}</Text>
            </>
          )}
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 0 },
    heroCard: { backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: "center", gap: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
    heroTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: colors.text, textAlign: "center" },
    heroDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 21 },
    section: { marginBottom: 24 },
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.text, marginBottom: 6 },
    fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
    hintText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textTertiary, marginBottom: 10, lineHeight: 19 },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: "Inter_400Regular", fontSize: 15, color: colors.text },
    inputRTL: { textAlign: "right" },
    inputMultiline: { height: 88, paddingTop: 12 },
    codeInputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    codeInput: { flex: 1 },
    eyeBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, alignItems: "center", justifyContent: "center" },
    specialtiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
    specChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    specChipActive: { borderColor: colors.accent, backgroundColor: colors.accent + "20" },
    specChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    specChipTextActive: { color: colors.accent },
    submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
    textRight: { textAlign: "right" },
    successContainer: { flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
    successIcon: { marginBottom: 8 },
    successTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: "#F0F0F0", textAlign: "center" },
    successMsg: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#9CA3AF", textAlign: "center", lineHeight: 22 },
    pinReminder: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#E85D0420", borderWidth: 1, borderColor: "#E85D0450", borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, marginTop: 8 },
    pinReminderText: { fontFamily: "Inter_700Bold", fontSize: 22, color: "#E85D04", letterSpacing: 4 },
    doneBtn: { backgroundColor: "#E85D04", borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14, marginTop: 8 },
    doneBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  });
}

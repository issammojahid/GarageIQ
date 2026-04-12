import React, { useState, useCallback } from "react";
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
import * as Location from "expo-location";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { useI18n } from "@/i18n/TranslationContext";
import {
  useCreateMechanic,
  useUpdateMechanic,
  useDeleteMechanic,
  useGetMechanic,
  getListMechanicsQueryKey,
} from "@workspace/api-client-react";
import type { Mechanic } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

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

type TabKey = "register" | "manage";

export default function MechanicRegisterScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useI18n();
  const [tab, setTab] = useState<TabKey>("register");
  const s = makeStyles(colors);

  return (
    <View style={s.root}>
      <View style={s.tabs}>
        <Pressable
          style={[s.tabBtn, tab === "register" && s.tabBtnActive]}
          onPress={() => setTab("register")}
        >
          <Text style={[s.tabBtnText, tab === "register" && s.tabBtnTextActive]}>
            {t("mech_register_tab")}
          </Text>
        </Pressable>
        <Pressable
          style={[s.tabBtn, tab === "manage" && s.tabBtnActive]}
          onPress={() => setTab("manage")}
        >
          <Text style={[s.tabBtnText, tab === "manage" && s.tabBtnTextActive]}>
            {t("mech_manage_tab")}
          </Text>
        </Pressable>
      </View>

      {tab === "register" ? (
        <RegisterForm colors={colors} t={t} isRTL={isRTL} s={s} />
      ) : (
        <ManageForm colors={colors} t={t} isRTL={isRTL} s={s} />
      )}
    </View>
  );
}

function RegisterForm({
  colors,
  t,
  isRTL,
  s,
}: {
  colors: AppColors;
  t: ReturnType<typeof useI18n>["t"];
  isRTL: boolean;
  s: ReturnType<typeof makeStyles>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [workingHours, setWorkingHours] = useState("");
  const [description, setDescription] = useState("");
  const [editCode, setEditCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [createdMechanic, setCreatedMechanic] = useState<Mechanic | null>(null);

  const queryClient = useQueryClient();
  const createMutation = useCreateMechanic();

  function toggleSpecialty(value: string) {
    setSelectedSpecs((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  const autofillLocation = useCallback(async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("", t("mech_err_required"));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLatitude(loc.coords.latitude.toFixed(6));
      setLongitude(loc.coords.longitude.toFixed(6));
    } catch {
      Alert.alert("Error", t("mech_err_failed"));
    } finally {
      setLocLoading(false);
    }
  }, [t]);

  async function handleSubmit() {
    if (!name.trim() || !phone.trim() || !city.trim()) {
      Alert.alert("", t("mech_err_required"));
      return;
    }
    if (editCode.trim().length < 4) {
      Alert.alert("", t("mech_err_code"));
      return;
    }

    const lat = latitude.trim() ? parseFloat(latitude.trim()) : undefined;
    const lng = longitude.trim() ? parseFloat(longitude.trim()) : undefined;

    createMutation.mutate(
      {
        data: {
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim() || undefined,
          specialties: selectedSpecs,
          workingHours: workingHours.trim() || undefined,
          description: description.trim() || undefined,
          editCode: editCode.trim(),
          latitude: lat,
          longitude: lng,
        },
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListMechanicsQueryKey() });
          setCreatedMechanic(data);
        },
        onError: () => Alert.alert("", t("mech_err_failed")),
      }
    );
  }

  if (createdMechanic) {
    return (
      <View style={s.successContainer}>
        <MaterialCommunityIcons name="check-circle" size={64} color={colors.success} />
        <Text style={s.successTitle}>{t("mech_success_title")}</Text>
        <Text style={s.successMsg}>{t("mech_success_msg")}</Text>

        <View style={s.idCard}>
          <Text style={s.idCardLabel}>{t("mech_listing_id")}</Text>
          <Text style={s.idCardValue}>#{createdMechanic.id}</Text>
          <Text style={s.idCardHint}>{t("mech_listing_id_hint")}</Text>
        </View>

        <View style={s.pinReminder}>
          <Ionicons name="key-outline" size={20} color={colors.accent} />
          <Text style={s.pinLabel}>{t("mech_field_edit_code")}: </Text>
          <Text style={s.pinReminderText}>{editCode}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [s.doneBtn, pressed && { opacity: 0.85 }]}
          onPress={() => router.back()}
        >
          <Text style={s.doneBtnText}>{t("mech_done_btn")}</Text>
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
          <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_name")} placeholderTextColor={colors.textTertiary} value={name} onChangeText={setName} textAlign={isRTL ? "right" : "left"} />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_phone")} *</Text>
          <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_phone")} placeholderTextColor={colors.textTertiary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" textAlign={isRTL ? "right" : "left"} />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_city")} *</Text>
          <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_city")} placeholderTextColor={colors.textTertiary} value={city} onChangeText={setCity} textAlign={isRTL ? "right" : "left"} />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_address")}</Text>
          <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_address")} placeholderTextColor={colors.textTertiary} value={address} onChangeText={setAddress} textAlign={isRTL ? "right" : "left"} />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_hours")}</Text>
          <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_hours")} placeholderTextColor={colors.textTertiary} value={workingHours} onChangeText={setWorkingHours} textAlign={isRTL ? "right" : "left"} />

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_description")}</Text>
          <TextInput style={[s.input, s.inputMultiline, isRTL && s.inputRTL]} placeholder={t("mech_ph_description")} placeholderTextColor={colors.textTertiary} value={description} onChangeText={setDescription} multiline numberOfLines={3} textAlignVertical="top" textAlign={isRTL ? "right" : "left"} />
        </View>

        <View style={s.section}>
          <View style={[s.locationHeader, isRTL && s.rowReverse]}>
            <Text style={[s.sectionTitle, { flex: 1 }, isRTL && s.textRight]}>{t("mech_location_section")}</Text>
            <Pressable style={[s.locationBtn, locLoading && { opacity: 0.7 }]} onPress={autofillLocation} disabled={locLoading}>
              {locLoading ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <>
                  <Ionicons name="locate" size={14} color={colors.accent} />
                  <Text style={s.locationBtnText}>{t("mech_location_use")}</Text>
                </>
              )}
            </Pressable>
          </View>
          <View style={[s.latLngRow, isRTL && s.rowReverse]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.fieldLabelSmall, isRTL && s.textRight]}>{t("mech_field_latitude")}</Text>
              <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_latitude")} placeholderTextColor={colors.textTertiary} value={latitude} onChangeText={setLatitude} keyboardType="decimal-pad" textAlign={isRTL ? "right" : "left"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.fieldLabelSmall, isRTL && s.textRight]}>{t("mech_field_longitude")}</Text>
              <TextInput style={[s.input, isRTL && s.inputRTL]} placeholder={t("mech_ph_longitude")} placeholderTextColor={colors.textTertiary} value={longitude} onChangeText={setLongitude} keyboardType="decimal-pad" textAlign={isRTL ? "right" : "left"} />
            </View>
          </View>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, isRTL && s.textRight]}>{t("mech_field_specialties")}</Text>
          <View style={s.specialtiesGrid}>
            {SPECIALTIES_KEYS.map((key, idx) => {
              const value = SPECIALTY_VALUES[idx];
              const selected = selectedSpecs.includes(value);
              return (
                <Pressable key={value} style={[s.specChip, selected && s.specChipActive]} onPress={() => toggleSpecialty(value)}>
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
            <TextInput style={[s.input, s.codeInput, isRTL && s.inputRTL]} placeholder={t("mech_ph_edit_code")} placeholderTextColor={colors.textTertiary} value={editCode} onChangeText={setEditCode} secureTextEntry={!showCode} textAlign={isRTL ? "right" : "left"} />
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

function ManageForm({
  colors,
  t,
  isRTL,
  s,
}: {
  colors: AppColors;
  t: ReturnType<typeof useI18n>["t"];
  isRTL: boolean;
  s: ReturnType<typeof makeStyles>;
}) {
  const [lookupId, setLookupId] = useState("");
  const [editCode, setEditCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [description, setDescription] = useState("");

  const mechId = loaded && lookupId ? parseInt(lookupId) : 0;
  const { data: mechanic, isLoading: fetchLoading, refetch } = useGetMechanic(mechId, {
    query: { enabled: mechId > 0 && loaded },
  });

  const queryClient = useQueryClient();
  const updateMutation = useUpdateMechanic();
  const deleteMutation = useDeleteMechanic();

  function handleLoad() {
    if (!lookupId.trim()) return;
    setLoaded(true);
    setEditMode(false);
  }

  function enterEdit() {
    if (!mechanic) return;
    setName(mechanic.name);
    setPhone(mechanic.phone);
    setCity(mechanic.city);
    setAddress(mechanic.address ?? "");
    setWorkingHours(mechanic.workingHours ?? "");
    setDescription(mechanic.description ?? "");
    setEditMode(true);
  }

  function handleUpdate() {
    if (!mechanic || editCode.length < 4) {
      Alert.alert("", t("mech_err_code"));
      return;
    }
    updateMutation.mutate(
      {
        id: mechanic.id,
        data: {
          name: name.trim() || mechanic.name,
          phone: phone.trim() || mechanic.phone,
          city: city.trim() || mechanic.city,
          address: address.trim() || undefined,
          workingHours: workingHours.trim() || undefined,
          description: description.trim() || undefined,
          editCode: editCode.trim(),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMechanicsQueryKey() });
          Alert.alert("", t("mech_update_success"));
          setEditMode(false);
          refetch();
        },
        onError: () => Alert.alert("", t("mech_err_failed")),
      }
    );
  }

  function handleDelete() {
    if (!mechanic || editCode.length < 4) {
      Alert.alert("", t("mech_err_code"));
      return;
    }
    Alert.alert(t("mech_delete_btn"), t("mech_delete_confirm"), [
      { text: t("mech_cancel_btn"), style: "cancel" },
      {
        text: t("mech_delete_btn"),
        style: "destructive",
        onPress: () => {
          deleteMutation.mutate(
            { id: mechanic.id, data: { editCode: editCode.trim() } },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getListMechanicsQueryKey() });
                Alert.alert("", t("mech_delete_success"));
                setLoaded(false);
                setLookupId("");
                setEditCode("");
              },
              onError: () => Alert.alert("", t("mech_err_failed")),
            }
          );
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.heroCard}>
          <MaterialCommunityIcons name="wrench-cog" size={32} color={colors.accent} />
          <Text style={[s.heroTitle, isRTL && s.textRight]}>{t("mech_manage_title")}</Text>
          <Text style={[s.heroDesc, isRTL && s.textRight]}>{t("mech_manage_desc")}</Text>
        </View>

        <View style={s.section}>
          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_listing_id")}</Text>
          <Text style={[s.hintText, isRTL && s.textRight]}>{t("mech_listing_id_hint")}</Text>
          <View style={s.codeInputRow}>
            <TextInput
              style={[s.input, s.codeInput, isRTL && s.inputRTL]}
              placeholder={t("mech_listing_id_ph")}
              placeholderTextColor={colors.textTertiary}
              value={lookupId}
              onChangeText={(v) => { setLookupId(v); setLoaded(false); }}
              keyboardType="numeric"
              textAlign={isRTL ? "right" : "left"}
            />
            <Pressable style={s.loadBtn} onPress={handleLoad}>
              <Text style={s.loadBtnText}>{t("mech_load_btn")}</Text>
            </Pressable>
          </View>

          <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_edit_code")}</Text>
          <View style={s.codeInputRow}>
            <TextInput
              style={[s.input, s.codeInput, isRTL && s.inputRTL]}
              placeholder={t("mech_ph_edit_code")}
              placeholderTextColor={colors.textTertiary}
              value={editCode}
              onChangeText={setEditCode}
              secureTextEntry={!showCode}
              textAlign={isRTL ? "right" : "left"}
            />
            <Pressable style={s.eyeBtn} onPress={() => setShowCode((v) => !v)}>
              <Ionicons name={showCode ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {fetchLoading && <ActivityIndicator color={colors.accent} style={{ marginVertical: 24 }} />}

        {mechanic && !editMode && (
          <View style={s.mechPreview}>
            <Text style={s.mechPreviewName}>{mechanic.name}</Text>
            <Text style={s.mechPreviewSub}>{mechanic.city}{mechanic.address ? ` · ${mechanic.address}` : ""}</Text>
            <Text style={s.mechPreviewSub}>{mechanic.phone}</Text>
            {mechanic.workingHours ? <Text style={s.mechPreviewSub}>{mechanic.workingHours}</Text> : null}
            <View style={s.mechPreviewActions}>
              <Pressable style={s.editBtn} onPress={enterEdit}>
                <Ionicons name="pencil-outline" size={16} color={colors.accent} />
                <Text style={s.editBtnText}>{t("mech_update_btn")}</Text>
              </Pressable>
              <Pressable
                style={[s.deleteBtn, deleteMutation.isPending && { opacity: 0.6 }]}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : (
                  <>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                    <Text style={s.deleteBtnText}>{t("mech_delete_btn")}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {mechanic && editMode && (
          <View style={s.section}>
            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_name")}</Text>
            <TextInput style={[s.input, isRTL && s.inputRTL]} value={name} onChangeText={setName} placeholderTextColor={colors.textTertiary} textAlign={isRTL ? "right" : "left"} />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_phone")}</Text>
            <TextInput style={[s.input, isRTL && s.inputRTL]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.textTertiary} textAlign={isRTL ? "right" : "left"} />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_city")}</Text>
            <TextInput style={[s.input, isRTL && s.inputRTL]} value={city} onChangeText={setCity} placeholderTextColor={colors.textTertiary} textAlign={isRTL ? "right" : "left"} />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_address")}</Text>
            <TextInput style={[s.input, isRTL && s.inputRTL]} value={address} onChangeText={setAddress} placeholderTextColor={colors.textTertiary} textAlign={isRTL ? "right" : "left"} />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_hours")}</Text>
            <TextInput style={[s.input, isRTL && s.inputRTL]} value={workingHours} onChangeText={setWorkingHours} placeholderTextColor={colors.textTertiary} textAlign={isRTL ? "right" : "left"} />

            <Text style={[s.fieldLabel, isRTL && s.textRight]}>{t("mech_field_description")}</Text>
            <TextInput style={[s.input, s.inputMultiline, isRTL && s.inputRTL]} value={description} onChangeText={setDescription} multiline numberOfLines={3} textAlignVertical="top" placeholderTextColor={colors.textTertiary} textAlign={isRTL ? "right" : "left"} />

            <View style={[s.editFormActions, isRTL && s.rowReverse]}>
              <Pressable style={s.cancelBtn} onPress={() => setEditMode(false)}>
                <Text style={s.cancelBtnText}>{t("mech_cancel_btn")}</Text>
              </Pressable>
              <Pressable
                style={[s.saveBtn, updateMutation.isPending && { opacity: 0.6 }]}
                onPress={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : (
                  <Text style={s.saveBtnText}>{t("mech_update_btn")}</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
    tabBtn: { flex: 1, paddingVertical: 14, alignItems: "center" },
    tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
    tabBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.textSecondary },
    tabBtnTextActive: { color: colors.accent, fontFamily: "Inter_600SemiBold" },
    scroll: { flex: 1, backgroundColor: colors.bg },
    content: { padding: 20, gap: 0 },
    heroCard: { backgroundColor: colors.card, borderRadius: 20, padding: 24, alignItems: "center", gap: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
    heroTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.text, textAlign: "center" },
    heroDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
    section: { marginBottom: 24 },
    sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.text, marginBottom: 6 },
    fieldLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
    fieldLabelSmall: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
    hintText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textTertiary, marginBottom: 10, lineHeight: 19 },
    input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontFamily: "Inter_400Regular", fontSize: 15, color: colors.text },
    inputRTL: { textAlign: "right" },
    inputMultiline: { height: 88, paddingTop: 12 },
    codeInputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    codeInput: { flex: 1 },
    eyeBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 13, alignItems: "center", justifyContent: "center" },
    loadBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 13 },
    loadBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
    locationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
    locationBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent + "20", borderWidth: 1, borderColor: colors.accent + "50", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    locationBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.accent },
    latLngRow: { flexDirection: "row", gap: 12 },
    specialtiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
    specChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    specChipActive: { borderColor: colors.accent, backgroundColor: colors.accent + "20" },
    specChipText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    specChipTextActive: { color: colors.accent },
    submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, marginTop: 8 },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    mechPreview: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16, gap: 6 },
    mechPreviewName: { fontFamily: "Inter_700Bold", fontSize: 18, color: colors.text },
    mechPreviewSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary },
    mechPreviewActions: { flexDirection: "row", gap: 12, marginTop: 14 },
    editBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.accent, borderRadius: 12, paddingVertical: 12 },
    editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.accent },
    deleteBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 12 },
    deleteBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
    editFormActions: { flexDirection: "row", gap: 12, marginTop: 16 },
    cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    cancelBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.textSecondary },
    saveBtn: { flex: 1, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
    saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#fff" },
    successContainer: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
    successTitle: { fontFamily: "Inter_700Bold", fontSize: 24, color: colors.text, textAlign: "center" },
    successMsg: { fontFamily: "Inter_400Regular", fontSize: 15, color: colors.textSecondary, textAlign: "center", lineHeight: 22 },
    idCard: { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 6, width: "100%" },
    idCardLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    idCardValue: { fontFamily: "Inter_700Bold", fontSize: 36, color: colors.accent },
    idCardHint: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textTertiary, textAlign: "center", lineHeight: 18 },
    pinReminder: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.accent + "20", borderWidth: 1, borderColor: colors.accent + "50", borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14 },
    pinLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: colors.textSecondary },
    pinReminderText: { fontFamily: "Inter_700Bold", fontSize: 20, color: colors.accent, letterSpacing: 3 },
    doneBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14, marginTop: 8 },
    doneBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  });
}

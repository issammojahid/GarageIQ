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
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useGetVehicle, useUpdateVehicle, getListVehiclesQueryKey, getGetVehicleQueryKey } from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons, Feather } from "@expo/vector-icons";
import VehicleSelector, { VehicleSelection } from "@/components/VehicleSelector";
import { useI18n } from "@/i18n/TranslationContext";
import { pickVehiclePhoto } from "@/lib/vehiclePhotoStorage";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

export default function EditVehicleScreen() {
  const { t, tf } = useI18n();
  const { colors } = useTheme();
  const s = makeStyles(colors);

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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
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

  useEffect(() => {
    setPhotoUri(vehicle?.photo ?? null);
  }, [vehicle?.photo]);

  const handleSelectorConfirm = (selection: VehicleSelection) => {
    setMake(selection.make);
    setModel(selection.model);
    setYear(selection.year);
    setSelectorVisible(false);
  };

  const handlePickPhoto = () => {
    Alert.alert(t("vehicle_photo_pick_title"), undefined, [
      { text: t("vehicle_photo_camera"), onPress: () => launchPicker("camera") },
      { text: t("vehicle_photo_gallery"), onPress: () => launchPicker("gallery") },
      { text: t("cancel"), style: "cancel" },
    ]);
  };

  const launchPicker = async (source: "camera" | "gallery") => {
    const dataUri = await pickVehiclePhoto(source);
    if (dataUri) {
      setPhotoUri(dataUri);
      setPhotoRemoved(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUri(null);
    setPhotoRemoved(true);
  };

  const handleSave = async () => {
    const CURRENT_YEAR = new Date().getFullYear();
    if (!make.trim() || !model.trim()) {
      Alert.alert(t("vehicle_missing_info_title"), t("vehicle_missing_info_msg"));
      return;
    }
    if (isNaN(year) || year < 1980 || year > CURRENT_YEAR + 1) {
      Alert.alert(t("vehicle_invalid_year_title"), tf("vehicle_invalid_year_msg", CURRENT_YEAR + 1));
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
          photo: photoRemoved ? null : photoUri ?? undefined,
        },
      });
      queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetVehicleQueryKey(vehicleId) });
      router.back();
    } catch (e) {
      Alert.alert(t("error"), t("vehicle_update_error"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const vehicleLabel = make && model ? `${make} ${model} · ${year}` : null;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.photoSection}>
          <Pressable style={s.photoBtn} onPress={handlePickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.photoPreview} resizeMode="cover" />
            ) : (
              <View style={s.photoPlaceholder}>
                <Feather name="camera" size={28} color={colors.textTertiary} />
                <Text style={s.photoPlaceholderText}>{t("vehicle_photo_add")}</Text>
              </View>
            )}
          </Pressable>
          {photoUri && (
            <View style={s.photoActions}>
              <Pressable style={s.photoActionBtn} onPress={handlePickPhoto}>
                <Feather name="edit-2" size={14} color={colors.accent} />
                <Text style={s.photoActionText}>{t("vehicle_photo_change")}</Text>
              </Pressable>
              <Pressable style={s.photoActionBtn} onPress={handleRemovePhoto}>
                <Feather name="trash-2" size={14} color={colors.danger} />
                <Text style={[s.photoActionText, { color: colors.danger }]}>{t("vehicle_photo_remove")}</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={s.field}>
          <Text style={s.label}>{t("add_vehicle_field_vehicle")}</Text>
          <Pressable
            style={({ pressed }) => [s.selectorBtn, pressed && s.selectorBtnPressed]}
            onPress={() => setSelectorVisible(true)}
          >
            <View style={{ flex: 1 }}>
              {vehicleLabel ? (
                <Text style={s.selectorBtnValue} numberOfLines={1}>{vehicleLabel}</Text>
              ) : (
                <Text style={s.selectorBtnPlaceholder}>{t("add_vehicle_select_placeholder")}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        <View style={s.field}>
          <Text style={s.label}>{t("add_vehicle_field_mileage")}</Text>
          <TextInput
            style={s.input}
            placeholder="45000"
            placeholderTextColor={colors.textTertiary}
            value={mileage}
            onChangeText={setMileage}
            keyboardType="number-pad"
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>{t("add_vehicle_field_license")}</Text>
          <TextInput
            style={s.input}
            placeholder="12345 A 6"
            placeholderTextColor={colors.textTertiary}
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>{t("add_vehicle_field_color")}</Text>
          <TextInput
            style={s.input}
            placeholder="Black"
            placeholderTextColor={colors.textTertiary}
            value={color}
            onChangeText={setColor}
          />
        </View>

        <View style={s.field}>
          <Text style={s.label}>{t("add_vehicle_field_notes")}</Text>
          <TextInput
            style={[s.input, { minHeight: 80 }]}
            placeholder={t("vehicle_notes_any_info")}
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[s.saveBtn, loading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={s.saveBtnText}>{t("save_changes_btn")}</Text>
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

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
    content: { padding: 20, paddingBottom: 40 },
    photoSection: { alignItems: "center", marginBottom: 24 },
    photoBtn: {
      width: 120,
      height: 90,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: "dashed",
    },
    photoPreview: { width: "100%", height: "100%" },
    photoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6 },
    photoPlaceholderText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textTertiary },
    photoActions: { flexDirection: "row", gap: 16, marginTop: 10 },
    photoActionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
    photoActionText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.accent },
    field: { marginBottom: 16 },
    label: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text, marginBottom: 8 },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      color: colors.text,
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectorBtn: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 50,
    },
    selectorBtnPressed: { opacity: 0.75 },
    selectorBtnValue: {
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      color: colors.text,
    },
    selectorBtnPlaceholder: {
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      color: colors.textTertiary,
    },
    saveBtn: {
      backgroundColor: colors.accent,
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
}

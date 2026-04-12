import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  type DimensionValue,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useListDiagnoses } from "@workspace/api-client-react";
import {
  useListVehicles,
  useDeleteVehicle,
  getListVehiclesQueryKey,
  type Vehicle,
} from "@/hooks/useLocalVehicles";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/i18n/TranslationContext";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";

export default function GarageTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, tf, isRTL } = useI18n();
  const { colors } = useTheme();

  const queryClient = useQueryClient();
  const { data: vehicles, isLoading, refetch } = useListVehicles();
  const deleteVehicleMutation = useDeleteVehicle();
  const { data: allDiagnoses } = useListDiagnoses({});

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      t("delete_vehicle_title"),
      tf("delete_vehicle_msg", name),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicleMutation.mutateAsync({ id });
              queryClient.invalidateQueries({ queryKey: getListVehiclesQueryKey() });
            } catch (e) {
              Alert.alert(t("error"), t("delete_failed"));
            }
          },
        },
      ]
    );
  };

  const getVehicleDiagnoses = (vehicleId: number) =>
    allDiagnoses?.filter((d) => d.vehicleId === vehicleId) ?? [];

  const getHealthScore = (diags: ReturnType<typeof getVehicleDiagnoses>): number => {
    if (diags.length === 0) return 100;
    const recent = diags.slice(-5);
    const severityPenalty: Record<string, number> = { critical: 30, high: 20, medium: 10, low: 5 };
    const penalty = recent.reduce((acc, d) => {
      const sv = (d.result.severity ?? "low").toLowerCase();
      return acc + (severityPenalty[sv] ?? 5);
    }, 0);
    return Math.max(0, 100 - penalty);
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return colors.success;
    if (score >= 55) return colors.warning;
    return colors.danger;
  };

  const getHealthLabel = (score: number): string => {
    if (score >= 80) return t("health_good");
    if (score >= 55) return t("health_fair");
    return t("health_poor");
  };

  const s = makeStyles(colors);

  const renderItem = ({ item }: { item: Vehicle }) => {
    const diags = getVehicleDiagnoses(item.id);
    const lastDiag = diags[diags.length - 1];
    const vehicleName = `${item.year} ${item.make} ${item.model}`;
    const healthScore = getHealthScore(diags);
    const healthColor = getHealthColor(healthScore);
    const healthLabel = getHealthLabel(healthScore);
    const photoUri = item.photo;

    return (
      <View style={s.card}>
        <View style={[s.cardTop, isRTL && s.rowReverse]}>
          <View style={s.carIconWrap}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.vehiclePhoto} resizeMode="cover" />
            ) : (
              <MaterialCommunityIcons name="car" size={28} color={colors.accent} />
            )}
          </View>
          <View style={s.cardInfo}>
            <Text style={[s.vehicleName, isRTL && s.textRight]}>{vehicleName}</Text>
            {item.licensePlate && (
              <Text style={[s.licensePlate, isRTL && s.textRight]}>{item.licensePlate}</Text>
            )}
            <Text style={[s.mileage, isRTL && s.textRight]}>
              {item.mileage.toLocaleString()} km
            </Text>
          </View>
          <Pressable
            style={s.deleteBtn}
            onPress={() => handleDelete(item.id, vehicleName)}
            hitSlop={8}
          >
            <Feather name="trash-2" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Health Score */}
        <View style={[s.healthRow, isRTL && s.rowReverse]}>
          <Text style={s.healthLabel}>{t("garage_vehicle_health")}</Text>
          <View style={s.healthBarWrap}>
            <View style={[s.healthBar, { width: `${healthScore}%` as DimensionValue, backgroundColor: healthColor }]} />
          </View>
          <Text style={[s.healthValue, { color: healthColor }]}>{healthScore}% {healthLabel}</Text>
        </View>

        <View style={[s.statsRow, isRTL && s.rowReverse]}>
          <View style={s.stat}>
            <Text style={s.statValue}>{diags.length}</Text>
            <Text style={s.statLabel}>{t("garage_diagnoses")}</Text>
          </View>
          {lastDiag && (
            <View style={s.stat}>
              <Text style={s.statValue} numberOfLines={1}>
                {lastDiag.result?.severity ?? "—"}
              </Text>
              <Text style={s.statLabel}>{t("garage_last_severity")}</Text>
            </View>
          )}
          <View style={s.stat}>
            <Text style={s.statValue}>{item.color || "—"}</Text>
            <Text style={s.statLabel}>{t("garage_color")}</Text>
          </View>
        </View>

        <View style={[s.cardActions, isRTL && s.rowReverse]}>
          <Pressable
            style={[s.actionBtn, s.diagnoseBtn]}
            onPress={() => router.push({ pathname: "/diagnose/new", params: { vehicleId: item.id } })}
          >
            <MaterialCommunityIcons name="stethoscope" size={16} color={colors.accent} />
            <Text style={s.diagnoseBtnText}>{t("garage_diagnose")}</Text>
          </Pressable>
          <Pressable
            style={[s.actionBtn, s.editBtn]}
            onPress={() => router.push({ pathname: "/vehicle/edit", params: { id: item.id } })}
          >
            <Feather name="edit-2" size={16} color={colors.textSecondary} />
            <Text style={s.editBtnText}>{t("garage_edit")}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      <View style={[s.header, isRTL && s.rowReverse]}>
        <Text style={[s.headerTitle, isRTL && s.textRight]}>{t("garage_title")}</Text>
        <Pressable
          style={({ pressed }) => [s.addBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.push("/vehicle/add")}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={vehicles ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[s.list, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(vehicles && vehicles.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="car-outline" size={56} color={colors.textTertiary} />
              <Text style={s.emptyTitle}>{t("garage_no_vehicles")}</Text>
              <Text style={[s.emptyDesc, isRTL && s.textRight]}>
                {t("garage_no_vehicles_desc")}
              </Text>
              <Pressable
                style={s.emptyBtn}
                onPress={() => router.push("/vehicle/add")}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={s.emptyBtnText}>{t("garage_add_vehicle")}</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
    rowReverse: { flexDirection: "row-reverse" },
    textRight: { textAlign: "right" },
    headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: colors.text },
    addBtn: { backgroundColor: colors.accent, width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    list: { paddingHorizontal: 20, paddingTop: 4 },
    card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
    carIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden" },
    vehiclePhoto: { width: 56, height: 56 },
    cardInfo: { flex: 1 },
    vehicleName: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.text, marginBottom: 2 },
    licensePlate: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.accent, backgroundColor: colors.accent + "15", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 4 },
    mileage: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    deleteBtn: { padding: 8 },
    healthRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    healthLabel: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary, width: 100 },
    healthBarWrap: { flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: "hidden" },
    healthBar: { height: 8, borderRadius: 4 },
    healthValue: { fontFamily: "Inter_600SemiBold", fontSize: 12, width: 72, textAlign: "right" },
    statsRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 12, marginBottom: 12, gap: 8 },
    stat: { flex: 1, alignItems: "center" },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 16, color: colors.text, textTransform: "capitalize" },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: colors.textSecondary, marginTop: 2 },
    cardActions: { flexDirection: "row", gap: 10 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10 },
    diagnoseBtn: { backgroundColor: colors.accent + "15", borderWidth: 1, borderColor: colors.accent + "40" },
    diagnoseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.accent },
    editBtn: { backgroundColor: colors.card2, borderWidth: 1, borderColor: colors.border },
    editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.textSecondary },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 40 },
    emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: colors.text, marginTop: 16, marginBottom: 8 },
    emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
    emptyBtn: { marginTop: 20, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, flexDirection: "row", gap: 8, alignItems: "center" },
    emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
  });
}

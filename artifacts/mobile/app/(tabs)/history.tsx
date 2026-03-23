import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListDiagnoses, useListVehicles, type Diagnosis } from "@workspace/api-client-react";
import { BannerAd } from "@/components/AdBanner";
import { useI18n } from "@/i18n/TranslationContext";

export default function HistoryTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;
  const { t, isRTL } = useI18n();

  const { data: diagnoses, isLoading, refetch } = useListDiagnoses({});
  const { data: vehicles } = useListVehicles();

  const SEV_CONFIG = {
    low: { color: Colors.success, label: t("sev_low") },
    medium: { color: Colors.warning, label: t("sev_medium") },
    high: { color: "#F97316", label: t("sev_high") },
    critical: { color: Colors.danger, label: t("sev_critical") },
  };

  const getVehicleName = (vehicleId: number) => {
    const v = vehicles?.find((v) => v.id === vehicleId);
    return v ? `${v.year} ${v.make} ${v.model}` : t("unknown_vehicle");
  };

  const renderItem = ({ item }: { item: Diagnosis }) => {
    const sev = SEV_CONFIG[item.result?.severity as keyof typeof SEV_CONFIG] || SEV_CONFIG.medium;
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
        onPress={() => router.push({ pathname: "/diagnose/result", params: { id: item.id } })}
      >
        <View style={[styles.cardHeader, isRTL && styles.rowReverse]}>
          <View style={[styles.vehicleInfo, isRTL && styles.rowReverse]}>
            <MaterialCommunityIcons name="car" size={16} color={Colors.textSecondary} />
            <Text style={styles.vehicleName}>{getVehicleName(item.vehicleId)}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: sev.color + "20" }]}>
            <View style={[styles.severityDot, { backgroundColor: sev.color }]} />
            <Text style={[styles.severityText, { color: sev.color }]}>{sev.label}</Text>
          </View>
        </View>
        <Text style={[styles.summary, isRTL && styles.textRight]} numberOfLines={2}>{item.result?.summary}</Text>
        <View style={[styles.cardFooter, isRTL && styles.rowReverse]}>
          <Text style={styles.dateText}>{date}</Text>
          <View style={[styles.systemTags, isRTL && styles.rowReverse]}>
            {(item.systems || []).slice(0, 2).map((s: string) => (
              <View key={s} style={styles.tag}>
                <Text style={styles.tagText}>{s}</Text>
              </View>
            ))}
            {(item.systems || []).length > 2 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{item.systems.length - 2}</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={[styles.header, isRTL && styles.rowReverse]}>
        <Text style={[styles.headerTitle, isRTL && styles.textRight]}>{t("history_title")}</Text>
        <Text style={styles.headerCount}>
          {diagnoses?.length ?? 0} {t("history_diagnoses")}
        </Text>
      </View>

      <BannerAd size="banner" />

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={diagnoses?.slice().reverse() ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(diagnoses && diagnoses.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="clock" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>{t("history_empty_title")}</Text>
              <Text style={[styles.emptyDesc, isRTL && styles.textRight]}>
                {t("history_empty_desc")}
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => router.push("/diagnose/new")}
              >
                <Text style={styles.emptyBtnText}>{t("history_start_first")}</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, paddingTop: 12 },
  rowReverse: { flexDirection: "row-reverse" },
  textRight: { textAlign: "right" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.text },
  headerCount: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  vehicleInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  vehicleName: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  severityBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  summary: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textTertiary },
  systemTags: { flexDirection: "row", gap: 6 },
  tag: { backgroundColor: Colors.card2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 },
  emptyBtn: { marginTop: 20, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});

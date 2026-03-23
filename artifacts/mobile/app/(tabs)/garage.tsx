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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useListVehicles, useDeleteVehicle, useListDiagnoses } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function GarageTab() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top;

  const queryClient = useQueryClient();
  const { data: vehicles, isLoading, refetch } = useListVehicles();
  const deleteVehicleMutation = useDeleteVehicle();
  const { data: allDiagnoses } = useListDiagnoses({});

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Vehicle",
      `Are you sure you want to delete ${name}? All associated data will be lost.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicleMutation.mutateAsync({ id });
              queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
            } catch (e) {
              Alert.alert("Error", "Failed to delete vehicle");
            }
          },
        },
      ]
    );
  };

  const getVehicleDiagnoses = (vehicleId: number) =>
    allDiagnoses?.filter((d) => d.vehicleId === vehicleId) ?? [];

  const renderItem = ({ item }: { item: any }) => {
    const diags = getVehicleDiagnoses(item.id);
    const lastDiag = diags[diags.length - 1];
    const vehicleName = `${item.year} ${item.make} ${item.model}`;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.carIconWrap}>
            <MaterialCommunityIcons name="car" size={28} color={Colors.accent} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.vehicleName}>{vehicleName}</Text>
            {item.licensePlate && (
              <Text style={styles.licensePlate}>{item.licensePlate}</Text>
            )}
            <Text style={styles.mileage}>
              {item.mileage.toLocaleString()} km
            </Text>
          </View>
          <Pressable
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, vehicleName)}
            hitSlop={8}
          >
            <Feather name="trash-2" size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{diags.length}</Text>
            <Text style={styles.statLabel}>Diagnoses</Text>
          </View>
          {lastDiag && (
            <View style={styles.stat}>
              <Text style={styles.statValue} numberOfLines={1}>
                {lastDiag.result?.severity ?? "—"}
              </Text>
              <Text style={styles.statLabel}>Last Severity</Text>
            </View>
          )}
          <View style={styles.stat}>
            <Text style={styles.statValue}>{item.color || "—"}</Text>
            <Text style={styles.statLabel}>Color</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Pressable
            style={[styles.actionBtn, styles.diagnoseBtn]}
            onPress={() => router.push({ pathname: "/diagnose/new", params: { vehicleId: item.id } })}
          >
            <MaterialCommunityIcons name="stethoscope" size={16} color={Colors.accent} />
            <Text style={styles.diagnoseBtnText}>Diagnose</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => router.push({ pathname: "/vehicle/edit", params: { id: item.id } })}
          >
            <Feather name="edit-2" size={16} color={Colors.textSecondary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Garage</Text>
        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
          onPress={() => router.push("/vehicle/add")}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={vehicles ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: tabBarHeight + 20 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!(vehicles && vehicles.length > 0)}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={56} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No vehicles yet</Text>
              <Text style={styles.emptyDesc}>
                Add your first vehicle to start diagnosing and tracking maintenance
              </Text>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => router.push("/vehicle/add")}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Add Vehicle</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 26, color: Colors.text },
  addBtn: {
    backgroundColor: Colors.accent,
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  carIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  vehicleName: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text, marginBottom: 2 },
  licensePlate: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.accent,
    backgroundColor: Colors.accent + "15",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  mileage: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  deleteBtn: { padding: 8 },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 8,
  },
  stat: { flex: 1, alignItems: "center" },
  statValue: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.text, textTransform: "capitalize" },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  diagnoseBtn: { backgroundColor: Colors.accent + "15", borderWidth: 1, borderColor: Colors.accent + "40" },
  diagnoseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.accent },
  editBtn: { backgroundColor: Colors.card2, borderWidth: 1, borderColor: Colors.border },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center", lineHeight: 20 },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  emptyBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff" },
});

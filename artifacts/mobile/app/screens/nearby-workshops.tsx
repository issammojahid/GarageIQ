import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const MOCK_WORKSHOPS = [
  { id: "1", name: "AutoPro Service Center", rating: 4.8, reviews: 342, distance: "0.8 km", address: "123 Main St", specialties: ["Engine", "Brakes", "AC"], open: true, phone: "+1234567890" },
  { id: "2", name: "Elite Auto Garage", rating: 4.6, reviews: 218, distance: "1.2 km", address: "456 Oak Ave", specialties: ["Transmission", "Electrical", "Suspension"], open: true, phone: "+1234567891" },
  { id: "3", name: "Quick Fix Auto", rating: 4.3, reviews: 156, distance: "1.9 km", address: "789 Elm Rd", specialties: ["Oil Change", "Tires", "General"], open: false, phone: "+1234567892" },
  { id: "4", name: "Master Tech Garage", rating: 4.9, reviews: 512, distance: "2.4 km", address: "321 Pine Blvd", specialties: ["BMW", "Mercedes", "Audi"], open: true, phone: "+1234567893" },
  { id: "5", name: "City Auto Center", rating: 4.4, reviews: 289, distance: "3.1 km", address: "654 Maple Dr", specialties: ["Engine", "Transmission", "General"], open: true, phone: "+1234567894" },
];

export default function NearbyWorkshopsScreen() {
  const [loading, setLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");

  useEffect(() => {
    setTimeout(() => {
      setLocationGranted(true);
      setLoading(false);
    }, 1200);
  }, []);

  const workshops = [...MOCK_WORKSHOPS].sort((a, b) =>
    sortBy === "rating" ? b.rating - a.rating : parseFloat(a.distance) - parseFloat(b.distance)
  );

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Finding workshops near you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <MaterialCommunityIcons name="map-marker-radius" size={48} color={Colors.accent} />
        <Text style={styles.mapText}>Workshops in your area</Text>
        <Text style={styles.mapSubText}>5 results found nearby</Text>
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <Pressable
          style={[styles.sortBtn, sortBy === "distance" && styles.sortBtnActive]}
          onPress={() => setSortBy("distance")}
        >
          <Text style={[styles.sortBtnText, sortBy === "distance" && styles.sortBtnTextActive]}>Distance</Text>
        </Pressable>
        <Pressable
          style={[styles.sortBtn, sortBy === "rating" && styles.sortBtnActive]}
          onPress={() => setSortBy("rating")}
        >
          <Text style={[styles.sortBtnText, sortBy === "rating" && styles.sortBtnTextActive]}>Rating</Text>
        </Pressable>
      </View>

      <FlatList
        data={workshops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled
        renderItem={({ item }) => (
          <View style={styles.workshopCard}>
            <View style={styles.workshopTop}>
              <View style={styles.workshopIconWrap}>
                <MaterialCommunityIcons name="garage" size={24} color={Colors.accent} />
              </View>
              <View style={styles.workshopInfo}>
                <Text style={styles.workshopName}>{item.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.open ? Colors.success + "20" : Colors.danger + "20" }]}>
                    <Text style={[styles.statusText, { color: item.open ? Colors.success : Colors.danger }]}>
                      {item.open ? "Open" : "Closed"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workshopAddress}>{item.address} · {item.distance}</Text>
              </View>
            </View>

            <View style={styles.specialties}>
              {item.specialties.map((s) => (
                <View key={s} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{s}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
              onPress={() => handleCall(item.phone)}
            >
              <Ionicons name="call-outline" size={16} color={Colors.accent} />
              <Text style={styles.callBtnText}>Call Workshop</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, backgroundColor: Colors.bg },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 15, color: Colors.textSecondary },
  mapPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: Colors.card, margin: 16, borderRadius: 16, paddingVertical: 30, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  mapText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text },
  mapSubText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  sortRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  sortLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  sortBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  sortBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  sortBtnTextActive: { color: Colors.accent },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  workshopCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  workshopTop: { flexDirection: "row", gap: 12, marginBottom: 10 },
  workshopIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.accent + "15", alignItems: "center", justifyContent: "center" },
  workshopInfo: { flex: 1 },
  workshopName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.text, marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  ratingText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.text },
  reviewsText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  statusBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  workshopAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  specialties: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 12 },
  specialtyTag: { backgroundColor: Colors.card2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  specialtyText: { fontFamily: "Inter_500Medium", fontSize: 12, color: Colors.textSecondary },
  callBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: Colors.accent, borderRadius: 10, paddingVertical: 10 },
  callBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.accent },
});

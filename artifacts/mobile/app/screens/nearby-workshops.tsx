import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Colors from "@/constants/colors";
import { BannerAd } from "@/components/AdBanner";

const WORKSHOPS_BY_REGION = [
  { id: "1", name: "AutoPro Service Center", rating: 4.8, reviews: 342, distanceKm: 0.8, lat: 0.008, lng: 0.005, address: "123 Main St", specialties: ["Engine", "Brakes", "AC"], open: true, phone: "+1-555-0101" },
  { id: "2", name: "Elite Auto Garage", rating: 4.6, reviews: 218, distanceKm: 1.2, lat: 0.012, lng: -0.003, address: "456 Oak Ave", specialties: ["Transmission", "Electrical", "Suspension"], open: true, phone: "+1-555-0102" },
  { id: "3", name: "Quick Fix Auto", rating: 4.3, reviews: 156, distanceKm: 1.9, lat: -0.015, lng: 0.01, address: "789 Elm Rd", specialties: ["Oil Change", "Tires", "General"], open: false, phone: "+1-555-0103" },
  { id: "4", name: "Master Tech Garage", rating: 4.9, reviews: 512, distanceKm: 2.4, lat: 0.022, lng: 0.018, address: "321 Pine Blvd", specialties: ["BMW", "Mercedes", "Audi"], open: true, phone: "+1-555-0104" },
  { id: "5", name: "City Auto Center", rating: 4.4, reviews: 289, distanceKm: 3.1, lat: -0.03, lng: -0.02, address: "654 Maple Dr", specialties: ["Engine", "Transmission", "General"], open: true, phone: "+1-555-0105" },
  { id: "6", name: "Premium Motors Workshop", rating: 4.7, reviews: 401, distanceKm: 3.8, lat: 0.035, lng: 0.025, address: "987 Cedar Lane", specialties: ["Luxury", "Diagnostics", "Bodywork"], open: false, phone: "+1-555-0106" },
];

type SortKey = "distance" | "rating";
type Workshop = typeof WORKSHOPS_BY_REGION[0];

export default function NearbyWorkshopsScreen() {
  const [locationState, setLocationState] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("distance");
  const [searchQuery] = useState("");

  const requestLocation = useCallback(async () => {
    setLocationState("loading");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationState("denied");
        Alert.alert(
          "Location Required",
          "Please allow location access to find workshops near you.",
          [{ text: "OK" }]
        );
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLocationState("granted");
    } catch {
      setLocationState("denied");
      Alert.alert("Error", "Could not get your location. Please try again.");
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const getDistanceKm = (workshop: Workshop): number => {
    if (!userLocation) return workshop.distanceKm;
    const R = 6371;
    const dLat = (workshop.lat * Math.PI) / 180;
    const dLon = (workshop.lng * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos((userLocation.latitude + workshop.lat) * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return Math.sqrt(a) * R * 2 || workshop.distanceKm;
  };

  const workshops = [...WORKSHOPS_BY_REGION]
    .map((w) => ({ ...w, actualDistance: getDistanceKm(w) }))
    .sort((a, b) => sortBy === "rating" ? b.rating - a.rating : a.actualDistance - b.actualDistance);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Cannot call", "Your device doesn't support phone calls from this app.");
    });
  };

  const handleDirections = (workshop: typeof workshops[0]) => {
    const lat = userLocation ? userLocation.latitude + workshop.lat : 0;
    const lng = userLocation ? userLocation.longitude + workshop.lng : 0;
    const url = `https://maps.google.com/?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open maps.");
    });
  };

  if (locationState === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Getting your location...</Text>
        <Text style={styles.loadingSubText}>Finding workshops near you</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Location Status Banner */}
      {locationState === "granted" && userLocation && (
        <View style={styles.locationBanner}>
          <Ionicons name="location" size={14} color={Colors.success} />
          <Text style={styles.locationText}>
            Showing workshops near {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      {locationState === "denied" && (
        <Pressable style={styles.locationDeniedBanner} onPress={requestLocation}>
          <Ionicons name="location-outline" size={14} color={Colors.warning} />
          <Text style={styles.locationDeniedText}>Location access denied — tap to retry</Text>
        </Pressable>
      )}

      {/* Map Placeholder with real coords */}
      <View style={styles.mapPlaceholder}>
        <MaterialCommunityIcons name="map-marker-radius" size={40} color={Colors.accent} />
        <Text style={styles.mapTitle}>{workshops.length} Workshops Found</Text>
        <Text style={styles.mapSubText}>
          {userLocation ? "Based on your current location" : "Using approximate location"}
        </Text>
      </View>

      {/* Sort Controls */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <Pressable style={[styles.sortBtn, sortBy === "distance" && styles.sortBtnActive]} onPress={() => setSortBy("distance")}>
          <Text style={[styles.sortBtnText, sortBy === "distance" && styles.sortBtnTextActive]}>Distance</Text>
        </Pressable>
        <Pressable style={[styles.sortBtn, sortBy === "rating" && styles.sortBtnActive]} onPress={() => setSortBy("rating")}>
          <Text style={[styles.sortBtnText, sortBy === "rating" && styles.sortBtnTextActive]}>Rating</Text>
        </Pressable>
      </View>

      <FlatList
        data={workshops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled
        ListHeaderComponent={
          <View style={styles.adWrap}>
            <BannerAd size="banner" />
          </View>
        }
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
                  <Text style={styles.reviewsText}>({item.reviews})</Text>
                  <View style={[styles.statusBadge, { backgroundColor: item.open ? Colors.success + "20" : Colors.danger + "20" }]}>
                    <Text style={[styles.statusText, { color: item.open ? Colors.success : Colors.danger }]}>
                      {item.open ? "Open" : "Closed"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.workshopAddress}>
                  {item.address} · {item.actualDistance.toFixed(1)} km away
                </Text>
              </View>
            </View>

            <View style={styles.specialties}>
              {item.specialties.map((s) => (
                <View key={s} style={styles.specialtyTag}>
                  <Text style={styles.specialtyText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardActions}>
              <Pressable
                style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
                onPress={() => handleCall(item.phone)}
              >
                <Ionicons name="call-outline" size={16} color={Colors.accent} />
                <Text style={styles.callBtnText}>Call</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.directionsBtn, pressed && { opacity: 0.85 }]}
                onPress={() => handleDirections(item)}
              >
                <Ionicons name="navigate-outline" size={16} color={Colors.text} />
                <Text style={styles.directionsBtnText}>Directions</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <MaterialCommunityIcons name="garage-alert" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No workshops found near you</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: Colors.bg, padding: 24 },
  loadingText: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: Colors.text },
  loadingSubText: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: Colors.textSecondary, textAlign: "center" },
  locationBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.success + "15", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.success + "30" },
  locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.success },
  locationDeniedBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.warning + "15", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.warning + "30" },
  locationDeniedText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.warning },
  mapPlaceholder: { alignItems: "center", justifyContent: "center", backgroundColor: Colors.card, margin: 16, borderRadius: 16, paddingVertical: 24, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  mapTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.text },
  mapSubText: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.textSecondary },
  sortRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  sortLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textSecondary },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.card },
  sortBtnActive: { borderColor: Colors.accent, backgroundColor: Colors.accent + "15" },
  sortBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.textSecondary },
  sortBtnTextActive: { color: Colors.accent },
  adWrap: { marginBottom: 12, alignItems: "center" },
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
  cardActions: { flexDirection: "row", gap: 10 },
  callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: Colors.accent, borderRadius: 10, paddingVertical: 10 },
  callBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.accent },
  directionsBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 10, backgroundColor: Colors.card2 },
  directionsBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.text },
});

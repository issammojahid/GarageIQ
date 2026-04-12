import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { BannerAd } from "@/components/AdBanner";

const WORKSHOPS_BY_REGION = [
  { id: "1", name: "AutoPro Service Center", rating: 4.8, reviews: 342, latOffset: 0.008, lngOffset: 0.005, address: "123 Main St", specialties: ["Engine", "Brakes", "AC"], open: true, phone: "+1-555-0101" },
  { id: "2", name: "Elite Auto Garage", rating: 4.6, reviews: 218, latOffset: 0.012, lngOffset: -0.003, address: "456 Oak Ave", specialties: ["Transmission", "Electrical", "Suspension"], open: true, phone: "+1-555-0102" },
  { id: "3", name: "Quick Fix Auto", rating: 4.3, reviews: 156, latOffset: -0.015, lngOffset: 0.01, address: "789 Elm Rd", specialties: ["Oil Change", "Tires", "General"], open: false, phone: "+1-555-0103" },
  { id: "4", name: "Master Tech Garage", rating: 4.9, reviews: 512, latOffset: 0.022, lngOffset: 0.018, address: "321 Pine Blvd", specialties: ["BMW", "Mercedes", "Audi"], open: true, phone: "+1-555-0104" },
  { id: "5", name: "City Auto Center", rating: 4.4, reviews: 289, latOffset: -0.03, lngOffset: -0.02, address: "654 Maple Dr", specialties: ["Engine", "Transmission", "General"], open: true, phone: "+1-555-0105" },
  { id: "6", name: "Premium Motors Workshop", rating: 4.7, reviews: 401, latOffset: 0.035, lngOffset: 0.025, address: "987 Cedar Lane", specialties: ["Luxury", "Diagnostics", "Bodywork"], open: false, phone: "+1-555-0106" },
];

type SortKey = "distance" | "rating";
type Workshop = typeof WORKSHOPS_BY_REGION[0] & { actualDistance: number };

function getDistanceKm(latOffset: number, lngOffset: number, userLat: number, userLng: number): number {
  const R = 6371;
  const lat2 = userLat + latOffset;
  const lng2 = userLng + lngOffset;
  const dLat = ((lat2 - userLat) * Math.PI) / 180;
  const dLng = ((lng2 - userLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function buildMapHtml(userLat: number, userLng: number, workshops: Workshop[]) {
  const markers = workshops
    .map(
      (w, i) =>
        `L.marker([${userLat + w.latOffset}, ${userLng + w.lngOffset}], {
          icon: L.divIcon({
            className: '',
            html: '<div style="background:#E85D04;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${i + 1}</div>',
            iconSize:[28,28],iconAnchor:[14,14]
          })
        }).bindPopup('<b>${w.name.replace(/'/g, "\\'")}</b><br>${w.address.replace(/'/g, "\\'")} · ${w.actualDistance.toFixed(1)}km');`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  * { margin:0;padding:0;box-sizing:border-box; }
  html,body,#map { width:100%;height:100%;background:#0A0A0A; }
  .leaflet-popup-content-wrapper { background:#1A1A1A;color:#F0F0F0;border:1px solid #2A2A2A;border-radius:10px; }
  .leaflet-popup-tip { background:#1A1A1A; }
  .leaflet-popup-content b { color:#E85D04; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', { zoomControl: true }).setView([${userLat}, ${userLng}], 13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CartoDB',
    maxZoom: 19
  }).addTo(map);
  L.marker([${userLat}, ${userLng}], {
    icon: L.divIcon({
      className: '',
      html: '<div style="background:#3B82F6;color:#fff;border-radius:50%;width:20px;height:20px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>',
      iconSize:[20,20],iconAnchor:[10,10]
    })
  }).bindPopup('<b>You are here</b>').addTo(map);
  ${markers}
</script>
</body>
</html>`;
}

export default function NearbyWorkshopsScreen() {
  const { colors } = useTheme();
  const [locationState, setLocationState] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("distance");
  const [showMap, setShowMap] = useState(false);
  const webViewRef = useRef<WebView>(null);

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
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocationState("granted");
    } catch {
      setLocationState("denied");
      Alert.alert("Error", "Could not get your location. Please try again.");
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const fallbackLat = 48.8566;
  const fallbackLng = 2.3522;
  const lat = userLocation?.latitude ?? fallbackLat;
  const lng = userLocation?.longitude ?? fallbackLng;

  const workshops: Workshop[] = WORKSHOPS_BY_REGION.map((w) => ({
    ...w,
    actualDistance: getDistanceKm(w.latOffset, w.lngOffset, lat, lng),
  })).sort((a, b) =>
    sortBy === "rating" ? b.rating - a.rating : a.actualDistance - b.actualDistance
  );

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Cannot call", "Your device doesn't support phone calls from this app.");
    });
  };

  const handleDirections = (w: Workshop) => {
    const destLat = lat + w.latOffset;
    const destLng = lng + w.lngOffset;
    const url =
      Platform.OS === "ios"
        ? `maps://?daddr=${destLat},${destLng}`
        : `google.navigation:q=${destLat},${destLng}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${destLat},${destLng}`);
    });
  };

  const s = makeStyles(colors);

  if (locationState === "loading") {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={s.loadingText}>Getting your location...</Text>
        <Text style={s.loadingSubText}>Finding workshops near you</Text>
      </View>
    );
  }

  const mapHtml = buildMapHtml(lat, lng, workshops);

  return (
    <View style={s.container}>
      {locationState === "granted" && userLocation && (
        <View style={s.locationBanner}>
          <Ionicons name="location" size={14} color={colors.success} />
          <Text style={s.locationText}>
            Location active · {userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)}
          </Text>
        </View>
      )}
      {locationState === "denied" && (
        <Pressable style={s.locationDeniedBanner} onPress={requestLocation}>
          <Ionicons name="location-outline" size={14} color={colors.warning} />
          <Text style={s.locationDeniedText}>Location access denied — tap to retry</Text>
        </Pressable>
      )}

      {/* Map toggle */}
      <View style={s.mapToggleRow}>
        <Pressable
          style={[s.mapToggleBtn, !showMap && s.mapToggleBtnActive]}
          onPress={() => setShowMap(false)}
        >
          <MaterialCommunityIcons name="view-list" size={16} color={!showMap ? colors.accent : colors.textSecondary} />
          <Text style={[s.mapToggleText, !showMap && s.mapToggleTextActive]}>List</Text>
        </Pressable>
        <Pressable
          style={[s.mapToggleBtn, showMap && s.mapToggleBtnActive]}
          onPress={() => setShowMap(true)}
        >
          <MaterialCommunityIcons name="map" size={16} color={showMap ? colors.accent : colors.textSecondary} />
          <Text style={[s.mapToggleText, showMap && s.mapToggleTextActive]}>Map</Text>
        </Pressable>
      </View>

      {/* Map view */}
      {showMap ? (
        <View style={s.mapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={s.mapWebView}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={s.mapLoading}>
                <ActivityIndicator size="large" color={colors.accent} />
              </View>
            )}
          />
          <View style={s.mapLegend}>
            <View style={s.mapLegendItem}>
              <View style={s.legendDotBlue} />
              <Text style={s.legendText}>You</Text>
            </View>
            <View style={s.mapLegendItem}>
              <View style={s.legendDotOrange} />
              <Text style={s.legendText}>Workshops</Text>
            </View>
          </View>
        </View>
      ) : (
        <>
          {/* Sort Controls */}
          <View style={s.sortRow}>
            <Text style={s.sortLabel}>Sort by:</Text>
            <Pressable
              style={[s.sortBtn, sortBy === "distance" && s.sortBtnActive]}
              onPress={() => setSortBy("distance")}
            >
              <Text style={[s.sortBtnText, sortBy === "distance" && s.sortBtnTextActive]}>Distance</Text>
            </Pressable>
            <Pressable
              style={[s.sortBtn, sortBy === "rating" && s.sortBtnActive]}
              onPress={() => setSortBy("rating")}
            >
              <Text style={[s.sortBtnText, sortBy === "rating" && s.sortBtnTextActive]}>Rating</Text>
            </Pressable>
          </View>

          <FlatList
            data={workshops}
            keyExtractor={(item) => item.id}
            contentContainerStyle={s.list}
            scrollEnabled
            ListHeaderComponent={
              <View style={s.adWrap}>
                <BannerAd size="banner" />
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={s.workshopCard}>
                <View style={s.workshopTop}>
                  <View style={s.workshopIconWrap}>
                    <Text style={s.workshopRank}>#{index + 1}</Text>
                  </View>
                  <View style={s.workshopInfo}>
                    <Text style={s.workshopName}>{item.name}</Text>
                    <View style={s.ratingRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={s.ratingText}>{item.rating}</Text>
                      <Text style={s.reviewsText}>({item.reviews})</Text>
                      <View
                        style={[
                          s.statusBadge,
                          { backgroundColor: item.open ? colors.success + "20" : colors.danger + "20" },
                        ]}
                      >
                        <Text style={[s.statusText, { color: item.open ? colors.success : colors.danger }]}>
                          {item.open ? "Open" : "Closed"}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.workshopAddress}>
                      {item.address} · {item.actualDistance.toFixed(1)} km away
                    </Text>
                  </View>
                </View>

                <View style={s.specialties}>
                  {item.specialties.map((sp) => (
                    <View key={sp} style={s.specialtyTag}>
                      <Text style={s.specialtyText}>{sp}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.cardActions}>
                  <Pressable
                    style={({ pressed }) => [s.callBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => handleCall(item.phone)}
                  >
                    <Ionicons name="call-outline" size={16} color={colors.accent} />
                    <Text style={s.callBtnText}>Call</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.directionsBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => handleDirections(item)}
                  >
                    <Ionicons name="navigate-outline" size={16} color={colors.text} />
                    <Text style={s.directionsBtnText}>Directions</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [s.mapBtn, pressed && { opacity: 0.85 }]}
                    onPress={() => setShowMap(true)}
                  >
                    <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
                  </Pressable>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={s.center}>
                <MaterialCommunityIcons name="garage-alert" size={48} color={colors.textTertiary} />
                <Text style={s.emptyText}>No workshops found near you</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg, padding: 24 },
    loadingText: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: colors.text },
    loadingSubText: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    emptyText: { fontFamily: "Inter_400Regular", fontSize: 16, color: colors.textSecondary, textAlign: "center" },
    locationBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.success + "15", paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.success + "30" },
    locationText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.success },
    locationDeniedBanner: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.warning + "15", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.warning + "30" },
    locationDeniedText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.warning },
    mapToggleRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
    mapToggleBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    mapToggleBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    mapToggleText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    mapToggleTextActive: { color: colors.accent },
    mapContainer: { flex: 1, position: "relative" },
    mapWebView: { flex: 1, backgroundColor: "#0A0A0A" },
    mapLoading: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
    mapLegend: { position: "absolute", bottom: 16, left: 16, backgroundColor: colors.card + "EE", borderRadius: 12, padding: 10, gap: 6, borderWidth: 1, borderColor: colors.border },
    mapLegendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    legendDotBlue: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#3B82F6", borderWidth: 1.5, borderColor: "#fff" },
    legendDotOrange: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#E85D04", borderWidth: 1.5, borderColor: "#fff" },
    legendText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    sortRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    sortLabel: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary },
    sortBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    sortBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
    sortBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: colors.textSecondary },
    sortBtnTextActive: { color: colors.accent },
    adWrap: { marginBottom: 12, alignItems: "center" },
    list: { paddingHorizontal: 16, paddingBottom: 40 },
    workshopCard: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    workshopTop: { flexDirection: "row", gap: 12, marginBottom: 10 },
    workshopIconWrap: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.accent + "20", alignItems: "center", justifyContent: "center" },
    workshopRank: { fontFamily: "Inter_700Bold", fontSize: 14, color: colors.accent },
    workshopInfo: { flex: 1 },
    workshopName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: colors.text, marginBottom: 4 },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
    ratingText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: colors.text },
    reviewsText: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    statusBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 4 },
    statusText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
    workshopAddress: { fontFamily: "Inter_400Regular", fontSize: 12, color: colors.textSecondary },
    specialties: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 12 },
    specialtyTag: { backgroundColor: colors.card2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    specialtyText: { fontFamily: "Inter_500Medium", fontSize: 12, color: colors.textSecondary },
    cardActions: { flexDirection: "row", gap: 10 },
    callBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.accent, borderRadius: 10, paddingVertical: 10 },
    callBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.accent },
    directionsBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, backgroundColor: colors.card2 },
    directionsBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: colors.text },
    mapBtn: { width: 42, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.card2 },
  });
}

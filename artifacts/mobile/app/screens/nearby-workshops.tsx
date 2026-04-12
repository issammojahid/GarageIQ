import React, { useState, useCallback, useRef } from "react";
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
  TextInput,
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import type { AppColors } from "@/constants/colors";
import { useI18n } from "@/i18n/TranslationContext";
import { BannerAd } from "@/components/AdBanner";
import { useListMechanics } from "@workspace/api-client-react";
import type { Mechanic } from "@workspace/api-client-react";

type SortKey = "distance" | "rating";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildMapHtml(
  userLat: number,
  userLng: number,
  mechanics: Array<Mechanic & { distance: number }>
) {
  const markers = mechanics
    .filter((m) => m.latitude != null && m.longitude != null)
    .map(
      (m, i) =>
        `L.marker([${m.latitude}, ${m.longitude}], {
          icon: L.divIcon({
            className: '',
            html: '<div style="background:#E85D04;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4)">${i + 1}</div>',
            iconSize:[28,28],iconAnchor:[14,14]
          })
        }).bindPopup('<b>${m.name.replace(/'/g, "\\'")}</b><br>${(m.address || m.city || "").replace(/'/g, "\\'")} · ${m.distance.toFixed(1)}km');`
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
  var map = L.map('map', { zoomControl: true }).setView([${userLat}, ${userLng}], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CartoDB', maxZoom: 19
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
  const { t, isRTL } = useI18n();
  const [locationState, setLocationState] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("distance");
  const [showMap, setShowMap] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const webViewRef = useRef<WebView>(null);

  const { data: mechanics = [], isLoading: mechLoading, refetch } = useListMechanics(
    cityFilter.trim() ? { city: cityFilter.trim() } : {}
  );

  const requestLocation = useCallback(async () => {
    setLocationState("loading");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationState("denied");
        Alert.alert("", t("mech_location_use"), [{ text: "OK" }]);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLocationState("granted");
    } catch {
      setLocationState("denied");
      Alert.alert("Error", "Could not get your location. Please try again.");
    }
  }, [t]);

  React.useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const fallbackLat = 33.5731;
  const fallbackLng = -7.5898;
  const lat = userLocation?.latitude ?? fallbackLat;
  const lng = userLocation?.longitude ?? fallbackLng;

  const mechanicsWithDistance = mechanics.map((m) => ({
    ...m,
    distance:
      m.latitude != null && m.longitude != null
        ? haversineKm(lat, lng, m.latitude, m.longitude)
        : 9999,
  }));

  const sorted = [...mechanicsWithDistance].sort((a, b) =>
    sortBy === "rating"
      ? (b.rating ?? 0) - (a.rating ?? 0)
      : a.distance - b.distance
  );

  const s = makeStyles(colors);

  if (locationState === "loading" && mechLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={s.loadingText}>{t("mech_loading")}</Text>
      </View>
    );
  }

  const mapHtml = buildMapHtml(lat, lng, sorted);

  return (
    <View style={s.container}>
      {locationState === "granted" && userLocation && (
        <View style={s.locationBanner}>
          <Ionicons name="location" size={14} color={colors.success} />
          <Text style={s.locationText}>
            {userLocation.latitude.toFixed(3)}, {userLocation.longitude.toFixed(3)}
          </Text>
        </View>
      )}
      {locationState === "denied" && (
        <Pressable style={s.locationDeniedBanner} onPress={requestLocation}>
          <Ionicons name="location-outline" size={14} color={colors.warning} />
          <Text style={s.locationDeniedText}>{t("mech_location_use")} — tap to retry</Text>
        </Pressable>
      )}

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
          <View style={s.filterRow}>
            <View style={s.searchInputWrap}>
              <Ionicons name="search-outline" size={16} color={colors.textTertiary} style={s.searchIcon} />
              <TextInput
                style={[s.searchInput, isRTL && { textAlign: "right" }]}
                placeholder={t("mech_city_filter")}
                placeholderTextColor={colors.textTertiary}
                value={cityFilter}
                onChangeText={setCityFilter}
              />
              {cityFilter.length > 0 && (
                <Pressable onPress={() => setCityFilter("")} style={s.clearBtn}>
                  <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </View>

          <View style={s.sortRow}>
            <Text style={s.sortLabel}>{t("mech_sort_by")}</Text>
            <Pressable
              style={[s.sortBtn, sortBy === "distance" && s.sortBtnActive]}
              onPress={() => setSortBy("distance")}
            >
              <Text style={[s.sortBtnText, sortBy === "distance" && s.sortBtnTextActive]}>{t("mech_sort_distance")}</Text>
            </Pressable>
            <Pressable
              style={[s.sortBtn, sortBy === "rating" && s.sortBtnActive]}
              onPress={() => setSortBy("rating")}
            >
              <Text style={[s.sortBtnText, sortBy === "rating" && s.sortBtnTextActive]}>{t("mech_sort_rating")}</Text>
            </Pressable>
          </View>

          {mechLoading ? (
            <View style={s.center}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={s.loadingText}>{t("mech_loading")}</Text>
            </View>
          ) : (
            <FlatList
              data={sorted}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={s.list}
              scrollEnabled
              ListHeaderComponent={
                <View style={s.adWrap}>
                  <BannerAd size="banner" />
                </View>
              }
              renderItem={({ item, index }) => (
                <WorkshopCard
                  item={item}
                  index={index}
                  lat={lat}
                  lng={lng}
                  colors={colors}
                  t={t}
                  onShowMap={() => setShowMap(true)}
                />
              )}
              ListEmptyComponent={
                <View style={s.emptyContainer}>
                  <MaterialCommunityIcons name="garage-alert" size={56} color={colors.textTertiary} />
                  <Text style={s.emptyTitle}>{t("mech_empty_title")}</Text>
                  <Text style={s.emptyDesc}>{t("mech_empty_desc")}</Text>
                </View>
              }
              ListFooterComponent={
                <Pressable
                  style={({ pressed }) => [s.ctaBanner, pressed && { opacity: 0.88 }]}
                  onPress={() => router.push("/screens/mechanic-register")}
                >
                  <MaterialCommunityIcons name="garage-open" size={28} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.ctaTitle}>{t("mech_cta_title")}</Text>
                    <Text style={s.ctaDesc}>{t("mech_cta_desc")}</Text>
                  </View>
                  <View style={s.ctaBtn}>
                    <Text style={s.ctaBtnText}>{t("mech_cta_btn")}</Text>
                  </View>
                </Pressable>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

function WorkshopCard({
  item,
  index,
  lat,
  lng,
  colors,
  t,
  onShowMap,
}: {
  item: Mechanic & { distance: number };
  index: number;
  lat: number;
  lng: number;
  colors: AppColors;
  t: ReturnType<typeof useI18n>["t"];
  onShowMap: () => void;
}) {
  const s = makeStyles(colors);

  const handleCall = () => {
    Linking.openURL(`tel:${item.phone}`).catch(() => {
      Alert.alert("", "Your device doesn't support phone calls from this app.");
    });
  };

  const handleDirections = () => {
    if (item.latitude == null || item.longitude == null) {
      Alert.alert("", "No coordinates available for this workshop.");
      return;
    }
    const url =
      Platform.OS === "ios"
        ? `maps://?daddr=${item.latitude},${item.longitude}`
        : `google.navigation:q=${item.latitude},${item.longitude}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${item.latitude},${item.longitude}`);
    });
  };

  return (
    <View style={s.workshopCard}>
      <View style={s.workshopTop}>
        <View style={s.workshopIconWrap}>
          <Text style={s.workshopRank}>#{index + 1}</Text>
        </View>
        <View style={s.workshopInfo}>
          <Text style={s.workshopName}>{item.name}</Text>
          <View style={s.ratingRow}>
            {item.rating != null && (
              <>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={s.ratingText}>{item.rating.toFixed(1)}</Text>
                {item.reviewCount != null && (
                  <Text style={s.reviewsText}>({item.reviewCount})</Text>
                )}
              </>
            )}
            {item.workingHours && (
              <View style={[s.statusBadge, { backgroundColor: colors.success + "20" }]}>
                <Text style={[s.statusText, { color: colors.success }]}>{t("mech_open")}</Text>
              </View>
            )}
          </View>
          <Text style={s.workshopAddress}>
            {item.address || item.city}
            {item.distance < 9999 ? ` · ${item.distance.toFixed(1)} ${t("mech_km_away")}` : ""}
          </Text>
        </View>
      </View>

      {item.specialties && item.specialties.length > 0 && (
        <View style={s.specialties}>
          {item.specialties.map((sp) => (
            <View key={sp} style={s.specialtyTag}>
              <Text style={s.specialtyText}>{sp}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.cardActions}>
        <Pressable
          style={({ pressed }) => [s.callBtn, pressed && { opacity: 0.85 }]}
          onPress={handleCall}
        >
          <Ionicons name="call-outline" size={16} color={colors.accent} />
          <Text style={s.callBtnText}>{t("mech_call")}</Text>
        </Pressable>
        {item.latitude != null && item.longitude != null && (
          <Pressable
            style={({ pressed }) => [s.directionsBtn, pressed && { opacity: 0.85 }]}
            onPress={handleDirections}
          >
            <Ionicons name="navigate-outline" size={16} color={colors.text} />
            <Text style={s.directionsBtnText}>{t("mech_directions")}</Text>
          </Pressable>
        )}
        {item.latitude != null && item.longitude != null && (
          <Pressable
            style={({ pressed }) => [s.mapBtn, pressed && { opacity: 0.85 }]}
            onPress={onShowMap}
          >
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.bg, padding: 24 },
    loadingText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: colors.textSecondary },
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
    filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
    searchInputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12 },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: colors.text, paddingVertical: 11 },
    clearBtn: { padding: 4 },
    sortRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
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
    emptyContainer: { alignItems: "center", paddingVertical: 40, gap: 12 },
    emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: colors.text, textAlign: "center" },
    emptyDesc: { fontFamily: "Inter_400Regular", fontSize: 14, color: colors.textSecondary, textAlign: "center" },
    ctaBanner: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.accent + "15", borderWidth: 1, borderColor: colors.accent + "40", borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 8 },
    ctaTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.text, marginBottom: 2 },
    ctaDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: colors.textSecondary },
    ctaBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    ctaBtnText: { fontFamily: "Inter_700Bold", fontSize: 13, color: "#fff" },
  });
}

import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const AD_UNIT_IDS = {
  banner: "ca-app-pub-8545693631358718/2943920859",
  interstitial: "ca-app-pub-8545693631358718/9182026147",
  rewarded: "ca-app-pub-8545693631358718/9605265229",
} as const;

let MobileAds: any = null;
let BannerAdComponent: any = null;
let BannerAdSize: any = null;
let InterstitialAdClass: any = null;
let RewardedAdClass: any = null;
let TestIds: any = null;

try {
  const module = require("react-native-google-mobile-ads");
  MobileAds = module.default;
  BannerAdComponent = module.BannerAd;
  BannerAdSize = module.BannerAdSize;
  InterstitialAdClass = module.InterstitialAd;
  RewardedAdClass = module.RewardedAd;
  TestIds = module.TestIds;

  MobileAds().initialize().catch(() => {});
} catch {
}

export { AD_UNIT_IDS };

export function isAdMobAvailable(): boolean {
  return BannerAdComponent !== null && Platform.OS !== "web";
}

interface BannerAdProps {
  size?: "banner" | "leaderboard" | "mediumRectangle" | "fullBanner";
}

export function BannerAd({ size = "banner" }: BannerAdProps) {
  if (isAdMobAvailable() && BannerAdComponent && BannerAdSize) {
    const sizeMap: Record<string, any> = {
      banner: BannerAdSize.BANNER,
      leaderboard: BannerAdSize.LEADERBOARD,
      mediumRectangle: BannerAdSize.MEDIUM_RECTANGLE,
      fullBanner: BannerAdSize.FULL_BANNER,
    };
    return (
      <BannerAdComponent
        unitId={AD_UNIT_IDS.banner}
        size={sizeMap[size] ?? BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => {}}
      />
    );
  }

  return (
    <View style={styles.placeholder}>
      <MaterialCommunityIcons name="advertisements" size={14} color={Colors.textTertiary} />
      <Text style={styles.placeholderText}>Advertisement</Text>
    </View>
  );
}

export async function showInterstitialAd(): Promise<boolean> {
  if (!isAdMobAvailable() || !InterstitialAdClass) return false;
  try {
    const ad = InterstitialAdClass.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });
    return new Promise((resolve) => {
      const unsubscribeLoaded = ad.addAdEventListener("loaded", () => {
        ad.show();
        unsubscribeLoaded();
        resolve(true);
      });
      const unsubscribeFailed = ad.addAdEventListener("error", () => {
        unsubscribeFailed();
        resolve(false);
      });
      ad.load();
    });
  } catch {
    return false;
  }
}

export async function showRewardedAd(): Promise<boolean> {
  if (!isAdMobAvailable() || !RewardedAdClass) return false;
  try {
    const ad = RewardedAdClass.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });
    return new Promise((resolve) => {
      const unsubscribeEarned = ad.addAdEventListener("earned_reward", () => {
        unsubscribeEarned();
        resolve(true);
      });
      const unsubscribeFailed = ad.addAdEventListener("error", () => {
        unsubscribeFailed();
        resolve(false);
      });
      ad.load();
    });
  } catch {
    return false;
  }
}

const styles = StyleSheet.create({
  placeholder: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 52,
  },
  placeholderText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textTertiary,
  },
});

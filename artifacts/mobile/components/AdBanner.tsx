import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const AD_UNIT_IDS = {
  banner: "ca-app-pub-8545693631358718/2943920859",
  interstitial: "ca-app-pub-8545693631358718/9182026147",
  rewarded: "ca-app-pub-8545693631358718/9605265229",
} as const;

export { AD_UNIT_IDS };

interface AdEventListener {
  (): void;
}

interface AdInstance {
  addAdEventListener(event: string, handler: (reward?: unknown) => void): AdEventListener;
  load(): void;
  show(): void;
}

interface InterstitialAdStatic {
  createForAdRequest(unitId: string, options?: { requestNonPersonalizedAdsOnly?: boolean }): AdInstance;
}

interface RewardedAdStatic {
  createForAdRequest(unitId: string, options?: { requestNonPersonalizedAdsOnly?: boolean }): AdInstance;
}

type BannerAdSizeMap = Record<string, string>;

interface AdMobModule {
  default: () => { initialize(): Promise<void> };
  BannerAd: React.ComponentType<{
    unitId: string;
    size: string;
    requestOptions?: { requestNonPersonalizedAdsOnly?: boolean };
    onAdFailedToLoad?: () => void;
  }>;
  BannerAdSize: BannerAdSizeMap;
  InterstitialAd: InterstitialAdStatic;
  RewardedAd: RewardedAdStatic;
  AdEventType: Record<string, string>;
  RewardedAdEventType: Record<string, string>;
}

let admob: AdMobModule | null = null;

try {
  admob = require("react-native-google-mobile-ads") as AdMobModule;
  admob.default().initialize().catch(() => {});
} catch {
  admob = null;
}

export function isAdMobAvailable(): boolean {
  return admob !== null && Platform.OS !== "web";
}

interface BannerAdProps {
  size?: "banner" | "leaderboard" | "mediumRectangle" | "fullBanner";
}

export function BannerAd({ size = "banner" }: BannerAdProps) {
  if (isAdMobAvailable() && admob) {
    const { BannerAd: BannerAdComponent, BannerAdSize } = admob;
    const sizeMap: BannerAdSizeMap = {
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
  if (!isAdMobAvailable() || !admob) return false;
  try {
    const { AdEventType } = admob;
    const ad = admob.InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });
    return new Promise((resolve) => {
      let unsubscribeLoaded: AdEventListener;
      let unsubscribeFailed: AdEventListener;
      unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        unsubscribeLoaded();
        unsubscribeFailed();
        ad.show();
        resolve(true);
      });
      unsubscribeFailed = ad.addAdEventListener(AdEventType.ERROR, () => {
        unsubscribeLoaded();
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
  if (!isAdMobAvailable() || !admob) return false;
  try {
    const { RewardedAdEventType, AdEventType } = admob;
    const ad = admob.RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });
    return new Promise((resolve) => {
      let earned = false;
      let unsubscribeLoaded: AdEventListener;
      let unsubscribeEarned: AdEventListener;
      let unsubscribeClosed: AdEventListener;
      let unsubscribeFailed: AdEventListener;
      unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        unsubscribeLoaded();
        ad.show();
      });
      unsubscribeEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
        unsubscribeEarned();
      });
      unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        unsubscribeEarned();
        unsubscribeClosed();
        resolve(earned);
      });
      unsubscribeFailed = ad.addAdEventListener(AdEventType.ERROR, () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
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

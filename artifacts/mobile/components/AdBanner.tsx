import React, { useEffect, Component } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useI18n } from "@/i18n/TranslationContext";
import type { AppColors } from "@/constants/colors";

const AD_UNIT_IDS = {
  banner: "ca-app-pub-8545693631358718/1498610826",
  interstitial: "ca-app-pub-8545693631358718/3295843133",
  rewarded: "ca-app-pub-8545693631358718/2246587176",
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

// Require the module at load time so ad classes are available,
// but do NOT call initialize() here — that runs inside a useEffect
// so a JNI/native crash from the SDK cannot kill the process before React mounts.
let admob: AdMobModule | null = null;
let admobInitialized = false;

try {
  admob = require("react-native-google-mobile-ads") as AdMobModule;
} catch {
  admob = null;
}

export function isAdMobAvailable(): boolean {
  return admob !== null && Platform.OS !== "web";
}

// Local error boundary so an ad-render failure never escalates
// to the app-level error boundary — it just shows the placeholder instead.
interface AdErrorState { crashed: boolean }
class AdErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, AdErrorState> {
  state: AdErrorState = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    return this.state.crashed ? this.props.fallback : this.props.children;
  }
}

interface BannerAdProps {
  size?: "banner" | "leaderboard" | "mediumRectangle" | "fullBanner";
}

export function BannerAd({ size = "banner" }: BannerAdProps) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const s = makeStyles(colors);

  const placeholder = (
    <View style={s.placeholder}>
      <MaterialCommunityIcons name="advertisements" size={14} color={colors.textTertiary} />
      <Text style={s.placeholderText}>{t("ad_label")}</Text>
    </View>
  );

  // Initialize AdMob here, after React has mounted, so any crash is
  // recoverable via ErrorBoundary and does not kill the process at startup.
  useEffect(() => {
    if (admob && !admobInitialized && Platform.OS !== "web") {
      admobInitialized = true;
      admob.default().initialize().catch(() => {});
    }
  }, []);

  if (isAdMobAvailable() && admob) {
    const { BannerAd: BannerAdComponent, BannerAdSize } = admob;
    const sizeMap: BannerAdSizeMap = {
      banner: BannerAdSize.BANNER,
      leaderboard: BannerAdSize.LEADERBOARD,
      mediumRectangle: BannerAdSize.MEDIUM_RECTANGLE,
      fullBanner: BannerAdSize.FULL_BANNER,
    };
    return (
      <AdErrorBoundary fallback={placeholder}>
        <BannerAdComponent
          unitId={AD_UNIT_IDS.banner}
          size={sizeMap[size] ?? BannerAdSize.BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdFailedToLoad={() => {}}
        />
      </AdErrorBoundary>
    );
  }

  return placeholder;
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

function makeStyles(colors: AppColors) {
  return StyleSheet.create({
    placeholder: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 52,
    },
    placeholderText: {
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      color: colors.textTertiary,
    },
  });
}

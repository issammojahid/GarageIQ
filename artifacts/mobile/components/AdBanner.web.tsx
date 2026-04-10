import React from "react";

export const AD_UNIT_IDS = {
  banner: "",
  interstitial: "",
  rewarded: "",
} as const;

export function isAdMobAvailable(): boolean {
  return false;
}

interface BannerAdProps {
  size?: "banner" | "leaderboard" | "mediumRectangle" | "fullBanner";
}

export function BannerAd(_props: BannerAdProps) {
  return null;
}

export async function showInterstitialAd(): Promise<boolean> {
  return false;
}

export async function showRewardedAd(): Promise<boolean> {
  return false;
}

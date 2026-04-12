const ACCENT = "#E85D04";
const ACCENT_SECONDARY = "#F48C06";
const SUCCESS = "#22C55E";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const INFO = "#3B82F6";

export const DarkColors = {
  accent: ACCENT,
  accentSecondary: ACCENT_SECONDARY,
  bg: "#0A0A0A",
  card: "#141414",
  card2: "#1E1E1E",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#8A8A8A",
  textTertiary: "#555555",
  success: SUCCESS,
  warning: WARNING,
  danger: DANGER,
  info: INFO,
  tabIconDefault: "#555555",
  tabIconSelected: ACCENT,
  tint: ACCENT,
};

export const LightColors = {
  accent: ACCENT,
  accentSecondary: ACCENT_SECONDARY,
  bg: "#F5F5F5",
  card: "#FFFFFF",
  card2: "#F0F0F0",
  border: "#E0E0E0",
  text: "#111111",
  textSecondary: "#555555",
  textTertiary: "#888888",
  success: SUCCESS,
  warning: WARNING,
  danger: DANGER,
  info: INFO,
  tabIconDefault: "#888888",
  tabIconSelected: ACCENT,
  tint: ACCENT,
};

export type AppColors = typeof DarkColors;

export const Colors = DarkColors;
export default Colors;

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@garageiq_language";

export const LANGUAGES: Array<{ code: string; label: string; native: string }> = [
  { code: "English", label: "English", native: "English" },
  { code: "French", label: "French", native: "Français" },
  { code: "Arabic", label: "Arabic", native: "العربية" },
  { code: "Spanish", label: "Spanish", native: "Español" },
  { code: "German", label: "German", native: "Deutsch" },
  { code: "Dutch", label: "Dutch", native: "Nederlands" },
  { code: "Italian", label: "Italian", native: "Italiano" },
  { code: "Portuguese", label: "Portuguese", native: "Português" },
  { code: "Turkish", label: "Turkish", native: "Türkçe" },
  { code: "Russian", label: "Russian", native: "Русский" },
];

export function useLanguagePref() {
  const [language, setLanguageState] = useState<string>("English");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setLanguageState(val);
      setLoaded(true);
    });
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return { language, setLanguage, loaded };
}

export async function getStoredLanguage(): Promise<string> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val ?? "English";
  } catch {
    return "English";
  }
}

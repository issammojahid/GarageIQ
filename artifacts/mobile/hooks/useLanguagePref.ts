import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@garageiq_language";

export const LANGUAGES: Array<{ code: string; label: string; native: string }> = [
  { code: "en", label: "English", native: "English" },
  { code: "fr", label: "French", native: "Français" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "nl", label: "Dutch", native: "Nederlands" },
  { code: "it", label: "Italian", native: "Italiano" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "ru", label: "Russian", native: "Русский" },
];

const LEGACY_CODE_MAP: Record<string, string> = {
  English: "en", French: "fr", Arabic: "ar", Spanish: "es",
  German: "de", Dutch: "nl", Italian: "it", Portuguese: "pt",
  Turkish: "tr", Russian: "ru",
};

function normalizeLangCode(val: string): string {
  return LEGACY_CODE_MAP[val] ?? val;
}

export function useLanguagePref() {
  const [language, setLanguageState] = useState<string>("en");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(async (val) => {
      if (val) {
        const normalized = normalizeLangCode(val);
        if (normalized !== val) {
          await AsyncStorage.setItem(STORAGE_KEY, normalized);
        }
        setLanguageState(normalized);
      }
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
    return val ? normalizeLangCode(val) : "en";
  } catch {
    return "en";
  }
}

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, type LangCode, type T } from "./translations";

const STORAGE_KEY = "@garageiq_language";

const LEGACY_CODE_MAP: Record<string, string> = {
  English: "en", French: "fr", Arabic: "ar", Spanish: "es",
  German: "de", Dutch: "nl", Italian: "it", Portuguese: "pt",
  Turkish: "tr", Russian: "ru",
};

function normalizeLangCode(val: string): string {
  return LEGACY_CODE_MAP[val] ?? val;
}

type I18nCtx = {
  t: (key: keyof T) => string;
  tf: (key: keyof T, value: string | number) => string;
  isRTL: boolean;
  language: string;
  setLanguage: (lang: string) => Promise<void>;
};

const I18nContext = createContext<I18nCtx>({
  t: (key) => String(key),
  tf: (key, value) => String(value),
  isRTL: false,
  language: "en",
  setLanguage: async () => {},
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(async (val) => {
      if (val) {
        const normalized = normalizeLangCode(val);
        if (normalized !== val) {
          await AsyncStorage.setItem(STORAGE_KEY, normalized);
        }
        setLanguageState(normalized);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const isRTL = language === "ar";

  useEffect(() => {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  }, [isRTL]);

  const dict = useMemo(
    () => (translations[language as LangCode] ?? translations.en) as T,
    [language]
  );

  const t = useCallback(
    (key: keyof T): string => dict[key] ?? (translations.en[key] as string) ?? String(key),
    [dict]
  );

  const tf = useCallback(
    (key: keyof T, value: string | number): string => {
      const str = dict[key] ?? (translations.en[key] as string) ?? String(key);
      return str.replace("%d", String(value)).replace("%s", String(value));
    },
    [dict]
  );

  const value = useMemo(() => ({ t, tf, isRTL, language, setLanguage }), [t, tf, isRTL, language, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

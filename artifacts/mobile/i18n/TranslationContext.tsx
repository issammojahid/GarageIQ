import React, { createContext, useContext, useCallback, useMemo, useEffect } from "react";
import { I18nManager } from "react-native";
import { useLanguagePref } from "@/hooks/useLanguagePref";
import { translations, type LangCode, type T } from "./translations";

type I18nCtx = {
  t: (key: keyof T) => string;
  tf: (key: keyof T, value: string | number) => string;
  isRTL: boolean;
  language: string;
};

const I18nContext = createContext<I18nCtx>({
  t: (key) => String(key),
  tf: (key, value) => String(value),
  isRTL: false,
  language: "en",
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguagePref();
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

  const value = useMemo(() => ({ t, tf, isRTL, language }), [t, tf, isRTL, language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

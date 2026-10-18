"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  APP_LOCALE_COOKIE,
  type AppLocale,
} from "./locale";

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  pick: (indonesian: string, english: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(
  null,
);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function AppLanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: AppLocale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] =
    useState<AppLocale>(initialLocale);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    document.documentElement.lang = nextLocale;
    document.cookie = `${APP_LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }, []);

  const pick = useCallback(
    (indonesian: string, english: string) =>
      locale === "id" ? indonesian : english,
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, pick }),
    [locale, pick, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useAppLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error(
      "useAppLanguage harus digunakan di dalam AppLanguageProvider.",
    );
  }

  return value;
}

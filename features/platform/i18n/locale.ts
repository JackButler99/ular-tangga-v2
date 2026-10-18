export const APP_LOCALES = ["id", "en"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_APP_LOCALE: AppLocale = "id";
export const APP_LOCALE_COOKIE = "main-berdua-locale";

export type BilingualText = Readonly<{
  id: string;
  en: string;
}>;

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === "string" &&
    APP_LOCALES.includes(value as AppLocale)
  );
}

export function localizeText(
  locale: AppLocale,
  text: BilingualText,
) {
  return text[locale];
}

export function localeTag(locale: AppLocale) {
  return locale === "id" ? "id-ID" : "en-US";
}

"use client";

import { APP_LOCALES } from "./locale";
import { useAppLanguage } from "./language-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, pick } = useAppLanguage();
  const label = pick("Bahasa antarmuka", "Interface language");

  return (
    <div
      className="fixed bottom-5 left-5 z-[120] flex items-center gap-1 rounded-full border border-white/15 bg-[#15111c]/90 p-1 text-xs font-bold text-zinc-300 shadow-xl shadow-black/30 backdrop-blur-xl"
      role="group"
      aria-label={label}
      title={label}
    >
      {APP_LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={`rounded-full px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-pink-400/70 ${
            locale === option
              ? "bg-white text-zinc-950"
              : "text-zinc-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

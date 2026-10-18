"use client";

import { useEffect, useState } from "react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

const LANGUAGES = [
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
] as const;

export type Locale = "ko" | "en" | "ja";

export function LanguageSelector() {
  const [currentLocale, setCurrentLocale] = useState<Locale>("ko");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("fluffy-locale") as Locale;
    if (savedLocale && ["ko", "en", "ja"].includes(savedLocale)) {
      setCurrentLocale(savedLocale);
    }
  }, []);

  const changeLanguage = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem("fluffy-locale", locale);
    setIsOpen(false);
    window.location.reload();
  };

  const currentLang = LANGUAGES.find((lang) => lang.code === currentLocale) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
        aria-label="Select language"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLang.flag}</span>
        <span className="hidden md:inline">{currentLang.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[160px] rounded-xl border border-white/60 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                  currentLocale === lang.code
                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLocale === lang.code && (
                  <svg
                    className="ml-auto h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

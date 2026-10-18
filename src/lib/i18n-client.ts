"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/components/language-selector";

export function useTranslations() {
  const [messages, setMessages] = useState<any>({});
  const [locale, setLocale] = useState<Locale>("ko");

  useEffect(() => {
    const savedLocale = (localStorage.getItem("fluffy-locale") || "ko") as Locale;
    setLocale(savedLocale);

    import(`@/locales/${savedLocale}.json`)
      .then((mod) => setMessages(mod.default))
      .catch(() => import("@/locales/ko.json").then((mod) => setMessages(mod.default)));
  }, []);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { t, locale };
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Lang } from "./types";

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
});

const LANG_EVENT = "bingo:lang-change";

function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";

  const storedLang = localStorage.getItem("lang");
  return storedLang === "zh" ? "zh" : "en";
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = () => onChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(LANG_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LANG_EVENT, handleChange);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore<Lang>(subscribe, getStoredLang, () => "en");

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem("lang", newLang);
    document.documentElement.lang = newLang;
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useLocalized<T>(obj: { en: T; zh: T }): T {
  const { lang } = useI18n();
  return obj[lang];
}

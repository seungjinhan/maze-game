import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./en";
import { es } from "./es";
import { id } from "./id";
import { ja } from "./ja";
import { ko } from "./ko";
import { th } from "./th";
import type { Dict, LangCode } from "./types";
import { vi } from "./vi";
import { zhHans } from "./zh-Hans";
import { zhHant } from "./zh-Hant";

export type { Dict, LangCode } from "./types";

/** 언어 선택 목록 (각 언어의 이름으로) */
export const LANGS: readonly { code: LangCode; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "th", label: "ไทย" },
  { code: "es", label: "Español" },
  { code: "id", label: "Bahasa Indonesia" },
];

export const DICTS: Record<LangCode, Dict> = { ko, en, ja, vi, "zh-Hant": zhHant, "zh-Hans": zhHans, th, es, id };

/** 기기 언어 목록에서 고르기. 9개에 없으면 영어 */
export function pickLang(prefs: readonly string[]): LangCode {
  for (const raw of prefs) {
    const l = raw.toLowerCase();
    if (l.startsWith("zh")) return /hant|-tw|-hk|-mo/.test(l) ? "zh-Hant" : "zh-Hans";
    if (l.startsWith("in")) return "id"; // 옛 인도네시아어 코드
    const base = l.split("-")[0];
    if (base in DICTS) return base as LangCode;
  }
  return "en";
}

const LANG_KEY = "maze-game.lang";

function initialLang(): LangCode {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && saved in DICTS) return saved as LangCode;
  } catch {
    /* 무시 */
  }
  return pickLang(navigator.languages?.length ? navigator.languages : [navigator.language ?? "ko"]);
}

interface I18n {
  lang: LangCode;
  t: Dict;
  setLang(lang: LangCode): void;
}

const I18nContext = createContext<I18n>({ lang: "ko", t: ko, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(initialLang);
  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* 무시 */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = DICTS[lang].appName;
  }, [lang]);
  const value = useMemo(() => ({ lang, t: DICTS[lang], setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

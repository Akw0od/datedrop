"use client";

import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { t as translate, type Lang } from "@/lib/dict";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LangCtx = createContext<Ctx>({
  lang: "zh",
  setLang: () => {},
  t: (k) => k,
});

// initial 来自服务端读到的 cookie，保证首屏一致、无闪烁
export function LangProvider({
  initial,
  children,
}: {
  initial: Lang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const setLang = (l: Lang) => {
    document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
    router.refresh(); // 让 RSC 用新语言重渲染
  };
  return (
    <LangCtx.Provider
      value={{ lang: initial, setLang, t: (k, p) => translate(initial, k, p) }}
    >
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);

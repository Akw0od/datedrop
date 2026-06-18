"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Heart,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { TagIcon } from "@/components/tag-icon";
import { useLang } from "@/components/lang-provider";
import { t, pick, type Lang } from "@/lib/dict";
import type { DateCard } from "@/lib/types";

const SWIPE_THRESHOLD = 120;
const spring = { type: "spring", stiffness: 100, damping: 20 } as const;

function TopCard({
  card,
  lang,
  exitDir,
  onSwipe,
}: {
  card: DateCard;
  lang: Lang;
  exitDir: number;
  onSwipe: (like: boolean) => void;
}) {
  // 拖拽旋转走 motion value，不进 React 渲染周期
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0]);

  return (
    <motion.div
      key={card.id}
      className="absolute inset-0 flex cursor-grab flex-col rounded-[2rem] border border-zinc-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onSwipe(true);
        else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe(false);
      }}
      initial={{ scale: 0.96, y: 12, opacity: 0.8 }}
      animate={{ scale: 1, y: 0, opacity: 1, transition: spring }}
      exit={{
        x: exitDir * 480,
        rotate: exitDir * 18,
        opacity: 0,
        transition: { duration: 0.25 },
      }}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <TagIcon tags={card.style_tags} size={24} />
        </span>
        <div className="flex gap-3 font-mono text-xs text-zinc-400">
          <motion.span style={{ opacity: nopeOpacity }} className="text-zinc-500">
            {t(lang, "swipe.nope")}
          </motion.span>
          <motion.span style={{ opacity: likeOpacity }} className="text-rose-600">
            {t(lang, "swipe.like")}
          </motion.span>
        </div>
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight">
        {pick(lang, card.title, card.title_en)}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        {pick(lang, card.description, card.description_en)}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {card.style_tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500"
          >
            {t}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5 font-mono text-xs text-zinc-400">
          {"$".repeat(card.budget_level)}
          <Clock size={13} className="ml-1" />
          {card.duration_hours}h
        </span>
      </div>
    </motion.div>
  );
}

export function SwipeDeck({
  deck,
  allCards,
  coupleId,
  userId,
}: {
  deck: DateCard[];
  allCards: DateCard[];
  coupleId: string;
  userId: string;
}) {
  const { lang } = useLang();
  const supabase = useMemo(() => createClient(), []);
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(0);
  const [liked, setLiked] = useState(0);
  const [matches, setMatches] = useState<DateCard[]>([]);
  const cardMap = useMemo(
    () => new Map(allCards.map((c) => [c.id, c])),
    [allCards]
  );

  // 对方右滑同一张卡 → 触发器写 matches → Realtime 推到这里
  useEffect(() => {
    const channel = supabase
      .channel(`matches-${coupleId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          const card = cardMap.get(payload.new.card_id as string);
          if (card)
            setMatches((m) =>
              m.some((x) => x.id === card.id) ? m : [...m, card]
            );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, coupleId, cardMap]);

  async function swipe(like: boolean) {
    const card = deck[index];
    if (!card) return;
    setExitDir(like ? 1 : -1);
    setIndex((i) => i + 1); // 乐观推进，不等网络
    if (like) setLiked((n) => n + 1);
    const { error } = await supabase.from("swipes").insert({
      user_id: userId,
      couple_id: coupleId,
      card_id: card.id,
      liked: like,
    });
    if (error) console.error("swipe insert 失败:", error.message);
  }

  const current = deck[index];
  const done = !current;
  const progress = deck.length ? Math.min(index / deck.length, 1) : 1;

  return (
    <main className="flex min-h-[100dvh] flex-col px-5 py-6">
      <header className="mx-auto flex w-full max-w-md items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-700"
        >
          <ArrowLeft size={15} />
          {t(lang, "swipe.home")}
        </Link>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-200">
          <motion.div
            className="h-full rounded-full bg-rose-600"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
            transition={spring}
          />
        </div>
        <span className="font-mono text-xs text-zinc-500">
          {String(Math.min(index + 1, deck.length)).padStart(2, "0")}/
          {deck.length}
        </span>
      </header>

      <div className="relative mx-auto mt-8 h-[440px] w-full max-w-md flex-1">
        {done ? (
          <div className="flex h-full flex-col items-start justify-center rounded-[2rem] border border-zinc-200/60 bg-white p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
            <Sparkle size={28} weight="fill" className="text-rose-600" />
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {deck.length > 0 ? t(lang, "swipe.round_done") : t(lang, "swipe.empty")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              {t(lang, "swipe.summary", { n: liked })}
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700 active:scale-[0.98]"
            >
              {t(lang, "back_home")}
            </Link>
          </div>
        ) : (
          <>
            {deck[index + 1] && (
              <div className="absolute inset-0 translate-y-3 scale-[0.96] rounded-[2rem] border border-zinc-200/60 bg-white opacity-60" />
            )}
            <AnimatePresence mode="popLayout">
              <TopCard
                key={current.id}
                card={current}
                lang={lang}
                exitDir={exitDir}
                onSwipe={swipe}
              />
            </AnimatePresence>
          </>
        )}
      </div>

      {!done && (
        <div className="mx-auto mt-8 flex w-full max-w-md justify-center gap-5">
          <button
            onClick={() => swipe(false)}
            aria-label={t(lang, "swipe.nope")}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm transition hover:border-zinc-300 hover:text-zinc-700 active:scale-95"
          >
            <X size={22} weight="bold" />
          </button>
          <button
            onClick={() => swipe(true)}
            aria-label={t(lang, "swipe.like")}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
          >
            <Heart size={22} weight="fill" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {matches.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: spring }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-5 bottom-5 mx-auto max-w-md rounded-2xl bg-zinc-950 p-4 text-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
          >
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Sparkle size={15} weight="fill" className="text-rose-400" />
              {t(lang, "swipe.matched")}
            </p>
            <ul className="mt-1.5 space-y-1">
              {matches.slice(-3).map((m) => (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm text-zinc-300"
                >
                  <TagIcon tags={m.style_tags} size={14} className="text-zinc-500" />
                  {pick(lang, m.title, m.title_en)}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

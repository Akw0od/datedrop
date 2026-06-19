"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Camera, DownloadSimple, CircleNotch } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/lang-provider";
import { t } from "@/lib/dict";
import { RecapCard } from "@/components/recap-card";
import type { Plan } from "@/lib/types";

export function RecapEditor({
  plan,
  coupleId,
  meName,
  partnerName,
  initialPhotos,
  initialNote,
}: {
  plan: Plan;
  coupleId: string;
  meName: string;
  partnerName: string;
  initialPhotos: string[];
  initialNote: string;
}) {
  const { lang } = useLang();
  const supabase = useMemo(() => createClient(), []);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [note, setNote] = useState(initialNote);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function save(p: string[], n: string) {
    await supabase
      .from("recaps")
      .upsert({ couple_id: coupleId, week_of: plan.week_of, photos: p, note: n });
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])].slice(0, 3 - photos.length);
    if (!files.length) return;
    setUploading(true);
    const urls = [...photos];
    for (const f of files) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${coupleId}/${plan.week_of}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
      const { error } = await supabase.storage
        .from("recap-photos")
        .upload(path, f, { upsert: true, contentType: f.type });
      if (!error) {
        urls.push(supabase.storage.from("recap-photos").getPublicUrl(path).data.publicUrl);
      }
    }
    setPhotos(urls);
    await save(urls, note);
    setUploading(false);
    e.target.value = "";
  }

  function removePhoto(i: number) {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    save(next, note);
  }

  async function download() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fafafa",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `datedrop-${plan.week_of}.png`;
      a.click();
    } catch (err) {
      console.error("导出失败", err);
    }
    setDownloading(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={cardRef} className="rounded-[28px] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.18)]">
        <RecapCard
          plan={plan}
          lang={lang}
          meName={meName}
          partnerName={partnerName}
          photos={photos}
          note={note}
        />
      </div>

      {/* controls */}
      <div className="mt-6 w-[400px] max-w-full space-y-3">
        {photos.length > 0 && (
          <div className="flex gap-2">
            {photos.map((src, i) => (
              <button
                key={i}
                onClick={() => removePhoto(i)}
                className="group relative h-14 w-14 overflow-hidden rounded-xl"
                aria-label="remove"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-xs text-white group-hover:flex">
                  ✕
                </span>
              </button>
            ))}
          </div>
        )}

        {photos.length < 3 && (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 py-3 text-sm font-medium text-zinc-500 transition hover:border-rose-300 hover:text-rose-600">
            {uploading ? (
              <CircleNotch size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
            {t(lang, "recap.add_photos")}
            <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} disabled={uploading} />
          </label>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => save(photos, note)}
          placeholder={t(lang, "recap.note_ph")}
          rows={2}
          maxLength={120}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />

        <button
          onClick={download}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-60"
        >
          {downloading ? <CircleNotch size={16} className="animate-spin" /> : <DownloadSimple size={16} />}
          {t(lang, "recap.download")}
        </button>
      </div>
    </div>
  );
}

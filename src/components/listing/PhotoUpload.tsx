"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";

const MAX_PHOTOS = 4;
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 1600;

export interface PhotoItem {
  /** Preview data URL for UI + AI analysis. */
  preview: string;
  /** Resized JPEG blob for Storage upload at publish time. */
  blob: Blob;
}

/** Downscale + re-encode client-side so uploads stay small and cheap to analyze. */
async function fileToPhotoItem(file: File): Promise<PhotoItem> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode photo"))),
      "image/jpeg",
      0.82,
    );
  });
  const preview = canvas.toDataURL("image/jpeg", 0.82);
  return { preview, blob };
}

interface PhotoUploadProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const t = useTranslations("Sell");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const accepted: PhotoItem[] = [];
    for (const file of Array.from(files).slice(0, MAX_PHOTOS - photos.length)) {
      if (!file.type.startsWith("image/") || file.size > MAX_BYTES * 3) continue;
      accepted.push(await fileToPhotoItem(file));
    }
    if (accepted.length > 0) onChange([...photos, ...accepted]);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {photos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-line bg-card text-ink-soft transition-colors hover:border-stem/50"
        >
          <span className="text-4xl" aria-hidden>
            📸
          </span>
          <span className="text-[15px] font-medium text-ink">
            {t("snapTitle")}
          </span>
          <span className="text-[13px]">{t("snapHint", { count: MAX_PHOTOS })}</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URLs */}
              <img
                src={photo.preview}
                alt={`Photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-white"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-line text-3xl text-ink-soft hover:border-stem/50"
              aria-label={t("addPhoto")}
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
}

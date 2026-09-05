"use client";

import { useRef, useState, type ChangeEvent } from "react";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export interface ComposerSubmission {
  text: string;
  imageDataUrl?: string;
  negativePercent: number;
}

export function Composer({
  onSubmit,
  disabled,
}: {
  onSubmit: (input: ComposerSubmission) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [negativePercent, setNegativePercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image is too large (max 8MB).");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    const trimmed = text.trim();
    if ((!trimmed && !imageDataUrl) || disabled) return;
    onSubmit({ text: trimmed, imageDataUrl, negativePercent });
    setText("");
    setImageDataUrl(undefined);
    setNegativePercent(0);
  }

  return (
    <div className="rounded-2xl border border-black bg-white p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        placeholder="Say something..."
        rows={3}
        disabled={disabled}
        className="w-full resize-none bg-transparent text-base outline-none placeholder:text-black/40 disabled:opacity-60"
      />

      {imageDataUrl && (
        <div className="relative mt-3 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient client-side preview of an in-memory data URL, not an optimizable asset */}
          <img
            src={imageDataUrl}
            alt="Attached"
            className="max-h-48 rounded-xl border border-black object-cover"
          />
          <button
            type="button"
            onClick={() => setImageDataUrl(undefined)}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs text-white hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-black/70">
          <span>🙂 {100 - negativePercent}% positive</span>
          <span>{negativePercent}% negative 🙁</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={negativePercent}
          onChange={(e) => setNegativePercent(Number(e.target.value))}
          disabled={disabled}
          aria-label="Negative comment percentage"
          className="mt-1 w-full accent-[#99ffcc] disabled:opacity-60"
        />
      </div>

      {error && <p className="mt-2 text-xs text-[#160042]">{error}</p>}

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach photo"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 8h2.5l1.3-2h8.4l1.3 2H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
            />
            <circle cx="12" cy="13.5" r="3.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || (!text.trim() && !imageDataUrl)}
          className="rounded-xl border border-black bg-[#99ffcc] px-5 py-2 text-sm font-bold text-black transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Posting…" : "Post"}
        </button>
      </div>
    </div>
  );
}

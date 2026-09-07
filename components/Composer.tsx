"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ACCENT_MINT, ACCENT_PEACH, ACCENT_PINK, ACCENT_SKY } from "@/lib/avatar";
import { MAX_IMAGE_BYTES } from "@/lib/images";
import { useTriggerFlash } from "@/lib/useTriggerFlash";
import { Card } from "./Card";

export interface ComposerSubmission {
  text: string;
  imageDataUrl?: string;
}

export function Composer({
  onSubmit,
  disabled,
  winkTrigger,
}: {
  onSubmit: (input: ComposerSubmission) => void;
  disabled?: boolean;
  winkTrigger?: number;
}) {
  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popping = useTriggerFlash(winkTrigger);

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
    onSubmit({ text: trimmed, imageDataUrl });
    setText("");
    setImageDataUrl(undefined);
  }

  return (
    <Card className="relative">
      <div
        className="absolute -top-2 left-7 h-2.5 w-2.5 rounded-full transition-transform duration-200"
        style={{ backgroundColor: ACCENT_PINK, transform: popping ? "scale(1.6)" : "scale(1)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-2.5 left-[70px] h-1.5 w-1.5 rounded-full transition-transform duration-200"
        style={{ backgroundColor: ACCENT_SKY, transform: popping ? "scale(1.6)" : "scale(1)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-1.5 right-[50px] h-2 w-2 rounded-full transition-transform duration-200"
        style={{ backgroundColor: ACCENT_PEACH, transform: popping ? "scale(1.6)" : "scale(1)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-3 right-5 h-1.5 w-1.5 rounded-full transition-transform duration-200"
        style={{ backgroundColor: ACCENT_MINT, transform: popping ? "scale(1.6)" : "scale(1)" }}
        aria-hidden="true"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        placeholder="Say something..."
        rows={3}
        disabled={disabled}
        className="w-full resize-none bg-transparent text-base outline-none placeholder:text-foreground/40 disabled:opacity-60"
      />

      {imageDataUrl && (
        <div className="relative mt-3 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient client-side preview of an in-memory data URL, not an optimizable asset */}
          <img
            src={imageDataUrl}
            alt="Attached"
            className="max-h-48 rounded-xl border border-foreground object-cover"
          />
          <button
            type="button"
            onClick={() => setImageDataUrl(undefined)}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs text-white hover:bg-foreground/80"
          >
            ✕
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="Attach photo"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-foreground text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="rounded-xl border border-foreground px-5 py-2 text-sm font-bold text-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: ACCENT_MINT }}
        >
          {disabled ? "Posting…" : "Post"}
        </button>
      </div>
    </Card>
  );
}

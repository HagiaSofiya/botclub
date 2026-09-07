"use client";

import { useState, type CSSProperties } from "react";
import { ACCENT_MINT } from "@/lib/avatar";
import { computeLikeCount } from "@/lib/likes";
import type { Post } from "@/lib/types";
import { Composer, type ComposerSubmission } from "./Composer";
import { Mascot } from "./Mascot";
import { PostCard } from "./PostCard";

interface PendingPost {
  text: string;
  imageDataUrl?: string;
  typingCount: number;
  likeCount: number;
}

export function Feed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [pending, setPending] = useState<PendingPost | null>(null);
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [winkTrigger, setWinkTrigger] = useState<number | undefined>(undefined);
  const [negativePercent, setNegativePercent] = useState(0);

  async function handlePost({ text, imageDataUrl }: ComposerSubmission) {
    setError(null);
    setPending({
      text,
      imageDataUrl,
      typingCount: Math.floor(2 + Math.random() * 5),
      likeCount: computeLikeCount(text),
    });

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, imageDataUrl, negativePercent }),
      });
      if (!res.ok) throw new Error("Failed to post");
      const post: Post = await res.json();
      setAnimatedIds((prev) => new Set(prev).add(post.id));
      setPosts((prev) => [post, ...prev]);
      setWinkTrigger(Date.now());
    } catch {
      setError("Something went wrong posting that. Try again?");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Mascot winkTrigger={winkTrigger} />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-foreground/70">
            <span>{negativePercent}% negative 🙁</span>
            <span>🙂 {100 - negativePercent}% positive</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={100 - negativePercent}
            onChange={(e) => setNegativePercent(100 - Number(e.target.value))}
            disabled={!!pending}
            aria-label="Negative comment percentage"
            className="sentiment-slider mt-1 w-full disabled:opacity-60"
            style={
              {
                "--accent-mint": ACCENT_MINT,
                "--range-percent": `${100 - negativePercent}%`,
              } as CSSProperties
            }
          />
        </div>
      </div>
      <Composer onSubmit={handlePost} disabled={!!pending} winkTrigger={winkTrigger} />
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex flex-col gap-4">
        {pending && (
          <PostCard
            post={{
              id: "pending",
              text: pending.text,
              imageDataUrl: pending.imageDataUrl,
              createdAt: 0,
              likeCount: pending.likeCount,
              comments: [],
            }}
            animate
            pending
            typingCount={pending.typingCount}
          />
        )}
        {posts.length === 0 && !pending && (
          <p className="py-12 text-center text-sm italic text-foreground/60">
            Nothing here yet. Say something — they&rsquo;re waiting.
          </p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} animate={animatedIds.has(post.id)} />
        ))}
      </div>
    </div>
  );
}

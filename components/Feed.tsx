"use client";

import { useState } from "react";
import type { Post } from "@/lib/types";
import { Composer, type ComposerSubmission } from "./Composer";
import { PostCard } from "./PostCard";

interface PendingPost {
  text: string;
  imageDataUrl?: string;
}

export function Feed({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [pending, setPending] = useState<PendingPost | null>(null);
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function handlePost({ text, imageDataUrl, negativePercent }: ComposerSubmission) {
    setError(null);
    setPending({ text, imageDataUrl });

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
    } catch {
      setError("Something went wrong posting that. Try again?");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Composer onSubmit={handlePost} disabled={!!pending} />
      {error && <p className="text-sm text-[#160042]">{error}</p>}
      <div className="flex flex-col gap-4">
        {pending && (
          <article className="animate-pulse rounded-2xl border border-black bg-white p-6">
            {pending.imageDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- transient in-memory data URL preview
              <img
                src={pending.imageDataUrl}
                alt=""
                className="mb-3 max-h-64 w-full rounded-xl border border-black object-cover"
              />
            )}
            {pending.text && (
              <p className="whitespace-pre-wrap text-base leading-relaxed text-black">{pending.text}</p>
            )}
            <p className="mt-3 text-sm text-black/60">warming up the crowd…</p>
          </article>
        )}
        {posts.length === 0 && !pending && (
          <p className="py-12 text-center text-sm italic text-black/60">
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

"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";
import { CommentList, type VisibleComment } from "./CommentList";
import { LikeCounter } from "./LikeCounter";

export function PostCard({ post, animate }: { post: Post; animate: boolean }) {
  const [visible, setVisible] = useState<VisibleComment[]>(() =>
    animate ? [] : post.comments.map((c) => ({ ...c, appearedAt: c.createdAt })),
  );

  useEffect(() => {
    if (!animate) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    post.comments.forEach((comment, i) => {
      const gap = i < 4 ? 200 + Math.random() * 300 : 800 + Math.random() * 1200;
      elapsed += gap;
      timers.push(
        setTimeout(() => {
          setVisible((prev) => [...prev, { ...comment, appearedAt: Date.now() }]);
        }, elapsed),
      );
    });

    return () => timers.forEach(clearTimeout);
    // Stagger schedule is derived once per post, not on every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  return (
    <article className="rounded-2xl border border-black bg-white p-6">
      {post.imageDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- transient in-memory data URL, not a static asset
        <img
          src={post.imageDataUrl}
          alt=""
          className="mb-3 max-h-96 w-full rounded-xl border border-black object-cover"
        />
      )}
      {post.text && <p className="whitespace-pre-wrap text-base leading-relaxed text-black">{post.text}</p>}
      <div className="mt-3">
        <LikeCounter target={post.likeCount} animate={animate} />
      </div>
      <div className="mt-4 border-t border-black/10 pt-4">
        <CommentList comments={visible} />
      </div>
    </article>
  );
}

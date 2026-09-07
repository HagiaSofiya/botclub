"use client";

import { useEffect, useState } from "react";
import type { Post } from "@/lib/types";
import { Card } from "./Card";
import { CommentList, type VisibleComment } from "./CommentList";
import { LikeCounter } from "./LikeCounter";

export function PostCard({
  post,
  animate,
  pending = false,
  typingCount,
}: {
  post: Post;
  animate: boolean;
  pending?: boolean;
  typingCount?: number;
}) {
  const [visible, setVisible] = useState<VisibleComment[]>(() =>
    animate ? [] : post.comments.map((c) => ({ ...c, appearedAt: c.createdAt })),
  );

  useEffect(() => {
    if (!animate) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;

    post.comments.forEach((comment, i) => {
      const gap = i < 4 ? 40 + Math.random() * 60 : 160 + Math.random() * 240;
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
    <Card as="article" className={pending ? "animate-pulse" : ""}>
      {post.imageDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- transient in-memory data URL, not a static asset
        <img
          src={post.imageDataUrl}
          alt=""
          className={`mb-3 w-full rounded-xl border border-foreground object-cover ${pending ? "max-h-64" : "max-h-96"}`}
        />
      )}
      {post.text && <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">{post.text}</p>}
      <div className="mt-3">
        <LikeCounter target={post.likeCount} animate={animate} />
      </div>
      {pending ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-foreground/60">
          <span>{typingCount} people are typing</span>
          <span className="flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
      ) : (
        <div className="mt-4 border-t border-foreground/10 pt-4">
          <CommentList comments={visible} />
        </div>
      )}
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Avatar } from "./Avatar";

export interface VisibleComment {
  id: string;
  username: string;
  text: string;
  appearedAt: number;
}

function formatRelativeTime(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function CommentList({ comments }: { comments: VisibleComment[] }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (comments.length === 0) {
    return <p className="text-sm italic text-neutral-400">no comments yet...</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
          <Avatar username={comment.username} size={32} />
          <div className="min-w-0">
            <p className="text-sm leading-snug">
              <span className="font-semibold">{comment.username}</span>{" "}
              <span className="whitespace-pre-wrap">{comment.text}</span>
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              {formatRelativeTime(now - comment.appearedAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

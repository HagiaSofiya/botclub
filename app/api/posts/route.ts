// Runs on the Node.js runtime, not Edge — `child_process` (used by lib/hermes.ts) isn't
// available there.
export const runtime = "nodejs";

import { randomUUID } from "node:crypto";
import { computeLikeCount } from "@/lib/likes";
import { samplePersonas } from "@/lib/personas";
import { generateComments } from "@/lib/hermes";
import { addPost } from "@/lib/store";
import type { Comment, Post } from "@/lib/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function randomCommentCount(): number {
  return Math.floor(8 + Math.random() * 13); // 8-20
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const imageDataUrl = typeof body?.imageDataUrl === "string" ? body.imageDataUrl : undefined;
  const negativePercent =
    typeof body?.negativePercent === "number"
      ? Math.min(100, Math.max(0, body.negativePercent))
      : 0;

  if (!text && !imageDataUrl) {
    return Response.json({ error: "Post text or an image is required." }, { status: 400 });
  }
  if (imageDataUrl && !/^data:image\/(png|jpeg|gif|webp);base64,/.test(imageDataUrl)) {
    return Response.json({ error: "Unsupported image format." }, { status: 400 });
  }
  if (imageDataUrl && imageDataUrl.length * 0.75 > MAX_IMAGE_BYTES) {
    return Response.json({ error: "Image is too large." }, { status: 400 });
  }

  const personas = samplePersonas(randomCommentCount());
  const likeCount = computeLikeCount(text);
  const generated = await generateComments(text, personas, imageDataUrl, negativePercent);

  const now = Date.now();
  const comments: Comment[] = generated.map((c, i) => ({
    id: randomUUID(),
    username: c.username,
    text: c.text,
    createdAt: now + i,
  }));

  const post: Post = {
    id: randomUUID(),
    text,
    imageDataUrl,
    createdAt: now,
    likeCount,
    comments,
  };

  addPost(post);
  return Response.json(post, { status: 201 });
}

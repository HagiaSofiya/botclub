// The one piece of this app that is a genuine integration, not a simulation: every post
// triggers a real subprocess call to the user's locally-installed Hermes agent, which
// writes the batch of bot comments. Everything else (usernames, avatars, like counts,
// timing) is deliberately kept as plain app logic — see lib/personas.ts and lib/likes.ts.

import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { FALLBACK_COMMENTS, FALLBACK_NEGATIVE_COMMENTS } from "./fallback-comments";
import { IMAGE_EXTENSION_BY_MIME } from "./images";

const execFileAsync = promisify(execFile);

const KNOWN_HERMES_PATH = "/Users/sofiyashrayber/.local/bin/hermes";

function resolveHermesBin(): string {
  if (process.env.HERMES_BIN) return process.env.HERMES_BIN;
  if (existsSync(KNOWN_HERMES_PATH)) return KNOWN_HERMES_PATH;
  return "hermes";
}

/**
 * Writes a `data:image/...;base64,...` URL to a temp file so it can be handed to
 * `hermes chat --image <path>` (which takes a filesystem path, not inline data). Nothing
 * about this app persists images beyond the process, so the file lives only for the
 * duration of one Hermes call and is cleaned up by the caller.
 */
async function writeTempImage(imageDataUrl: string): Promise<string | null> {
  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, base64] = match;
  const extension = IMAGE_EXTENSION_BY_MIME[mime];
  if (!extension) return null;

  const dir = await mkdtemp(join(tmpdir(), "botnet-image-"));
  const path = join(dir, `photo.${extension}`);
  await writeFile(path, Buffer.from(base64, "base64"));
  return path;
}

function buildPrompt(
  postText: string,
  personas: string[],
  hasImage: boolean,
  negativeIndices: Set<number>,
): string {
  const negativeNumbers = personas.map((_, i) => i + 1).filter((n) => negativeIndices.has(n - 1));
  const toneMix =
    negativeNumbers.length > 0
      ? `- Personas #${negativeNumbers.join(", #")} must write a MILDLY negative comment: unenthusiastic, underwhelmed, nitpicky, or backhanded. Never mean, cruel, insulting, or a personal attack — just lukewarm or unimpressed.
- All other personas follow this positive mix: ~80% short, gushing, adoring praise ("I love this!!", "Epic photo", "You are so real for this") — vary phrasing, mostly under 12 words; ~10% more sincere supportive comments (max 2 sentences), especially if the post sounds sad or emotional; ~10% uncanny non-sequiturs that feel slightly off-topic or algorithmically confused.`
      : `- ~80% short, gushing, adoring praise ("I love this!!", "Epic photo", "You are so real for this") — vary phrasing, mostly under 12 words.
- ~10% more sincere supportive comments (max 2 sentences), especially if the post sounds sad or emotional.
- ~10% uncanny non-sequiturs that feel slightly off-topic or algorithmically confused.`;

  return `You are generating fake social-media comments for a satirical demo app called "Bot Club," where every post — no matter how mundane — instantly gets swarmed by bot admirers.

POST TEXT:
"""
${postText || "(no caption)"}
"""
${hasImage ? "\nA photo is attached to this post — actually look at it and react to what's specifically in it (not just generic photo praise).\n" : ""}
Generate exactly ${personas.length} comments reacting to this post, one per persona below, in the SAME ORDER as this list:
${personas.map((p, i) => `${i + 1}. ${p}`).join("\n")}

TONE MIX across the whole batch:
${toneMix}
- If the list has 8 or more personas, include at least one bare-emoji-only comment somewhere in the batch.
- Never break character; never mention you are an AI or that this is fake or satire; no commentary of your own.

OUTPUT FORMAT — CRITICAL:
Return ONLY a JSON array, nothing else. No markdown code fences, no text before or after. Each element: {"username": "<copied exactly from the persona list, same order>", "comment": "<string>"}.`;
}

/**
 * Randomly selects `Math.round(count * negativePercent / 100)` indices out of
 * `[0, count)` via a Fisher-Yates shuffle, so the slider's percentage is honored
 * exactly rather than left to chance across the batch.
 */
function pickNegativeIndices(count: number, negativePercent: number): Set<number> {
  const negativeCount = Math.round(count * (negativePercent / 100));
  if (negativeCount <= 0) return new Set();

  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, negativeCount));
}

function fallbackFor(index: number, negativeIndices: Set<number>): string {
  return negativeIndices.has(index)
    ? FALLBACK_NEGATIVE_COMMENTS[index % FALLBACK_NEGATIVE_COMMENTS.length]
    : FALLBACK_COMMENTS[index % FALLBACK_COMMENTS.length];
}

function extractJsonArray(raw: string): unknown[] | null {
  const stripped = raw.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(stripped);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // fall through to regex extraction below
  }
  const match = stripped.match(/\[[\s\S]*\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // give up, caller falls back to canned comments
    }
  }
  return null;
}

/**
 * Hermes sometimes returns `[{comment: "..."}]`, sometimes double-encodes each element
 * as its own JSON string (`["{\"comment\":\"...\"}"]`), and occasionally just returns
 * plain strings. Handle all three rather than trusting one shape.
 */
function extractComment(entry: unknown): string | undefined {
  if (entry && typeof entry === "object" && "comment" in entry) {
    const value = (entry as { comment?: unknown }).comment;
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
    return undefined;
  }
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    try {
      return extractComment(JSON.parse(trimmed));
    } catch {
      return trimmed.length > 0 ? trimmed : undefined;
    }
  }
  return undefined;
}

export interface GeneratedComment {
  username: string;
  text: string;
}

export async function generateComments(
  postText: string,
  personas: string[],
  imageDataUrl?: string,
  negativePercent = 0,
): Promise<GeneratedComment[]> {
  const bin = resolveHermesBin();
  const negativeIndices = pickNegativeIndices(personas.length, negativePercent);
  let tempImagePath: string | null = null;

  try {
    if (imageDataUrl) {
      tempImagePath = await writeTempImage(imageDataUrl);
    }

    // Latency here is dominated by the model's own (queued, free-tier) response time,
    // not comment count or whether an image is attached — observed 11-21s across
    // 5/10/20-comment and image-vs-text-only batches in testing, with occasional
    // slower outliers. Budget generously rather than risk a spurious timeout.
    const args = [
      "chat",
      "-q",
      buildPrompt(postText, personas, !!tempImagePath, negativeIndices),
      ...(tempImagePath ? ["--image", tempImagePath] : []),
      "-Q",
      "--reasoning",
      "minimal",
      "--run-budget",
      "45",
      "--max-turns",
      "3",
    ];

    console.log(
      `[hermes] spawning: ${bin} chat -q "<prompt, ${personas.length} personas>"${tempImagePath ? " --image <temp file>" : ""} -Q --reasoning minimal --run-budget 45 --max-turns 3`,
    );
    const { stdout } = await execFileAsync(bin, args, {
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        PATH: `${process.env.PATH ?? ""}:/Users/sofiyashrayber/.local/bin`,
      },
    });

    const parsed = extractJsonArray(stdout);
    if (!parsed || parsed.length === 0) {
      throw new Error("Hermes response did not contain a parseable JSON array");
    }

    return personas.map((username, i) => {
      const text = extractComment(parsed[i]) ?? fallbackFor(i, negativeIndices);
      return { username, text };
    });
  } catch (err) {
    console.error("[hermes] falling back to canned comments:", err);
    return personas.map((username, i) => ({
      username,
      text: fallbackFor(i, negativeIndices),
    }));
  } finally {
    if (tempImagePath) {
      await rm(join(tempImagePath, ".."), { recursive: true, force: true });
    }
  }
}

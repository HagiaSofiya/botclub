export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export interface ParsedDataUrl {
  mime: string;
  base64: string;
}

export function parseDataUrl(dataUrl: string): ParsedDataUrl | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

// Satirical heuristic, not a real sentiment model: posts that read as sad still get an
// absurd number of likes (that's the joke — the adoration never actually stops), just
// proportionally fewer than a banal/celebratory post would.

const SAD_KEYWORDS = [
  "broke up", "breakup", "distraught", "sad", "crying", "cried", "depressed",
  "lonely", "awful", "terrible", "heartbroken", "hate my", "miscarriage",
  "died", "funeral", "grief", "devastated", "miserable",
];

function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min));
}

export function computeLikeCount(text: string): number {
  const lower = text.toLowerCase();
  const isSad = SAD_KEYWORDS.some((keyword) => lower.includes(keyword));
  return isSad ? randomInt(5_000, 25_000) : randomInt(50_000, 450_000);
}

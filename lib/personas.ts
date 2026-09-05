// Bot username generation. Deliberately plain app code, not an LLM call — LLMs are
// unreliable at "produce a consistent-looking random handle," and we want these to be
// stable/cheap to generate in bulk.

const NAME_POOL = [
  "Ardelis", "Philomena", "Siusan", "Fawn", "Abigale", "Darda", "Marisol", "Fenwick",
  "Osric", "Seraphina", "Delphine", "Cordelia", "Prudence", "Beatrix", "Wilhelmina",
  "Alaric", "Mireille", "Corwin", "Thessaly", "Rosalind", "Ottoline", "Percival",
  "Aurelia", "Callum", "Isolde", "Tamsin", "Bertram", "Genevra", "Loveday", "Peregrine",
  "Sabine", "Thaddeus", "Verity", "Wystan", "Yolanda", "Zephyrine", "Amaryllis",
  "Bellamy", "Clemency", "Dorian",
];

const WORD_POOL = [
  "lolan", "therepair", "shoulder", "case", "orange", "fish", "dish", "bus", "bloom",
  "cabin", "drift", "husk", "coral", "ember", "moth", "quill", "ridge", "satin",
  "tundra", "wick", "yarrow", "brook", "cinder", "dusk", "fern", "glow", "harbor",
  "ivy", "jasper", "knoll", "lumen", "marsh", "nectar", "opal", "petal", "quartz",
  "reed", "storm", "thistle", "vale",
];

const PERSONA_POOL_SIZE = 150;

function pick<T>(pool: T[]): T {
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomDigits(): string {
  const digitCount = Math.random() < 0.5 ? 3 : 4;
  const min = 10 ** (digitCount - 1);
  const max = 10 ** digitCount - 1;
  return String(Math.floor(min + Math.random() * (max - min)));
}

const PATTERNS: Array<() => string> = [
  () => `${pick(WORD_POOL)}${pick(WORD_POOL)}`,
  () => `${pick(WORD_POOL)}${randomDigits()}`,
  () => `${pick(NAME_POOL)}${pick(WORD_POOL)}${randomDigits()}`,
  () => `${randomDigits()}${pick(NAME_POOL)}${pick(WORD_POOL)}`,
  () => `${pick(NAME_POOL)}${randomDigits()}`,
  () => `${pick(WORD_POOL)}${pick(NAME_POOL)}`,
];

function generatePersona(): string {
  return pick(PATTERNS)();
}

declare global {
  var __botnetPersonaPool: string[] | undefined;
}

function getPersonaPool(): string[] {
  if (!globalThis.__botnetPersonaPool) {
    const seen = new Set<string>();
    while (seen.size < PERSONA_POOL_SIZE) {
      seen.add(generatePersona());
    }
    globalThis.__botnetPersonaPool = Array.from(seen);
  }
  return globalThis.__botnetPersonaPool;
}

/** Sample `count` distinct bot usernames for one post's comment batch. */
export function samplePersonas(count: number): string[] {
  const pool = getPersonaPool();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}

// Used only if the Hermes call fails or times out, so the demo never visibly breaks.
// Spans the same tone mix as the real prompt: mostly gushing, a little sincere, a few
// uncanny non-sequiturs, one bare-emoji.

export const FALLBACK_COMMENTS: string[] = [
  "I love this!!",
  "Epic post",
  "You are so real for this",
  "This is everything",
  "Obsessed with you",
  "I needed to see this today",
  "You're doing amazing",
  "The way you write is incredible",
  "This deserves more than likes, it deserves a parade",
  "I've read this four times already",
  "It's understandable. It's hard to know the limits of your own feelings.",
  "I'm sorry this happened to you. You deserve so much better.",
  "I'm going to be so sad when she gets in the shower.",
  "Pizza looks amazing!",
  "I am human.",
  "❤️❤️",
];

// Same purpose as FALLBACK_COMMENTS, but for personas assigned a mildly negative
// comment when Hermes fails — lukewarm/unimpressed, never mean or cruel.
export const FALLBACK_NEGATIVE_COMMENTS: string[] = [
  "Not really my thing.",
  "Mid.",
  "Seen better.",
  "Kind of a stretch.",
  "Could've been shorter.",
  "This aged like milk.",
  "Eh.",
  "I've seen this take before.",
  "Not gonna lie, a little underwhelming.",
  "It's fine I guess.",
  "😐",
];

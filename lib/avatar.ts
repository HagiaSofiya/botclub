// Deterministic placeholder avatars (gradient + initials, GitHub/Slack-style) generated
// from a hash of the username. No network calls, no real photos — these are fake bot
// accounts, so there's no person whose likeness should stand in for them.

const GRADIENTS: Array<[string, string]> = [
  ["#f472b6", "#a855f7"],
  ["#818cf8", "#6366f1"],
  ["#38bdf8", "#0ea5e9"],
  ["#34d399", "#10b981"],
  ["#fbbf24", "#f59e0b"],
  ["#fb7185", "#e11d48"],
  ["#2dd4bf", "#0d9488"],
  ["#c084fc", "#9333ea"],
  ["#fb923c", "#ea580c"],
  ["#a3e635", "#65a30d"],
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface AvatarStyle {
  initials: string;
  from: string;
  to: string;
}

export function getAvatarStyle(username: string): AvatarStyle {
  const hash = hashString(username);
  const [from, to] = GRADIENTS[hash % GRADIENTS.length];
  const letters = username.match(/[A-Za-z]/g) ?? ["?"];
  const initials = (letters[0] + (letters[1] ?? "")).toUpperCase();
  return { initials, from, to };
}

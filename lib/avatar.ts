// Deterministic placeholder avatars (flat pastel + initials, Hatch-style) generated
// from a hash of the username. No network calls, no real photos — these are fake bot
// accounts, so there's no person whose likeness should stand in for them.

export const ACCENT_MINT = "#99ffcc";
export const ACCENT_SKY = "#7bbbff";
export const ACCENT_PEACH = "#ffcc99";
export const ACCENT_PINK = "#ff99cc";

const AVATAR_COLORS: string[] = [ACCENT_MINT, ACCENT_SKY, ACCENT_PEACH, ACCENT_PINK];

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
  color: string;
}

export function getAvatarStyle(username: string): AvatarStyle {
  const hash = hashString(username);
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const letters = username.match(/[A-Za-z]/g) ?? ["?"];
  const initials = (letters[0] + (letters[1] ?? "")).toUpperCase();
  return { initials, color };
}

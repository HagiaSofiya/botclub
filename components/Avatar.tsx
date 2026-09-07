import { getAvatarStyle } from "@/lib/avatar";

export function Avatar({ username, size = 36 }: { username: string; size?: number }) {
  const { initials, color } = getAvatarStyle(username);

  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full border border-foreground font-bold text-foreground"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundColor: color,
      }}
    >
      {initials}
    </div>
  );
}

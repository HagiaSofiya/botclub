import { getAvatarStyle } from "@/lib/avatar";

export function Avatar({ username, size = 36 }: { username: string; size?: number }) {
  const { initials, from, to } = getAvatarStyle(username);

  return (
    <div
      className="flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {initials}
    </div>
  );
}

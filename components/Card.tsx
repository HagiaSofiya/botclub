export function Card({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "article";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={`rounded-2xl border border-foreground bg-white p-6 ${className}`}>
      {children}
    </Tag>
  );
}

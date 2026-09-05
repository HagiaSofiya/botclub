import { Feed } from "@/components/Feed";
import { getPosts } from "@/lib/store";

// The store is in-memory and read fresh per request — never prerender this page.
export const dynamic = "force-dynamic";

export default function Home() {
  const posts = getPosts();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <Feed initialPosts={posts} />
    </main>
  );
}

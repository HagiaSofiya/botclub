import type { Post } from "./types";

declare global {
  var __botnetStore: { posts: Post[] } | undefined;
}

const store = globalThis.__botnetStore ?? (globalThis.__botnetStore = { posts: [] });

export function getPosts(): Post[] {
  return store.posts;
}

export function addPost(post: Post): Post {
  store.posts.unshift(post);
  return post;
}

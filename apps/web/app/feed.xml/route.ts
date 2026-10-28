import { buildRssFeed } from "@/lib/feed";
import { getPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRssFeed(getPosts(), siteUrl), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

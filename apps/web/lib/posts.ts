import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Locale } from "./site";

export interface Post {
  id: string; slug: string; title: string; excerpt: string; language: Locale;
  publishedAt: string; publishedDate?: string; originalUrl: string; mediumUrl: string; legacyPath: string; html: string; translations?: Partial<Record<Locale,string>>;
}

export function getPosts(): Post[] {
  const path = resolve(process.cwd(), "../../content/blog/posts.json");
  if (!existsSync(path)) throw new Error("The blog content manifest is missing. Import the archive before building the site.");
  const posts = JSON.parse(readFileSync(path, "utf8")) as Post[];
  return posts.sort((a,b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function getPost(locale: Locale, slug: string) {
  let decodedSlug = slug;
  try { decodedSlug = decodeURIComponent(slug); } catch { return undefined; }
  return getPosts().find(post => post.language === locale && post.slug === decodedSlug);
}
export function postPath(post: Post) { return `/${post.language}/blog/${post.slug}/`; }
export function formatDate(value: string, locale: Locale) { return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(value)); }

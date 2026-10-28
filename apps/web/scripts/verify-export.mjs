import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRssFeed } from "../lib/feed.ts";

const output = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const posts = JSON.parse(readFileSync(new URL("../../../content/blog/posts.json", import.meta.url), "utf8"));
const routes = new Map([
  ["/", "en"], ["/en/", "en"], ["/pt/", "pt-BR"],
  ["/en/blog/", "en"], ["/pt/blog/", "pt-BR"],
  ["/about/", "en"], ["/portfolio/", "en"], ["/contact/", "en"], ["/blog/", "en"],
]);
for (const post of posts) routes.set(`/${post.language}/blog/${post.slug}/`, post.language === "pt" ? "pt-BR" : "en");
const localAssets = new Set();
for (const [route, language] of routes) {
  const path = join(output, "." + route, "index.html");
  assert(existsSync(path), `Missing exported route: ${route}`);
  const html = readFileSync(path, "utf8");
  assert.equal(html.match(/<html\b[^>]*\blang="([^"]+)"/i)?.[1], language, `Wrong document language: ${route}`);
  assert.equal((html.match(/<h1(?:\s|>)/gi) ?? []).length, 1, `Expected one main heading: ${route}`);
  const canonical = html.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"/i)?.[1];
  assert(canonical?.startsWith("https://danielgaio.com/"), `Missing canonical: ${route}`);
  assert(/<link\b(?=[^>]*\brel="alternate")(?=[^>]*\btype="application\/rss\+xml")(?=[^>]*\bhref="https:\/\/danielgaio.com\/feed.xml")[^>]*>/i.test(html), `Missing RSS discovery metadata: ${route}`);
  for (const match of html.matchAll(/(?:src|href)="(\/(?:_next\/|blog-imports\/)[^"]+)"/g)) {
    const asset = decodeURIComponent(match[1].split("?")[0]);
    assert(existsSync(join(output, asset)), `Missing asset ${asset} from ${route}`);
    localAssets.add(asset);
  }
}
for (const post of posts) {
  const route = `/${post.language}/blog/${post.slug}/`;
  const html = readFileSync(join(output, "." + route, "index.html"), "utf8");
  const visibleDate = post.publishedDate ?? post.publishedAt;
  assert(html.includes(`dateTime="${visibleDate}"`) || html.includes(`datetime="${visibleDate}"`), `Original calendar date missing: ${post.id}`);
  for (const target of Object.values(post.translations ?? {})) assert(routes.has(target), `Missing translated article: ${target}`);
  for (const match of post.html.matchAll(/\bsrc="(\/blog-imports\/[^"]+)"/g)) {
    assert(existsSync(join(output, decodeURIComponent(match[1]))), `Missing imported article image: ${match[1]}`);
  }
}
for (const asset of ["404.html", "robots.txt", "sitemap.xml", "icon.svg", "feed.xml"]) assert(existsSync(join(output, asset)), `Missing static artifact: ${asset}`);
assert.equal(readFileSync(join(output, "feed.xml"), "utf8"), buildRssFeed(posts, "https://danielgaio.com"), "Exported feed differs from the complete, deterministic archive feed");
for (const route of ["/en/", "/pt/"]) {
  const html = readFileSync(join(output, "." + route, "index.html"), "utf8");
  const visible = html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ");
  for (const marker of ["detailPrompt", "ownerReviewRequired", "A specific problem, my contribution", "O novo site ainda não foi lançado"]) assert(!visible.includes(marker), `Editorial note rendered on ${route}`);
}
console.log(`Verified ${routes.size} exported routes, ${posts.length} articles, RSS feed/discovery and ${localAssets.size} local asset references; languages, headings, canonical metadata, calendar dates and translation targets pass.`);

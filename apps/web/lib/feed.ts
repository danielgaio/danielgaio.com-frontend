import type { Post } from "./posts";

type FeedPost = Pick<Post, "id" | "slug" | "title" | "excerpt" | "language" | "publishedAt" | "mediumUrl" | "originalUrl" | "legacyPath" | "html">;

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

function assertXmlCharacters(value: string): void {
  for (const character of value) {
    const code = character.codePointAt(0)!;
    if (!(code === 9 || code === 10 || code === 13 || (code >= 0x20 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xfffd) || (code >= 0x10000 && code <= 0x10ffff))) {
      throw new Error("Feed content contains a character forbidden by XML 1.0.");
    }
  }
}

function articleUrl(post: FeedPost, origin: string): string {
  return new URL(`/${post.language}/blog/${post.slug}/`, origin).href;
}

function urlKey(url: URL): string {
  let path = url.pathname;
  try { path = decodeURIComponent(path); } catch { /* Keep literal percent signs in external paths. */ }
  return url.origin + path.replace(/\/$/, "");
}

function absoluteHtml(html: string, article: string, migrated: Map<string, string>): string {
  // Imported bodies are sanitized HTML with quoted src/href attributes. Keep prose
  // and markup intact, changing only URLs that need the feed's absolute context.
  return html.replace(/(\s(?:href|src)=)(["'])(.*?)\2/gi, (_match, attribute: string, quote: string, value: string) => {
    const decoded = value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_entity, code: string) => String.fromCodePoint(Number(code))).replace(/&#x([\da-f]+);/gi, (_entity, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
    let target: URL;
    try { target = new URL(decoded, article); }
    catch {
      // Preserve malformed absolute links already present in an original post;
      // they are prose history, not a reason to lose an otherwise valid feed.
      if (/^[a-z][a-z\d+.-]*:/i.test(decoded)) return _match;
      throw new Error(`Cannot resolve a relative article URL: ${value}`);
    }
    const canonical = migrated.get(urlKey(target));
    if (canonical) {
      const replacement = new URL(canonical);
      replacement.search = target.search;
      replacement.hash = target.hash;
      return attribute + quote + escapeXml(replacement.href) + quote;
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(decoded)) return _match;
    return attribute + quote + escapeXml(target.href) + quote;
  });
}

export function buildRssFeed(posts: readonly FeedPost[], siteUrl: string): string {
  const origin = new URL(siteUrl).origin;
  const migrated = new Map<string, string>();
  const guids = new Set<string>();
  const sorted = [...posts].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const post of sorted) {
    if (guids.has(post.mediumUrl)) throw new Error(`Duplicate feed GUID: ${post.mediumUrl}`);
    if (!Number.isFinite(Date.parse(post.publishedAt))) throw new Error(`Invalid publication date: ${post.id}`);
    guids.add(post.mediumUrl);
    const canonical = articleUrl(post, origin);
    for (const value of [canonical, post.originalUrl, post.mediumUrl, post.legacyPath]) {
      migrated.set(urlKey(new URL(value, origin)), canonical);
    }
  }
  const items = sorted.map(post => {
    const canonical = articleUrl(post, origin);
    const body = absoluteHtml(post.html, canonical, migrated);
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(canonical)}</link>
      <guid isPermaLink="false">${escapeXml(post.mediumUrl)}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <dc:creator>Daniel Gaio</dc:creator>
      <dc:language>${post.language === "pt" ? "pt-BR" : "en"}</dc:language>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded>${escapeXml(body)}</content:encoded>
    </item>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Daniel Gaio · Writing</title>
    <link>${escapeXml(new URL("/en/blog/", origin).href)}</link>
    <description>Notes on software, AI and learning, in English and Portuguese.</description>
    <atom:link href="${escapeXml(new URL("/feed.xml", origin).href)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  assertXmlCharacters(xml);
  return xml;
}

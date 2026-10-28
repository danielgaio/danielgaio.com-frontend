import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildRssFeed } from "../lib/feed.ts";

const site = "https://danielgaio.com";
const post = {
  id: "abc123", slug: "ação-abc123", title: "Title & <ideas>", excerpt: 'Words "quoted" & shared',
  language: "pt", publishedAt: "2025-06-02T00:14:00Z", publishedDate: "2025-06-01",
  mediumUrl: "https://medium.com/p/abc123", originalUrl: `${site}/ação-abc123`, legacyPath: "/ação-abc123",
  html: '<p>Olá &amp; hello. A literal ]]> stays intact.</p><img src="/blog-imports/abc123/image.png"><a href="?one=1&amp;two=2#part">Read</a>',
};
const decodeXml = value => value.replace(/&(amp|lt|gt|quot|apos);/g, (_match, entity) => ({amp:"&",lt:"<",gt:">",quot:'"',apos:"'"})[entity]);
const itemBodies = xml => [...xml.matchAll(/<content:encoded>([\s\S]*?)<\/content:encoded>/g)].map(match => decodeXml(match[1]));

test("escapes XML once while preserving prose, original timestamp and language", () => {
  const xml = buildRssFeed([post], site);
  assert(xml.includes("<title>Title &amp; &lt;ideas&gt;</title>"));
  assert(xml.includes("<description>Words &quot;quoted&quot; &amp; shared</description>"));
  assert(xml.includes('<guid isPermaLink="false">https://medium.com/p/abc123</guid>'));
  assert(xml.includes("<pubDate>Mon, 02 Jun 2025 00:14:00 GMT</pubDate>"));
  assert(xml.includes("<dc:language>pt-BR</dc:language>"));
  assert(xml.includes('<atom:link href="https://danielgaio.com/feed.xml" rel="self" type="application/rss+xml" />'));
  const [body] = itemBodies(xml);
  assert(body.includes("<p>Olá &amp; hello. A literal ]]> stays intact.</p>"));
  assert(body.includes('src="https://danielgaio.com/blog-imports/abc123/image.png"'));
  assert(body.includes('href="https://danielgaio.com/pt/blog/a%C3%A7%C3%A3o-abc123/?one=1&amp;two=2#part"'));
});

test("resolves body URLs in article context and moves known old article links locally", () => {
  const html = '<a href="/ação-abc123?x=1&amp;y=2#section">Legacy</a><a href="https://medium.com/p/abc123">Medium</a><a href="#section">Anchor</a><img src="//danielgaio.com/blog-imports/a.png"><a href="https://example.com/?a=1&amp;b=2">External</a>';
  const [body] = itemBodies(buildRssFeed([{...post,html}], site));
  assert(body.includes('href="https://danielgaio.com/pt/blog/a%C3%A7%C3%A3o-abc123/?x=1&amp;y=2#section"'));
  assert(body.includes('href="https://danielgaio.com/pt/blog/a%C3%A7%C3%A3o-abc123/"'));
  assert(body.includes('href="https://danielgaio.com/pt/blog/a%C3%A7%C3%A3o-abc123/#section"'));
  assert(body.includes('src="https://danielgaio.com/blog-imports/a.png"'));
  assert(body.includes('href="https://example.com/?a=1&amp;b=2"'));
});

test("is deterministic without mutating input or using the build clock", () => {
  const older = {...post,id:"older",mediumUrl:"https://medium.com/p/older",publishedAt:"2024-01-01T01:00:00Z"};
  const input = [older,post];
  assert.equal(buildRssFeed(input, site),buildRssFeed([...input].reverse(), site));
  assert.equal(input[0],older);
  assert(!buildRssFeed(input, site).includes("lastBuildDate"));
  assert(!buildRssFeed([], site).includes("<item>"));
});

test("preserves an existing malformed external link without losing the archive", () => {
  const html = '<p>Original: <a href="http://localhost:11434.">local model</a>.</p>';
  assert.equal(itemBodies(buildRssFeed([{...post,html}],site))[0],html);
});

test("rejects invalid dates, duplicate GUIDs and XML-forbidden characters", () => {
  assert.throws(()=>buildRssFeed([{...post,publishedAt:"invalid"}],site),/Invalid publication date/);
  assert.throws(()=>buildRssFeed([post,post],site),/Duplicate feed GUID/);
  assert.throws(()=>buildRssFeed([{...post,title:"bad\u0000title"}],site),/forbidden by XML/);
  assert.throws(()=>buildRssFeed([{...post,html:"lone surrogate \ud800"}],site),/forbidden by XML/);
});

test("keeps the imported archive GUIDs, dates, prose and absolute image paths", () => {
  const posts = JSON.parse(readFileSync(new URL("../../../content/blog/posts.json",import.meta.url),"utf8"));
  const xml = buildRssFeed(posts,site);
  const bodies = itemBodies(xml);
  assert.equal((xml.match(/<item>/g)??[]).length,posts.length);
  for (const entry of posts) {
    assert(xml.includes(`<guid isPermaLink="false">https://medium.com/p/${entry.id}</guid>`));
    assert(xml.includes(`<pubDate>${new Date(entry.publishedAt).toUTCString()}</pubDate>`));
    const expected = entry.html.replace(/((?:src|href)=")\/(?!\/)/g,`$1${site}/`);
    assert(bodies.includes(expected),`Full prose/body mismatch: ${entry.id}`);
  }
  const original = readFileSync(new URL("../../../content/blog/sources/feed.xml",import.meta.url),"utf8");
  const sourceGuids = [...original.matchAll(/<guid isPermaLink="false">([^<]+)<\/guid>/g)];
  assert.equal(sourceGuids.length,10,"Expected the ten directly archived Medium feed entries");
  for (const sourceItem of original.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const guid = sourceItem[1].match(/<guid isPermaLink="false">([^<]+)<\/guid>/)?.[1];
    const pubDate = sourceItem[1].match(/<pubDate>([^<]+)<\/pubDate>/)?.[1];
    assert(guid && pubDate,"Archived RSS item must retain its GUID and publication date");
    assert(xml.includes(`<guid isPermaLink="false">${guid}</guid>`));
    assert(xml.includes(`<pubDate>${pubDate}</pubDate>`));
  }
});

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts, formatDate, postPath, type Post } from "@/lib/posts";
import { labels, otherLocale, pageMetadata, siteUrl, type Locale } from "@/lib/site";
import { SiteShell } from "./site-shell";

export function WritingList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  const ui=labels[locale];
  if (!posts.length) return <div className="writing-empty"><p>{locale === "pt" ? "Novos artigos aparecerão aqui." : "New writing will appear here."}</p></div>;
  return <div className="writing-list">{posts.map(post => <article className="writing-card" key={post.id}><div className="writing-meta"><time dateTime={post.publishedDate ?? post.publishedAt}>{formatDate(post.publishedDate ?? post.publishedAt,locale)}</time><span lang={post.language === "pt" ? "pt-BR" : "en"}>{post.language === "pt" ? "Português" : "English"}</span></div><h3><a href={postPath(post)} lang={post.language === "pt" ? "pt-BR" : "en"}>{post.title}</a></h3><p lang={post.language === "pt" ? "pt-BR" : "en"}>{post.excerpt}</p><a className="text-link" href={postPath(post)} aria-label={`${ui.readArticle}: ${post.title}`}>{ui.readArticle}<span aria-hidden="true">↗</span></a></article>)}</div>;
}

export function BlogPage({ locale }: { locale: Locale }) {
  const ui=labels[locale];
  return <SiteShell locale={locale} alternatePath={`/${otherLocale(locale)}/blog/`}><section className="page-intro"><div className="container"><p className="eyebrow">{ui.blogEyebrow}</p><h1>{ui.blogTitle}</h1><p>{ui.blogNote}</p></div></section><section className="section blog-archive"><div className="container"><p className="rss-subscribe"><a className="text-link" href="/feed.xml">{ui.rssLink}<span aria-hidden="true">↗</span></a></p><WritingList locale={locale} posts={getPosts()} /></div></section></SiteShell>;
}

export function articleMetadata(locale: Locale, slug: string): Metadata {
  const post=getPost(locale,slug); if (!post) return {};
  const path=postPath(post);
  return { ...pageMetadata(locale,post.title,path), description: post.excerpt,
    alternates: { canonical: path, languages: { [post.language === "pt" ? "pt-BR" : "en"]: path, ...(post.translations?.en ? {en:post.translations.en} : {}), ...(post.translations?.pt ? {"pt-BR":post.translations.pt} : {}) } },
    openGraph: { title: post.title, description: post.excerpt, type: "article", url: path, siteName: "Daniel Gaio", locale: post.language === "pt" ? "pt_BR" : "en_US", publishedTime: post.publishedAt, authors: ["Daniel Gaio"] },
    twitter: { card: "summary", title: post.title, description: post.excerpt },
  };
}

export function ArticlePage({ locale, slug }: { locale: Locale; slug: string }) {
  const post=getPost(locale,slug); if (!post) notFound(); const ui=labels[locale];
  const structured={ "@context":"https://schema.org", "@type":"BlogPosting", headline:post.title, datePublished:post.publishedAt, author:{"@type":"Person",name:"Daniel Gaio",url:siteUrl}, mainEntityOfPage:new URL(postPath(post),siteUrl).href, inLanguage:post.language === "pt" ? "pt-BR":"en" };
  const more=getPosts().filter(p=>p.id!==post.id).slice(0,2);
  const alternatePath=post.translations?.[otherLocale(locale)] ?? `/${otherLocale(locale)}/blog/`;
  return <SiteShell locale={locale} alternatePath={alternatePath}><article className="article"><header className="article-header container"><a className="text-link" href={`/${locale}/blog/`}><span aria-hidden="true">←</span>{ui.backWriting}</a><div className="article-meta"><time dateTime={post.publishedDate ?? post.publishedAt}>{formatDate(post.publishedDate ?? post.publishedAt,locale)}</time><span>{locale === "pt" ? "Português" : "English"}</span></div><h1>{post.title}</h1><p className="article-description">{post.excerpt}</p><div className="article-byline"><span className="author-avatar" aria-hidden="true">dg.</span><span>Daniel Gaio</span></div></header><div className="article-body" dangerouslySetInnerHTML={{__html:post.html}} />{!post.translations?.[otherLocale(locale)] && <p className="article-language-note">{ui.noTranslation}</p>}</article><section className="section related-writing"><div className="container"><div className="section-heading"><h2>{ui.moreWriting}</h2></div><WritingList locale={locale} posts={more} /></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured).replace(/</g, String.raw`\u003c`)}} /></SiteShell>;
}

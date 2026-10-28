import type { MetadataRoute } from "next";
import { getPosts, postPath } from "@/lib/posts";
import { siteUrl } from "@/lib/site";
export const dynamic="force-static";
export default function sitemap(): MetadataRoute.Sitemap{return [
 ...["/en/","/pt/","/en/blog/","/pt/blog/"].map(path=>({url:`${siteUrl}${path}`})),
 ...getPosts().map(post=>({url:`${siteUrl}${postPath(post)}`,lastModified:post.publishedAt})),
];}

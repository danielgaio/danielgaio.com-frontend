import { ArticlePage, articleMetadata } from "@/components/writing";
import { getPosts } from "@/lib/posts";
export const dynamicParams=false;
export function generateStaticParams(){return getPosts().filter(post=>post.language==="en").map(post=>({slug:post.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return articleMetadata("en",slug);}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <ArticlePage locale="en" slug={slug} />;}

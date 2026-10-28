import { BlogPage } from "@/components/writing";
import { pageMetadata } from "@/lib/site";
export const metadata={...pageMetadata("pt","Artigos","/pt/blog/"),alternates:{canonical:"/pt/blog/",languages:{en:"/en/blog/","pt-BR":"/pt/blog/"}}};
export default function Page(){return <BlogPage locale="pt" />;}

import { BlogPage } from "@/components/writing";
import { pageMetadata } from "@/lib/site";
export const metadata={...pageMetadata("en","Writing","/en/blog/"),alternates:{canonical:"/en/blog/",languages:{en:"/en/blog/","pt-BR":"/pt/blog/"}}};
export default function Page(){return <BlogPage locale="en" />;}

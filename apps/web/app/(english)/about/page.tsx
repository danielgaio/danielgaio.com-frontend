import { LegacySectionPage } from "@/components/portfolio";
import { pageMetadata } from "@/lib/site";
export const metadata={...pageMetadata("en",'My story'),alternates:{canonical:"/en/"}};
export default function Page(){return <LegacySectionPage section="about" />;}

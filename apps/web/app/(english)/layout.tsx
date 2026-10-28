import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { siteUrl } from "@/lib/site";
import "../globals.css";
export default function EnglishLayout({ children }: { children: ReactNode }) { return <html lang="en"><head><link rel="alternate" type="application/rss+xml" title="Daniel Gaio · Writing" href={`${siteUrl}/feed.xml`} /></head><body><GoogleAnalytics />{children}</body></html>; }

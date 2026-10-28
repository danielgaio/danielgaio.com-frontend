import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "../globals.css";
export default function EnglishLayout({ children }: { children: ReactNode }) { return <html lang="en"><body><GoogleAnalytics />{children}</body></html>; }

import type { ReactNode } from "react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "../../globals.css";
export default function PortugueseLayout({ children }: { children: ReactNode }) { return <html lang="pt-BR"><body><GoogleAnalytics />{children}</body></html>; }

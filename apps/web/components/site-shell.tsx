import type { ReactNode } from "react";
import { labels, type Locale } from "@/lib/site";
import { SiteNav } from "./site-nav";

export function SiteShell({ locale, children, alternatePath }: { locale: Locale; children: ReactNode; alternatePath?: string }) {
  const ui = labels[locale];
  return <>
    <a className="skip-link" href="#main-content">{ui.skip}</a>
    <SiteNav locale={locale} alternatePath={alternatePath} />
    <main id="main-content">{children}</main>
    <footer className="site-footer"><div className="container footer-inner">
      <a className="footer-name" href={`/${locale}/`}>Daniel Gaio<span>.</span></a>
      <p>© {new Date().getFullYear()} Daniel Gaio</p><p>{ui.footer}</p>
      <a href="https://github.com/danielgaio" target="_blank" rel="noreferrer noopener">GitHub <span aria-hidden="true">↗</span></a>
    </div></footer>
  </>;
}

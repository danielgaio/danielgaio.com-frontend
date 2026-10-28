"use client";

import { useEffect, useState } from "react";
import { labels, otherLocale, type Locale } from "@/lib/navigation";

export function SiteNav({ locale, alternatePath }: { locale: Locale; alternatePath?: string }) {
  const [open, setOpen] = useState(false);
  const ui = labels[locale];
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  const links = [
    { label: ui.work, href: `/${locale}/#work` },
    { label: ui.about, href: `/${locale}/#about` },
    { label: ui.writing, href: `/${locale}/blog/` },
    { label: ui.contact, href: `/${locale}/#contact` },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href={`/${locale}/`} aria-label={`Daniel Gaio — ${ui.home}`}>
          <span className="brand-mark" aria-hidden="true">dg<span>.</span></span><span className="brand-name">Daniel Gaio</span>
        </a>
        <nav className="desktop-nav" aria-label={locale === "pt" ? "Navegação principal" : "Main navigation"}>
          {links.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
        </nav>
        <div className="header-actions">
          <a className="language-switch" href={alternatePath ?? `/${otherLocale(locale)}/`} hrefLang={locale === "en" ? "pt-BR" : "en"} lang={locale === "en" ? "pt-BR" : "en"} aria-label={ui.languageLabel}>
            <span aria-hidden="true">◎</span>{locale === "en" ? "PT" : "EN"}
          </a>
          <button className="menu-toggle" type="button" aria-label={open ? ui.close : ui.menu} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(isOpen => !isOpen)}>
            <span aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>
      {open && <nav className="mobile-nav" id="mobile-navigation" aria-label={locale === "pt" ? "Navegação móvel" : "Mobile navigation"}>
        {links.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}<span aria-hidden="true">↗</span></a>)}
      </nav>}
    </header>
  );
}

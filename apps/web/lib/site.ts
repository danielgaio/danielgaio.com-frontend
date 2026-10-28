import type { Metadata } from "next";
import en from "../../../content/portfolio/en.json";
import pt from "../../../content/portfolio/pt-BR.json";

import type { Locale } from "./navigation";
export { labels, otherLocale, type Locale } from "./navigation";
export const siteUrl = "https://danielgaio.com";
export const locales: Locale[] = ["en", "pt"];
export const isLocale = (value: string): value is Locale => value === "en" || value === "pt";
export const contentFor = (locale: Locale) => (locale === "pt" ? pt : en);
export const localeTag = (locale: Locale) => (locale === "pt" ? "pt-BR" : "en");


export function pageMetadata(locale: Locale, title?: string, path = `/${locale}/`): Metadata {
  const copy = contentFor(locale);
  const description = copy.hero.summary;
  const fullTitle = title ? `${title} · Daniel Gaio` : "Daniel Gaio · Software, data & AI";
  return {
    metadataBase: new URL(siteUrl), title: fullTitle, description,
    alternates: { canonical: path, languages: { en: "/en/", "pt-BR": "/pt/", "x-default": "/en/" } },
    openGraph: { title: fullTitle, description, type: "website", url: path, siteName: "Daniel Gaio", locale: locale === "pt" ? "pt_BR" : "en_US" },
    twitter: { card: "summary", title: fullTitle, description },
    robots: { index: true, follow: true },
    icons: { icon: "/icon.svg" },
  };
}

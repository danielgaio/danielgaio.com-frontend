import { SiteShell } from "./site-shell";
import { labels, type Locale } from "@/lib/site";
export function NotFoundPage({ locale = "en" }: { locale?: Locale }) { const ui=labels[locale]; return <SiteShell locale={locale}><section className="not-found container"><p className="eyebrow">404</p><h1>{ui.notFound}</h1><p>{ui.notFoundText}</p><a className="button button-primary" href={`/${locale}/`}>{ui.returnHome}<span aria-hidden="true">↗</span></a></section></SiteShell>; }

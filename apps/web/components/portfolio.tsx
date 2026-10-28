import { contentFor, labels, type Locale } from "@/lib/site";
import { SiteShell } from "./site-shell";
import { WritingList } from "./writing";
import { getPosts } from "@/lib/posts";

function Arrow() { return <span aria-hidden="true">↗</span>; }

export function WorkSection({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  const categories = [ui.experience, ui.product, ui.systems];
  const tags = [["APIs", "Python", locale === "pt" ? "Integração de dados" : "Data integration"], ["Next.js", "PostgreSQL", "OpenAI"], ["Python", "FastAPI", "LangGraph"]];
  return <section className="section work-section" id="work"><div className="container">
    <div className="section-heading"><div><p className="eyebrow">01 / {ui.work}</p><h2>{ui.projects}</h2></div><p>{ui.workIntro}</p></div>
    <div className="work-list">{copy.work.items.map((item, index) => <article className="work-row" key={item.id}>
      <div className="work-number" aria-hidden="true">0{index + 1}</div>
      <div className="work-title"><p className="kicker">{categories[index]}</p><h3>{item.title}</h3><p className="work-context">{item.context}</p></div>
      <div className="work-description"><p>{item.summary}</p><ul className="tags" aria-label={locale === "pt" ? "Tecnologias" : "Technologies"}>{tags[index].map(tag => <li key={tag}>{tag}</li>)}</ul>
        {index > 0 && <a className="text-link" href="https://prospersync.com" target="_blank" rel="noopener noreferrer">{ui.projectLink} <Arrow /></a>}
      </div>
    </article>)}</div>
  </div></section>;
}

export function AboutSection({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  return <section className="section about-section" id="about"><div className="container about-grid">
    <div><p className="eyebrow">02 / {ui.aboutEyebrow}</p><h2>{ui.aboutTitle}</h2><div className="story-copy">{copy.story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div></div>
    <aside className="profile-notes"><div><span className="note-icon" aria-hidden="true">↳</span><h3>{ui.education}</h3><p>{copy.education.degree}</p><p>{copy.education.institution}</p><span className="mono">{copy.education.period}</span></div><div><span className="note-icon" aria-hidden="true">↗</span><h3>{ui.focus}</h3><p>{ui.focusText}</p></div></aside>
  </div></section>;
}

export function ContactSection({ locale }: { locale: Locale }) {
  const ui = labels[locale];
  return <section className="contact-section" id="contact"><div className="container contact-grid"><div><p className="eyebrow light">04 / {ui.contact}</p><h2>{locale === "pt" ? <>Vamos construir<br /><em>algo útil.</em></> : <>Let’s build<br /><em>something useful.</em></>}</h2></div><div><p>{ui.contactText}</p><div className="contact-links"><a href="https://www.linkedin.com/in/daniel-gaio/" target="_blank" rel="noreferrer noopener">{ui.linkedInAction}<Arrow /></a><a href="https://github.com/danielgaio" target="_blank" rel="noreferrer noopener">{ui.githubAction}<Arrow /></a></div></div></div></section>;
}

export function PortfolioPage({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale]; const posts = getPosts();
  return <SiteShell locale={locale}>
    <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow"><span className="status-dot" aria-hidden="true" />{ui.eyebrow}</p><p className="hero-intro">{ui.hello}</p><h1>{copy.hero.headline}</h1><p className="hero-summary">{copy.hero.summary}</p><div className="hero-actions"><a className="button button-primary" href="#work">{copy.hero.workAction}<Arrow /></a><a className="text-link" href={`/${locale}/blog/`}>{copy.hero.writingAction}<Arrow /></a></div></div>
      <div className="hero-art" aria-hidden="true"><div className="art-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-center">dg<span>.</span></div><div className="art-label label-product">{locale === "pt" ? "produto" : "product"}</div><div className="art-label label-systems">{locale === "pt" ? "sistemas" : "systems"}</div><div className="art-label label-curiosity">{locale === "pt" ? "curiosidade" : "curiosity"}</div><span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span><span className="art-coordinate">DG / 01</span></div>
    </div><div className="container hero-bottom"><span>{locale === "pt" ? "Engenharia com propósito. Aprendizado constante." : "Purposeful engineering. Continuous learning."}</span><a href="#work">{ui.work}<span aria-hidden="true">↓</span></a></div></section>
    <WorkSection locale={locale} /><AboutSection locale={locale} />
    <section className="learning-section"><div className="container learning-grid"><div className="learning-symbol" aria-hidden="true">↗</div><div><p className="eyebrow">{ui.learningEyebrow}</p><h2>{ui.learningTitle}</h2><p>{ui.learningText}</p></div><ul className="learning-topics"><li>{locale === "pt" ? "Segurança" : "Security"}</li><li>{locale === "pt" ? "Resiliência" : "Resilience"}</li><li>{locale === "pt" ? "Observabilidade" : "Observability"}</li><li>{locale === "pt" ? "Sistemas distribuídos" : "Distributed systems"}</li></ul></div></section>
    <section className="section writing-section" id="writing"><div className="container"><div className="section-heading"><div><p className="eyebrow">03 / {ui.writing}</p><h2>{ui.writingIntro}</h2></div><a className="text-link" href={`/${locale}/blog/`}>{ui.allWriting}<Arrow /></a></div><WritingList locale={locale} posts={posts.slice(0,3)} /></div></section>
    <ContactSection locale={locale} />
  </SiteShell>;
}

export function LegacySectionPage({ section }: { section: "work" | "about" | "contact" }) {
  return <SiteShell locale="en"><h1 className="sr-only">{section === "work" ? labels.en.work : section === "about" ? labels.en.about : labels.en.contact}</h1>{section === "work" ? <WorkSection locale="en" /> : section === "about" ? <AboutSection locale="en" /> : <ContactSection locale="en" />}</SiteShell>;
}

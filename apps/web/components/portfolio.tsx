import Image from "next/image";
import { contentFor, labels, type Locale } from "@/lib/site";
import { SiteShell } from "./site-shell";
import { WritingList } from "./writing";
import { getPosts } from "@/lib/posts";
import { Icon } from "./icon";
import { MotionStage } from "./motion-stage";

export function WorkSection({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  const categories = [ui.experience, "ProsperSync / Capture", "ProsperSync / Systems"];
  const titles = locale === "pt" ? ["Engenharia para serviços financeiros", "De uma despesa a uma análise", "Sistemas que fazem acontecer"] : ["Engineering for financial services", "From expense to insight", "Systems that make it work"];
  const tags = [["APIs", "Python", locale === "pt" ? "Integração de dados" : "Data integration"], ["Next.js", "PostgreSQL", "OpenAI"], ["Python", "FastAPI", "LangGraph"]];
  return <section className="work-section" id="work" aria-labelledby="work-heading">
    <h2 className="sr-only" id="work-heading">{ui.work}</h2>
    {copy.work.items.map((item, index) => <article className="work-row" key={item.id}>
      <div className="work-copy" data-reveal><span className="work-number" aria-hidden="true">0{index + 1}</span>
        <div><p className="kicker">{categories[index]}</p><h3>{titles[index]}</h3><p className="work-context">{item.context}</p><p className="work-description">{item.summary}</p>
          <ul className="tags" aria-label={locale === "pt" ? "Tecnologias" : "Technologies"}>{tags[index].map(tag => <li key={tag}>{tag}</li>)}</ul>
          {index > 0 && <a className="text-link" href="https://prospersync.com" target="_blank" rel="noopener noreferrer">{ui.projectLink}<Icon /></a>}
        </div>
      </div>
      <div className="work-art"><Image src={`/media/living-systems/work-${index + 1}-v1.webp`} width={1100} height={619} alt="" aria-hidden="true" unoptimized loading="lazy" /></div>
    </article>)}
  </section>;
}

export function AboutSection({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  return <section className="section about-section" id="about"><div className="container about-grid">
    <div data-reveal><p className="eyebrow">{ui.aboutEyebrow}</p><h2>{locale === "pt" ? <>Curiosidade,<br /><em>na prática.</em></> : <>Curiosity,<br /><em>made practical.</em></>}</h2></div>
    <div className="story-copy" data-reveal>{copy.story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    <aside className="profile-notes" data-reveal><div><h3>{ui.education}</h3><p>{copy.education.degree}</p><p>{copy.education.institution}</p><span className="mono">{copy.education.period}</span></div><div><h3>{ui.focus}</h3><p>{ui.focusText}</p></div></aside>
  </div></section>;
}

export function ContactSection({ locale }: { locale: Locale }) {
  const ui = labels[locale];
  return <section className="contact-section" id="contact"><div className="container contact-grid">
    <div data-reveal><p className="eyebrow">{ui.contact}</p><h2>{locale === "pt" ? <>Vamos construir<br /><em>algo útil.</em></> : <>Let’s build<br /><em>useful things.</em></>}</h2></div>
    <div data-reveal><p>{ui.contactText}</p><div className="contact-links"><a href="https://www.linkedin.com/in/daniel-gaio/" target="_blank" rel="noreferrer noopener">{ui.linkedInAction}<Icon /></a><a href="https://github.com/danielgaio" target="_blank" rel="noreferrer noopener">{ui.githubAction}<Icon /></a></div></div>
  </div></section>;
}

export function PortfolioPage({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  return <SiteShell locale={locale}><MotionStage locale={locale}>
    <section className="hero" aria-labelledby="hero-heading">
      <picture className="hero-picture"><source media="(max-width: 700px)" srcSet="/media/living-systems/hero-mobile-v1.webp" /><Image className="hero-artwork" src="/media/living-systems/hero-v1.webp" alt="" aria-hidden="true" width={1660} height={948} fetchPriority="high" loading="eager" unoptimized /></picture>
      <nav className="section-index" aria-label={locale === "pt" ? "Nesta página" : "On this page"}><a href="#work">{ui.work}</a><a href="#about">{ui.about}</a><a href="#writing">{ui.writing}</a></nav>
      <div className="container hero-content"><div className="hero-copy" data-reveal>
        <p className="hero-intro">{ui.eyebrow}</p>
        <h1 id="hero-heading">{locale === "pt" ? <><span>Tornando </span><span>o complexo </span><em>útil.</em></> : <><span>Making </span><span>complexity </span><em>useful.</em></>}</h1>
        <p className="hero-summary">{locale === "pt" ? "Sou Daniel Gaio, engenheiro de computação. Construo software na interseção entre dados, sistemas e IA aplicada." : "I’m Daniel Gaio, a computer engineer building software at the intersection of data, systems and applied AI."}</p>
        <div className="hero-actions"><a className="text-link primary-link" href="#work">{copy.hero.workAction}<Icon name="arrow-right" /></a><a className="text-link secondary-link" href={`/${locale}/blog/`}>{copy.hero.writingAction}</a></div>
      </div></div>
    </section>
    <WorkSection locale={locale} /><AboutSection locale={locale} />
    <section className="learning-section"><div className="container learning-grid" data-reveal><p className="eyebrow">{ui.learningEyebrow}</p><div><h2>{ui.learningTitle}</h2><p>{ui.learningText}</p></div><ul className="learning-topics"><li>{locale === "pt" ? "Segurança" : "Security"}</li><li>{locale === "pt" ? "Resiliência" : "Resilience"}</li><li>{locale === "pt" ? "Observabilidade" : "Observability"}</li><li>{locale === "pt" ? "Sistemas distribuídos" : "Distributed systems"}</li></ul></div></section>
    <section className="section writing-section" id="writing"><div className="container"><div className="section-heading" data-reveal><div><p className="eyebrow">{ui.writing}</p><h2>{locale === "pt" ? <>Notas sobre software.<br />E o caminho até aqui.</> : <>Notes on software.<br />And the work in between.</>}</h2></div><a className="text-link" href={`/${locale}/blog/`}>{ui.allWriting}<Icon name="arrow-right" /></a></div><WritingList locale={locale} posts={getPosts().slice(0,3)} /></div></section>
    <ContactSection locale={locale} />
  </MotionStage></SiteShell>;
}

export function LegacySectionPage({ section }: { section: "work" | "about" | "contact" }) {
  return <SiteShell locale="en"><h1 className="sr-only">{section === "work" ? labels.en.work : section === "about" ? labels.en.about : labels.en.contact}</h1>{section === "work" ? <WorkSection locale="en" /> : section === "about" ? <AboutSection locale="en" /> : <ContactSection locale="en" />}</SiteShell>;
}

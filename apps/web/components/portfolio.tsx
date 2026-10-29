import Image from "next/image";
import { contentFor, labels, type Locale } from "@/lib/site";
import { SiteShell } from "./site-shell";
import { getPosts, postPath } from "@/lib/posts";
import { Icon } from "./icon";
import { MotionStage } from "./motion-stage";
import { Signature } from "./signature";

const artwork = "/media/curiosity-motion";

/** Separate illustrated layers let the wind move without shifting copy or controls. */
function SceneLeaves({ variant = "hero" }: { variant?: "hero" | "story" }) {
  return <div className={`scene-leaves scene-leaves-${variant}`} aria-hidden="true">
    <Image className="foliage foliage-near" data-ambient src={`${artwork}/foliage-v1.webp`} width={768} height={1024} alt="" unoptimized />
    <Image className="foliage foliage-far" data-ambient src={`${artwork}/foliage-v1.webp`} width={768} height={1024} alt="" unoptimized />
  </div>;
}

export function WorkSection({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  const categories = [locale === "pt" ? "Serviços financeiros" : "Financial services", "ProsperSync / Capture", "ProsperSync / Systems"];
  const titles = locale === "pt" ? ["Engenharia para serviços financeiros", "Imagens e voz viram dados", "Integração de IA e entrega"] : ["Financial-services engineering", "Images and voice into expense data", "AI integration and delivery"];
  const tags = [["APIs", "Python", locale === "pt" ? "Integração de dados" : "Data integration"], ["Next.js", "PostgreSQL", "OpenAI"], ["Python", "FastAPI", "LangGraph"]];
  return <section className="work-section" id="work" aria-labelledby="work-heading">
    <h2 className="sr-only" id="work-heading">{ui.work}</h2>
    {copy.work.items.map((item, index) => <article className="work-row" key={item.id}>
      <div className="work-copy" data-reveal><span className="work-number" aria-hidden="true">0{index + 1}</span>
        <div><p className="kicker">{categories[index]}</p><h3>{titles[index]}</h3>
          {index === 0 && <p className="work-deck">{locale === "pt" ? "APIs, automação e integração de dados." : "APIs, automation and data integration."}</p>}
          <details className="work-details"><summary>{locale === "pt" ? "Por trás do trabalho" : "Behind the work"}<Icon name="arrow-right" /></summary>
            <p className="work-context">{item.context}</p><p className="work-description">{item.summary}</p>
            <ul className="tags" aria-label={locale === "pt" ? "Tecnologias" : "Technologies"}>{tags[index].map(tag => <li key={tag}>{tag}</li>)}</ul>
            {index > 0 && <a className="text-link" href="https://prospersync.com" target="_blank" rel="noopener noreferrer">{ui.projectLink}<Icon /></a>}
          </details>
        </div>
      </div>
      <div className="work-art"><Image className="work-illustration" src={`${artwork}/work-${index + 1}-v1.webp`} width={1536} height={512} alt="" aria-hidden="true" unoptimized loading="lazy" /><Image className={`work-glow work-glow-${index + 1}`} data-ambient src={`${artwork}/light-v1.webp`} width={512} height={512} alt="" aria-hidden="true" unoptimized loading="lazy" /></div>
    </article>)}
  </section>;
}

export function AboutSection({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  return <section className="about-section" id="about" aria-labelledby="about-heading">
    <div className="adventure-scene">
      <Image className="adventure-backdrop" src={`${artwork}/story-v1.webp`} width={1792} height={768} alt="" aria-hidden="true" unoptimized loading="lazy" />
      <SceneLeaves variant="story" />
      <div className="adventure-copy container" data-reveal><p className="eyebrow">{locale === "pt" ? "Além do código" : "Beyond the code"}</p><h2 id="about-heading">{locale === "pt" ? <>Um pouco de curiosidade.<br /><em>Muita aventura.</em></> : <>A little curiosity.<br /><em>A lot of adventure.</em></>}</h2><p className="adventure-interests">{locale === "pt" ? "Motos / Carros / Aventura" : "Motorcycles / Cars / Adventure"}</p></div>
    </div>
    <details className="story-details container"><summary><span>{ui.about}</span><span>{locale === "pt" ? "Formação, trajetória e o que vem a seguir" : "Background, perspective and what comes next"}</span><Icon name="arrow-right" /></summary><div className="about-grid">
      <div className="story-copy">{copy.story.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <aside className="profile-notes"><div><h3>{ui.education}</h3><p>{copy.education.degree}</p><p>{copy.education.institution}</p><span className="mono">{copy.education.period}</span></div><div><h3>{ui.focus}</h3><p>{ui.focusText}</p></div></aside>
    </div></details>
  </section>;
}

export function ContactSection({ locale }: { locale: Locale }) {
  const ui = labels[locale];
  return <section className="contact-section" id="contact"><div className="container contact-grid">
    <a className="contact-signature" href={`/${locale}/`} aria-label="Daniel Gaio"><Signature /></a>
    <div data-reveal><h2>{locale === "pt" ? "Vamos construir algo útil." : "Let’s build useful things."}</h2><p>{ui.contactText}</p><div className="contact-links"><a href="https://www.linkedin.com/in/daniel-gaio/" target="_blank" rel="noreferrer noopener">{ui.linkedInAction}<Icon /></a><a href="https://github.com/danielgaio" target="_blank" rel="noreferrer noopener">{ui.githubAction}<Icon /></a></div></div>
  </div></section>;
}

export function PortfolioPage({ locale }: { locale: Locale }) {
  const copy = contentFor(locale); const ui = labels[locale];
  const featuredPost = getPosts().find(post => post.slug === "the-daily-architecture-velocity-vs-preservation-8753ef6d81c8") ?? getPosts()[0];
  return <MotionStage><SiteShell locale={locale}>
    <div className="anime-home">
      <section className="hero" aria-labelledby="hero-heading">
        <picture className="hero-picture"><source media="(max-width: 700px)" srcSet={`${artwork}/hero-mobile-v1.webp`} /><Image className="hero-artwork" src={`${artwork}/hero-v1.webp`} alt="" aria-hidden="true" width={1792} height={896} fetchPriority="high" loading="eager" unoptimized /></picture>
        <SceneLeaves />
        <nav className="section-index" aria-label={locale === "pt" ? "Nesta página" : "On this page"}><a href="#work">{locale === "pt" ? "Trabalho" : "Work"}</a><a href="#about">{locale === "pt" ? "História" : "Story"}</a><a href="#writing">{ui.writing}</a></nav>
        <div className="container hero-content"><div className="hero-copy" data-reveal>
          <p className="hero-intro">{locale === "pt" ? "Software. Motores. Novas possibilidades." : "Software. Engines. New possibilities."}</p>
          <h1 id="hero-heading">{locale === "pt" ? <><span>Curiosidade,</span><em>em movimento.</em></> : <><span>Curiosity,</span><em>in motion.</em></>}</h1>
          <p className="hero-summary">{locale === "pt" ? "Sou Daniel Gaio, engenheiro de computação. Trabalho com software, dados e IA aplicada." : "I’m Daniel Gaio, a computer engineer working across software, data and applied AI."}</p>
          <div className="hero-actions"><a className="text-link primary-link" href="#work">{copy.hero.workAction}<Icon name="arrow-right" /></a><a className="text-link secondary-link" href={`/${locale}/blog/`}>{copy.hero.writingAction}</a></div>
        </div></div>
      </section>
      <WorkSection locale={locale} /><AboutSection locale={locale} />
      <section className="home-writing" id="writing" aria-labelledby="writing-heading"><div className="container writing-strip" data-reveal><div><p className="eyebrow">{ui.writing}</p><h2 id="writing-heading">{featuredPost ? <a lang={featuredPost.language === "pt" ? "pt-BR" : "en"} href={postPath(featuredPost)}>{featuredPost.title}</a> : ui.writingIntro}</h2></div><p>{locale === "pt" ? "Escrevo sobre construir com IA, trabalhar com sistemas complexos e o que aprendo pelo caminho." : "I write about the practical side of building with AI, working with complex systems and what I’m learning along the way."}</p><a className="text-link" href={`/${locale}/blog/`}>{ui.allWriting}<Icon name="arrow-right" /></a></div></section>
      <section className="learning-section"><div className="container"><details className="learning-details"><summary><span className="eyebrow">{ui.learningEyebrow}</span><span>{ui.learningTitle}</span><Icon name="arrow-right" /></summary><div className="learning-grid"><p>{ui.learningText}</p><ul className="learning-topics"><li>{locale === "pt" ? "Segurança" : "Security"}</li><li>{locale === "pt" ? "Resiliência" : "Resilience"}</li><li>{locale === "pt" ? "Observabilidade" : "Observability"}</li><li>{locale === "pt" ? "Sistemas distribuídos" : "Distributed systems"}</li></ul></div></details></div></section>
      <ContactSection locale={locale} />
    </div>
  </SiteShell></MotionStage>;
}

export function LegacySectionPage({ section }: { section: "work" | "about" | "contact" }) {
  return <SiteShell locale="en"><h1 className="sr-only">{section === "work" ? labels.en.work : section === "about" ? labels.en.about : labels.en.contact}</h1>{section === "work" ? <WorkSection locale="en" /> : section === "about" ? <AboutSection locale="en" /> : <ContactSection locale="en" />}</SiteShell>;
}

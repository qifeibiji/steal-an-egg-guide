import Link from "next/link";
import type { PageData } from "@/lib/site-data";
import { pages, titleForPath } from "@/lib/site-data";

function RelatedLinks({ paths }: { paths: string[] }) {
  return (
    <div className="related-links" aria-label="Related guides">
      {paths.map((path) => (
        <Link href={path} key={path}>
          {titleForPath(path)} <span aria-hidden="true">→</span>
        </Link>
      ))}
    </div>
  );
}

function GuideIndex() {
  const guides = pages.filter((page) => page.path !== "/" && page.path !== "/guides/");

  return (
    <section className="guide-index" aria-labelledby="guide-index-title">
      <div className="section-label">The full MVP index</div>
      <h2 id="guide-index-title">Choose the next useful question.</h2>
      <div className="guide-index__grid">
        {guides.map((guide) => (
          <Link className="guide-index__item" href={guide.path} key={guide.path}>
            <span className="guide-index__topic">{guide.topic}</span>
            <strong>{guide.h1}</strong>
            <span>{guide.answer}</span>
            <b aria-hidden="true">→</b>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GuidePage({ page }: { page: PageData }) {
  const isHub = page.path === "/guides/";

  return (
    <article className="guide-page">
      <div className="article-rail">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        {isHub ? <span>Guides</span> : <Link href="/guides/">Guides</Link>}
        {!isHub && <><span aria-hidden="true">/</span><span>{page.topic}</span></>}
      </div>

      <header className="article-header">
        <p className="article-kicker">{page.topic}</p>
        <p className="checked-note"><span aria-hidden="true">●</span> Checked {page.checkedDate}</p>
        <h1>{page.h1}</h1>
        <p className="article-answer">{page.answer}</p>
        <p className="article-intro">{page.intro}</p>
      </header>

      {isHub && <GuideIndex />}

      <div className="article-body">
        {page.sections.map((section, index) => (
          <section className="article-section" key={section.heading}>
            <div className="section-counter" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
            <div>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <RelatedLinks paths={section.links} />
            </div>
          </section>
        ))}
      </div>

      <aside className="sources-card" aria-label="Recorded sources">
        <div>
          <p className="section-label">Recorded sources</p>
          <h2>Check the evidence before the game changes.</h2>
        </div>
        <ol>
          {page.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noreferrer">{source.name} <span aria-hidden="true">↗</span></a>
            </li>
          ))}
        </ol>
      </aside>
    </article>
  );
}

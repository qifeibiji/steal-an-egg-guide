import Link from "next/link";
import type { PageData } from "@/lib/site-data";
import { pages, titleForPath } from "@/lib/site-data";

const guideGroups = [
  { name: "Getting started", paths: ["/guides/beginner-guide/"] },
  { name: "Collection", paths: ["/guides/eggs-pets-income/"] },
  { name: "Progression", paths: ["/guides/speed-treadmill-biomes/", "/guides/base-upgrades-money/"] },
  { name: "Status", paths: ["/guides/admin-abuse-events/", "/guides/codes/"] }
];

function formatCheckedDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function RelatedLinks({ paths }: { paths: string[] }) {
  return (
    <div className="related-links" aria-label="Related guides">
      <span>Related guides</span>
      {paths.map((path) => (
        <Link href={path} key={path}>
          {titleForPath(path)} <i aria-hidden="true">&rarr;</i>
        </Link>
      ))}
    </div>
  );
}

function GuideIndex() {
  return (
    <section className="guide-index" aria-labelledby="guide-index-title">
      <div className="guide-index__heading">
        <div>
          <p className="section-label">Guide index</p>
          <h2 id="guide-index-title">Find the right part of the loop.</h2>
        </div>
        <p>Six focused pages, grouped by the decision you need to make.</p>
      </div>
      <div className="guide-groups">
        {guideGroups.map((group) => (
          <section className="guide-group" key={group.name}>
            <h3>{group.name}</h3>
            <div className="guide-group__items">
              {group.paths.map((path) => {
                const guide = pages.find((entry) => entry.path === path);
                if (!guide) return null;

                return (
                  <Link className="guide-index__item" href={guide.path} key={guide.path}>
                    <span className="guide-index__topic">{guide.topic}</span>
                    <strong>{guide.h1}</strong>
                    <span>{guide.answer}</span>
                    <b aria-hidden="true">&rarr;</b>
                  </Link>
                );
              })}
            </div>
          </section>
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
        <div className="article-header__meta">
          <p className="article-kicker">{page.topic}</p>
          <p className="checked-note"><span aria-hidden="true" />Last checked: {formatCheckedDate(page.checkedDate)}</p>
        </div>
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
              {section.items && (
                <ul className="article-list">
                  {section.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
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
              <a href={source.url} rel="noreferrer">{source.name} <span aria-hidden="true">&nearr;</span></a>
            </li>
          ))}
        </ol>
      </aside>
    </article>
  );
}

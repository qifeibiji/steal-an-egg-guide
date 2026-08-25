import Link from "next/link";
import type { PageData } from "@/lib/site-data";
import { pages } from "@/lib/site-data";

const quickReference = [
  {
    href: "/guides/codes/",
    label: "Codes status",
    title: "No verified active codes",
    detail: "Check the current recorded status before looking for a redemption path.",
    accent: "amber"
  },
  {
    href: "/guides/eggs-pets-income/",
    label: "Collection",
    title: "Eggs & pets",
    detail: "Compare live-list context without treating a roster as permanent.",
    accent: "cyan"
  },
  {
    href: "/guides/beginner-guide/",
    label: "Getting started",
    title: "Beginner guide",
    detail: "Follow the core loop from egg to pet to your next upgrade.",
    accent: "blue"
  },
  {
    href: "/guides/speed-treadmill-biomes/",
    label: "Progression",
    title: "Speed & biomes",
    detail: "Use the treadmill path when movement is the current bottleneck.",
    accent: "blue"
  }
];

const snapshot = [
  { value: "8", label: "Pages" },
  { value: "6", label: "Core guides" },
  { value: "12", label: "Tracked topics" },
  { value: "Aug 25", label: "Last checked" }
];

export function HomePage({ page }: { page: PageData }) {
  const guidePages = pages.filter((entry) => entry.path !== "/" && entry.path !== "/guides/");

  return (
    <article className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="article-kicker">Independent Roblox Game Guide</p>
          <p className="hero-game-title">Steal An Egg Guide</p>
          <h1>{page.h1}</h1>
          <p className="home-hero__answer">{page.answer}</p>
          <p className="home-hero__intro">{page.intro}</p>
          <div className="hero-actions">
            <Link href="/guides/">Explore guides <span aria-hidden="true">&rarr;</span></Link>
            <Link href="/guides/beginner-guide/">Start with the core loop</Link>
          </div>
        </div>
        <aside className="hero-status" aria-label="Site status">
          <div className="status-card__top"><span className="status-dot" />Reference status</div>
          <strong>Update-aware, source-bounded help.</strong>
          <p>Read the checked date before relying on collections, events, or codes.</p>
          <Link href="/guides/codes/">View codes status <span aria-hidden="true">&rarr;</span></Link>
        </aside>
      </section>

      <section className="home-module quick-reference" aria-labelledby="quick-reference-title">
        <div className="module-heading">
          <div>
            <p className="section-label">Quick reference</p>
            <h2 id="quick-reference-title">Four fast ways into the game.</h2>
          </div>
          <Link href="/guides/">All guides <span aria-hidden="true">&rarr;</span></Link>
        </div>
        <div className="quick-reference__grid">
          {quickReference.map((item) => (
            <Link className={`reference-card reference-card--${item.accent}`} href={item.href} key={item.href}>
              <span className="reference-card__label">{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
              <b aria-hidden="true">&rarr;</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-module site-snapshot" aria-labelledby="snapshot-title">
        <div className="module-heading module-heading--compact">
          <div>
            <p className="section-label">Site snapshot</p>
            <h2 id="snapshot-title">A compact reference, not a live tracker.</h2>
          </div>
          <p>Only confirmed site information is shown here.</p>
        </div>
        <div className="snapshot-grid">
          {snapshot.map((item) => (
            <div className="snapshot-card" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-module guide-grid-section" aria-labelledby="guide-grid-title">
        <div className="module-heading">
          <div>
            <p className="section-label">Guide directory</p>
            <h2 id="guide-grid-title">Choose the next useful question.</h2>
          </div>
          <Link href="/guides/">Open guide hub <span aria-hidden="true">&rarr;</span></Link>
        </div>
        <div className="guide-grid">
          {guidePages.map((guide) => (
            <Link className="guide-card" href={guide.path} key={guide.path}>
              <span>{guide.topic}</span>
              <strong>{guide.h1}</strong>
              <p>{guide.answer}</p>
              <b aria-hidden="true">&rarr;</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-module status-desk" aria-labelledby="status-title">
        <div className="status-desk__copy">
          <p className="section-label">Fast-changing / status</p>
          <h2 id="status-title">Information that needs a checked date.</h2>
          <p>Codes and events change faster than the core game loop. These cards keep the date and the evidence boundary visible.</p>
        </div>
        <div className="status-desk__links">
          <Link href="/guides/codes/">
            <span>Codes status</span>
            <strong>No verified active codes</strong>
            <p>Recorded sources reported no active codes or redemption menu at the last check.</p>
            <i aria-hidden="true">&rarr;</i>
          </Link>
          <Link href="/guides/admin-abuse-events/">
            <span>Admin Abuse</span>
            <strong>Date-bounded event context</strong>
            <p>Confirmed and unconfirmed event details remain clearly separated.</p>
            <i aria-hidden="true">&rarr;</i>
          </Link>
        </div>
      </section>

      <section className="home-sources" aria-labelledby="home-source-title">
        <p className="section-label">Evidence boundary</p>
        <h2 id="home-source-title">Built from recorded sources, not filler.</h2>
        <p>Source links are shown on every page. The site does not claim official status, publish unverified values, or invent content to fill a list.</p>
      </section>
    </article>
  );
}

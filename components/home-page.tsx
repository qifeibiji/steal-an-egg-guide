import Link from "next/link";
import type { PageData } from "@/lib/site-data";
import { pages } from "@/lib/site-data";

const startPaths = [
  "/guides/beginner-guide/",
  "/guides/eggs-pets-income/",
  "/guides/speed-treadmill-biomes/"
];

export function HomePage({ page }: { page: PageData }) {
  const startGuides = startPaths.map((path) => pages.find((entry) => entry.path === path)).filter(Boolean) as PageData[];

  return (
    <article className="home-page">
      <section className="home-hero">
        <div className="home-hero__index" aria-hidden="true"><span>Field guide</span><b>01</b></div>
        <div>
          <p className="article-kicker">Independent Roblox game reference</p>
          <h1>{page.h1}</h1>
          <p className="home-hero__answer">{page.answer}</p>
          <p>{page.intro}</p>
          <div className="hero-actions">
            <Link href="/guides/">Browse the guide hub <span aria-hidden="true">→</span></Link>
            <Link href="/guides/beginner-guide/">Read the beginner guide</Link>
          </div>
        </div>
      </section>

      <section className="home-start" aria-labelledby="start-title">
        <div className="home-section-heading">
          <div>
            <p className="section-label">Popular start points</p>
            <h2 id="start-title">Three places to begin.</h2>
          </div>
          <Link href="/guides/">View all six guides <span aria-hidden="true">→</span></Link>
        </div>
        <div className="start-grid">
          {startGuides.map((guide, index) => (
            <Link href={guide.path} className="start-card" key={guide.path}>
              <span>0{index + 1}</span>
              <h3>{guide.h1}</h3>
              <p>{guide.answer}</p>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-topics" aria-labelledby="topics-title">
        <div>
          <p className="section-label">Topic map</p>
          <h2 id="topics-title">Follow the part of the loop you are in.</h2>
        </div>
        <div className="topic-links">
          <Link href="/guides/eggs-pets-income/"><span>Collections</span><b>Eggs, pets, and income</b><i>→</i></Link>
          <Link href="/guides/base-upgrades-money/"><span>Progression</span><b>Money and base upgrades</b><i>→</i></Link>
          <Link href="/guides/speed-treadmill-biomes/"><span>Movement</span><b>Treadmill, speed, and biomes</b><i>→</i></Link>
        </div>
      </section>

      <section className="status-desk" aria-labelledby="status-title">
        <div>
          <p className="section-label">Status desk</p>
          <h2 id="status-title">Fast-changing answers stay dated.</h2>
          <p>Read the checked date before using information about events, collections, or codes. The most reliable guide is the one that says what it does not yet know.</p>
        </div>
        <div className="status-desk__links">
          <Link href="/guides/codes/"><span>Codes status</span><b>No active codes or redemption menu reported at the last check.</b><i>→</i></Link>
          <Link href="/guides/admin-abuse-events/"><span>Event context</span><b>Recorded Admin Abuse information, with unconfirmed details kept separate.</b><i>→</i></Link>
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

import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/guides/", label: "Guides" },
  { href: "/guides/codes/", label: "Codes" },
  { href: "/guides/admin-abuse-events/", label: "Status" }
];

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-frame">
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="wordmark" href="/" aria-label="Steal An Egg Guide home">
            <span className="wordmark__mark" aria-hidden="true">SAE</span>
            <strong>Steal An Egg</strong>
          </Link>
          <span className="header-badge">Independent guide</span>
          <nav aria-label="Primary navigation" className="primary-nav">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div>
          <p className="footer-mark">Steal An Egg Guide</p>
          <p>Independent player reference. Not affiliated with Roblox or the game’s developer.</p>
        </div>
        <Link href="/guides/">Browse all guides <span aria-hidden="true">&rarr;</span></Link>
      </footer>
    </div>
  );
}

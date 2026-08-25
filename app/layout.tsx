import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { siteUrl } from "@/lib/site-data";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Steal An Egg Guide",
    template: "%s | Steal An Egg Guide"
  },
  description: "Independent, update-aware Steal An Egg game guides with clear source boundaries.",
  openGraph: {
    type: "website",
    siteName: "Steal An Egg Guide",
    title: "Steal An Egg Guide",
    description: "Independent, update-aware Steal An Egg game guides with clear source boundaries."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

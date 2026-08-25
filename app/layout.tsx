import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { siteUrl } from "@/lib/site-data";

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;

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
  verification: {
    google: googleSiteVerification
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
        {gaMeasurementId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag("js", new Date()); gtag("config", ${JSON.stringify(gaMeasurementId)});`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}

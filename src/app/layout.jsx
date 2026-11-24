import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from "@/components/analytics";
import { AppProvider } from "@/components/app-state";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/ui";
import { CITIES, NAV, SITE } from "@/data/site";
import { analytics, ready } from "@/data/store";
import { IconSprite } from "@/components/icon-sprite";
import { searchList } from "@/lib/search-items";
import "./globals.css";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" });

export async function generateMetadata() {
  await ready();
  const a = analytics();
  return {
    metadataBase: new URL(SITE.url),
    applicationName: SITE.name,
    verification: {
      ...(a.gscVerification ? { google: a.gscVerification } : {}),
      ...(a.bingVerification ? { other: { "msvalidate.01": a.bingVerification } } : {}),
    },
  };
}

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#080c16" };

// Where the browser sends page views and clicks (the CMS's public API).
const collectUrl = `${(process.env.CMS_PUBLIC_URL ?? process.env.CMS_API_URL ?? "http://localhost:4000").replace(/\/$/, "")}/api/public/collect`;

export default async function RootLayout({ children }) {
  await ready();
  const a = analytics();
  // Only the first suggestions go into every page; the full search list loads when the search box is used.
  const searchItems = searchList().slice(0, 6);
  return (
    <html lang="en-IN" className={`${manrope.variable} ${bricolage.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <IconSprite />
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-100 focus:bg-lime-400 focus:p-3 focus:font-bold">
          Skip to main content
        </a>
        <AppProvider cities={CITIES} siteName={SITE.name}>
          <Header searchItems={searchItems} nav={NAV} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url }} />
        <Suspense fallback={null}>
          <Analytics ga4Id={a.ga4Id} clarityId={a.clarityId} firstParty={a.firstParty} collectUrl={collectUrl} />
        </Suspense>
      </body>
    </html>
  );
}

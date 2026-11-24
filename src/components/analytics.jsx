"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

// Clicks worth counting: any element marked data-track, plus links into the money pages.
const LINK_GOALS = [
  [/^\/compare-cars/, "compare_link"],
  [/\/dealers$/, "dealers_link"],
  [/^\/emi-calculator|\/emi$/, "emi_link"],
  [/^tel:/, "call_dealer"],
];

/**
 * Analytics without slowing the page: GA4 and Clarity load only after the page
 * is idle (lazyOnload), and the built-in counter sends one tiny beacon per page
 * view or tracked click to the CMS. No cookies are set by the built-in counter.
 */
export function Analytics({ ga4Id, clarityId, firstParty, collectUrl }) {
  const path = usePathname();

  useEffect(() => {
    if (!firstParty) return;
    const data = JSON.stringify({ type: "pageview", path, referrer: document.referrer });
    navigator.sendBeacon?.(collectUrl, new Blob([data], { type: "text/plain" }));
  }, [path, firstParty, collectUrl]);

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target?.closest("[data-track], a[href]");
      if (!el) return;
      let target = el.dataset.track;
      if (!target && el instanceof HTMLAnchorElement) target = LINK_GOALS.find(([re]) => re.test(el.getAttribute("href") ?? ""))?.[1];
      if (!target) return;
      if (firstParty) navigator.sendBeacon?.(collectUrl, new Blob([JSON.stringify({ type: "click", path: window.location.pathname, target })], { type: "text/plain" }));
      window.gtag?.("event", target, { page_path: window.location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [firstParty, collectUrl]);

  return (
    <>
      {ga4Id && /^G-[A-Z0-9]+$/.test(ga4Id) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="lazyOnload" />
          <Script
            id="ga4"
            strategy="lazyOnload"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}');`}</Script>
        </>
      )}
      {clarityId && /^[a-z0-9]+$/i.test(clarityId) && (
        <Script
          id="clarity"
          strategy="lazyOnload"
        >{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}</Script>
      )}
    </>
  );
}

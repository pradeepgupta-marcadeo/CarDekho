"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const MODEL_TABS = [
  { slug: "", label: "Overview" },
  { slug: "price", label: "Price" },
  { slug: "variants", label: "Variants" },
  { slug: "specs", label: "Specs" },
  { slug: "images", label: "Images" },
  { slug: "colours", label: "Colours" },
  { slug: "mileage", label: "Mileage" },
  { slug: "reviews", label: "Reviews" },
  { slug: "emi", label: "EMI" },
  { slug: "dealers", label: "Dealers" },
  { slug: "news", label: "News" },
  { slug: "faqs", label: "FAQs" },
];

/** `hide` lists tab slugs this car does not have, e.g. "mileage" when no figure is listed yet. */
export function ModelNav({ base, name, hide = [] }) {
  const path = usePathname();
  return (
    <nav aria-label={`${name} sections`} className="sticky top-16 z-30 border-b border-ink-200 bg-white/95 backdrop-blur">
      <ul className="scrollbar-none mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 lg:px-6">
        {MODEL_TABS.filter((t) => !hide.includes(t.slug)).map((t) => {
          const href = t.slug ? `${base}/${t.slug}` : base;
          const on = t.slug ? path === href || path.startsWith(`${href}/`) || (t.slug === "price" && path.startsWith(`${base}/price-in-`)) : path === base;
          return (
            <li key={t.label} className="shrink-0">
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                aria-label={`${name} ${t.label}`}
                className={`relative block px-3 py-3.5 text-sm font-bold transition ${on ? "text-ink-950" : "text-ink-500 hover:text-ink-900"}`}
              >
                {t.label}
                {on && <motion.span layoutId="model-tab" className="absolute inset-x-2 bottom-0 h-0.75 rounded-full bg-lime-500" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

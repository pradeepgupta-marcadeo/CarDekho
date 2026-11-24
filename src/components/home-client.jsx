"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CarCard, Pic } from "./cards";
import { Carousel } from "./Carousel";

const budgets = [
  { label: "Under ₹10 L", href: "/new-cars/under-10-lakh" },
  { label: "Under ₹15 L", href: "/new-cars/under-15-lakh" },
  { label: "Under ₹25 L", href: "/new-cars/under-25-lakh" },
  { label: "Above ₹25 L", href: "/new-cars/above-25-lakh" },
];
const bodies = [
  { label: "SUV", href: "/new-cars/suv" },
  { label: "Hatchback", href: "/new-cars/hatchback" },
  { label: "Sedan", href: "/new-cars/sedan" },
  { label: "MUV", href: "/new-cars/muv" },
  { label: "Luxury", href: "/new-cars/luxury" },
  { label: "Electric", href: "/electric-cars" },
];
function Finder() {
  const router = useRouter();
  const [pick, setPick] = useState("/new-cars/suv");
  return (
    <div className="rounded-3xl bg-white p-5 text-ink-900 shadow-lift sm:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-ink-500">What are you looking for?</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {bodies.map((o) => (
          <button
            key={o.href}
            onClick={() => setPick(o.href)}
            aria-pressed={pick === o.href}
            className={`rounded-xl border px-1 py-2.5 text-xs font-bold transition sm:text-sm ${pick === o.href ? "border-ink-950 bg-lime-400" : "border-ink-200 hover:border-ink-900"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-widest text-ink-500">Or jump to a budget</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {budgets.map((b) => (
          <Link key={b.href} href={b.href} className="rounded-full bg-ink-100 px-3 py-1.5 text-xs font-semibold transition hover:bg-lime-300">
            {b.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => router.push(pick)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink-950 py-3.5 font-bold text-white transition hover:bg-ink-700 active:scale-[0.99]"
      >
        <Search className="size-4" /> Show matching cars
      </button>
      <Link href="/new-cars" className="mt-3 block text-center text-sm font-semibold text-ink-500 hover:text-ink-900">
        Open all filters
      </Link>
    </div>
  );
}

const CHAR_DELAY = 0.04;

/** The hero heading "types" itself in CSS, so the text is part of the first paint and needs no JavaScript. */
function TypedHeading({ parts: HEADING }) {
  let index = 0;
  const total = HEADING.reduce((n, p) => n + p.text.length, 0);
  return (
    <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:mt-12">
      <span className="sr-only">{HEADING.map((p) => p.text).join("")}</span>
      <span aria-hidden>
        {HEADING.map((part) =>
          part.text.split(/( )/).map((word, w) => (
            <span key={`${part.text}-${w}`} className={`${word === " " ? "" : "inline-block"} ${part.lime ? "text-lime-400" : ""}`}>
              {word.split("").map((ch, c) => {
                const delay = index++ * CHAR_DELAY;
                return ch === " " ? (
                  " "
                ) : (
                  <span key={c} className="type-ch" style={{ animationDelay: `${delay.toFixed(2)}s` }}>
                    {ch}
                  </span>
                );
              })}
            </span>
          )),
        )}
        <span className="type-caret ml-1 inline-block h-[0.85em] w-0.75 translate-y-[0.08em] bg-lime-400" style={{ animationDelay: `${(total * CHAR_DELAY).toFixed(2)}s` }} />
      </span>
    </h1>
  );
}

export function Hero({ slides, heading }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, [slides.length, reduce]);
  const s = slides[i];
  return (
    <section aria-label="Featured cars" className="relative overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0">
        {/* initial={false}: the first slide is painted at once (it is the LCP image); later slides fade in. */}
        <AnimatePresence mode="sync" initial={false}>
          <motion.div key={s.href} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
            <Pic photo={s.photo} alt={s.alt} sizes="100vw" priority={i === 0} className="animate-kenburns h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-ink-950/65 lg:bg-linear-to-r lg:from-ink-950/95 lg:via-ink-950/25 lg:to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-transparent to-ink-950/55" />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-10 pt-8 lg:min-h-150 lg:grid-cols-[400px_1fr] lg:gap-12 lg:px-6 lg:pb-14 lg:pt-10">
        <div className="order-2 self-center lg:order-1">
          <Finder />
        </div>
        <div className="order-1 flex flex-col justify-between gap-6 lg:order-2">
          <TypedHeading parts={heading} />
          <div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={s.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="max-w-lg">
                <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink-950">{s.eyebrow}</span>
                <p className="font-display mt-3 text-2xl font-bold">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-100 sm:text-base">{s.text}</p>
                <Link href={s.href} className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-lime-400 hover:underline">
                  {s.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 grid max-w-xl grid-cols-3 gap-3">
              {slides.map((sl, n) => (
                <button key={sl.href} onClick={() => setI(n)} aria-label={`Show ${sl.short}`} aria-current={n === i} className="text-left text-xs font-semibold text-ink-100 sm:text-sm">
                  <span className="mb-2 block h-1 overflow-hidden rounded-full bg-white/25">
                    {n === i && (
                      <motion.span
                        key={i}
                        className="block h-full bg-lime-400"
                        initial={{ width: reduce ? "100%" : 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: reduce ? 0 : 6.5, ease: "linear" }}
                      />
                    )}
                  </span>
                  {sl.short}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TabbedCars({ tabs, id }) {
  const [active, setActive] = useState(0);
  // The first tab is painted with the page; only a tab the visitor switches to fades in.
  const [switched, setSwitched] = useState(false);
  const tab = tabs[active];
  return (
    <div>
      <div role="tablist" aria-label="Choose a category" className="scrollbar-none flex gap-2 overflow-x-auto">
        {tabs.map((t, i) => (
          <button key={t.label} role="tab" aria-selected={i === active} onClick={() => {
              setActive(i);
              setSwitched(true);
            }}
            className="relative shrink-0 rounded-full px-4 py-2 text-sm font-bold">
            {i === active && <motion.span layoutId={`tab-${id}`} className="absolute inset-0 rounded-full bg-ink-950" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className={`relative ${i === active ? "text-white" : "text-ink-700"}`}>{t.label}</span>
          </button>
        ))}
      </div>
      <motion.div key={tab.label} initial={switched ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mt-2">
        <Carousel label={`${tab.label} cars`}>
          {tab.cars.map((c) => (
            <CarCard key={c.key} car={c} />
          ))}
        </Carousel>
      </motion.div>
      <Link href={tab.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold hover:underline">
        {tab.linkLabel}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

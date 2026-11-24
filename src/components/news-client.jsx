"use client";

import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Link2, MessageCircle, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "./app-state";
import { Pic } from "./cards";

export function ShareRail({ title }) {
  const [copied, setCopied] = useState(false);
  const url = () => (typeof window === "undefined" ? "" : window.location.href);
  const open = (base) => window.open(base + encodeURIComponent(`${title} ${url()}`), "_blank", "noopener");
  const btn = "grid size-10 place-items-center rounded-full transition hover:scale-110";
  return (
    <div className="flex flex-row items-center gap-3 lg:flex-col" role="group" aria-label="Share this story">
      <p className="text-xs font-semibold leading-tight text-ink-500 lg:text-center">
        Share<span className="lg:block"> via</span>
      </p>
      <button onClick={() => open("https://wa.me/?text=")} aria-label="Share on WhatsApp" className={`${btn} bg-lime-400 text-ink-950`}>
        <MessageCircle className="size-5" />
      </button>
      <button onClick={() => open("https://twitter.com/intent/tweet?text=")} aria-label="Share on X" className={`${btn} bg-ink-950 text-sm font-bold text-white`}>
        X
      </button>
      <button
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, url: url() });
            } catch {
              /* user closed the sheet */
            }
          }
        }}
        aria-label="More share options"
        className={`${btn} bg-ink-100`}
      >
        <Share2 className="size-4" />
      </button>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* clipboard blocked */
          }
        }}
        aria-label={copied ? "Link copied" : "Copy link"}
        className={`${btn} bg-ink-100`}
      >
        {copied ? <Check className="size-4 text-lime-700" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}

export function CompareSlider({ left, right }) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="relative my-6 aspect-16/10 select-none overflow-hidden rounded-2xl bg-ink-100">
      <Pic photo={right.photo} alt={`${right.label} for side-by-side comparison`} sizes="(max-width: 1024px) 100vw, 800px" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Pic photo={left.photo} alt={`${left.label} for side-by-side comparison`} sizes="(max-width: 1024px) 100vw, 800px" className="h-full w-full object-cover" />
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-bold text-white">{left.label}</span>
      <span className="absolute right-3 top-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-bold text-white">{right.label}</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lift">
          <ChevronLeft className="size-4" />
          <ChevronRight className="size-4" />
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(+e.target.value)}
        aria-label={`Slide to compare ${left.label} and ${right.label}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </figure>
  );
}

export function SideTabs({ title, tabs, footer }) {
  const [i, setI] = useState(0);
  const cur = tabs[i];
  return (
    <section className="rounded-2xl border border-ink-100 bg-white shadow-card">
      <h2 className="px-5 pt-5 text-xl font-extrabold">{title}</h2>
      {tabs.length > 1 && (
        <div role="tablist" aria-label={title} className="mt-2 flex gap-5 border-b border-ink-100 px-5">
          {tabs.map((t, n) => (
            <button key={t.label} role="tab" aria-selected={n === i} onClick={() => setI(n)} className={`relative py-2.5 text-sm font-semibold ${n === i ? "text-ink-950" : "text-ink-500"}`}>
              {t.label}
              {n === i && <motion.span layoutId={`side-${title}`} className="absolute inset-x-0 bottom-0 h-0.75 rounded-full bg-lime-500" />}
            </button>
          ))}
        </div>
      )}
      <ul className="space-y-3 p-5">
        {cur.items.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="group flex items-start gap-3">
              <span className="relative aspect-16/10 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                <Pic photo={it.photo} alt={`Photo for ${it.title}`} sizes="96px" className="h-full w-full object-cover transition group-hover:scale-105" />
                {it.badge && <span className="absolute left-1 top-1 rounded bg-white px-1 text-[9px] font-bold uppercase">{it.badge}</span>}
              </span>
              <span className="min-w-0">
                <span className="line-clamp-3 text-sm font-medium leading-snug group-hover:underline">{it.title}</span>
                {it.meta && <span className="mt-0.5 block text-sm font-bold">{it.meta}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {footer && (
        <div className="px-5 pb-5">
          <Link href={footer.href} className="text-sm font-bold text-lime-700 hover:underline">
            {footer.label}
          </Link>
        </div>
      )}
    </section>
  );
}

export function Helpful() {
  const [vote, setVote] = useState(null);
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 p-4 shadow-card">
      <p className="text-sm font-semibold">{vote ? "Thanks for your feedback!" : "Was this article helpful?"}</p>
      <div className="flex gap-2">
        {["yes", "no"].map((v) => (
          <button
            key={v}
            onClick={() => setVote(v)}
            aria-pressed={vote === v}
            className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition ${vote === v ? "border-ink-950 bg-lime-400" : "border-ink-200 hover:border-ink-900"}`}
          >
            {v === "yes" ? <ThumbsUp className="size-4" /> : <ThumbsDown className="size-4" />}
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CommentBox({ carName }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  return (
    <section id="comment" className="scroll-mt-20 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-xl font-extrabold">Write your comment on the {carName}</h2>
      {done ? (
        <p className="mt-4 rounded-xl bg-lime-300/50 p-4 text-sm font-semibold">Thanks for commenting. Comments are not live yet, so your comment was not saved.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) setDone(true);
          }}
        >
          <label className="sr-only" htmlFor="comment-text">
            Your comment
          </label>
          <textarea
            id="comment-text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Write a comment..."
            className="mt-4 w-full rounded-xl border border-ink-200 p-4 text-sm outline-none transition focus:border-ink-900 focus:ring-2 focus:ring-lime-400"
          />
          <button disabled={!text.trim()} className="mt-3 rounded-xl bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ink-700 disabled:opacity-40">
            Post comment
          </button>
        </form>
      )}
    </section>
  );
}

export function MobileOfferBar({ title, label }) {
  const { openLead } = useApp();
  return (
    <div className="fixed inset-x-0 bottom-14.5 z-30 border-t border-ink-100 bg-white p-2.5 lg:hidden">
      <button onClick={() => openLead(title, "Best price")} className="w-full rounded-xl bg-lime-400 py-3 font-bold text-ink-950 active:scale-[0.99]">
        {label}
      </button>
    </div>
  );
}

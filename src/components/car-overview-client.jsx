"use client";

import { motion } from "framer-motion";
import { Check, ChevronDown, Scale, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { lakh, lakhShort, onRoadFor } from "@/data/cars";
import { useApp } from "./app-state";
import { priceNote } from "./tools";
import { Pic } from "./cards";

const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const emiOf = (p, rate, m) => {
  const r = rate / 1200;
  return p <= 0 ? 0 : (p * r * (1 + r) ** m) / ((1 + r) ** m - 1);
};

export function ExpandText({ text, more }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 text-[15px] leading-7 text-ink-700">
      <p>
        {text}
        {!open && more && (
          <>
            {" "}
            <button onClick={() => setOpen(true)} className="font-bold text-lime-700 hover:underline">
              Show full summary
            </button>
          </>
        )}
      </p>
      {open && (
        <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          {more}
        </motion.p>
      )}
    </div>
  );
}

function Pill({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${on ? "border-ink-950 bg-lime-400" : "border-ink-200 bg-white hover:border-ink-900"}`}
    >
      {children}
    </button>
  );
}

export function VariantExplorer({ variants, baseUrl, carName }) {
  const { openLead } = useApp();
  const fuels = useMemo(() => Array.from(new Set(variants.map((v) => v.fuel))), [variants]);
  const transmissions = useMemo(() => Array.from(new Set(variants.map((v) => v.trans))), [variants]);
  const low = variants[0].price;
  const high = variants[variants.length - 1].price;
  const [fuel, setFuel] = useState([]);
  const [trans, setTrans] = useState([]);
  const [budget, setBudget] = useState(high);
  const [all, setAll] = useState(false);
  const toggle = (arr, v, set) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const list = variants.filter((v) => (!fuel.length || fuel.includes(v.fuel)) && (!trans.length || trans.includes(v.trans)) && v.price <= budget + 0.001);
  const shown = all ? list : list.slice(0, 4);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-500">Fuel</span>
          {fuels.map((f) => (
            <Pill key={f} on={fuel.includes(f)} onClick={() => toggle(fuel, f, setFuel)}>
              {f}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-500">Transmission</span>
          {transmissions.map((t) => (
            <Pill key={t} on={trans.includes(t)} onClick={() => toggle(trans, t, setTrans)}>
              {t}
            </Pill>
          ))}
        </div>
      </div>
      <label className="mt-4 block text-sm text-ink-500">
        <span className="flex justify-between">
          <span>Budget up to</span>
          <span className="font-bold text-ink-900">₹{lakh(budget)}</span>
        </span>
        <input type="range" min={low} max={high} step={0.01} value={budget} onChange={(e) => setBudget(+e.target.value)} className="mt-2 w-full accent-lime-700" />
      </label>
      {shown.length === 0 && <p className="mt-5 rounded-xl bg-paper p-6 text-center text-sm text-ink-500">No {carName} variant matches these filters. Try widening your budget.</p>}
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {shown.map((v) => (
          <li key={v.slug} className={`relative flex flex-col rounded-2xl border p-4 ${v.base ? "border-lime-500 bg-lime-300/10" : "border-ink-200"}`}>
            {v.base && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-3 py-0.5 text-[11px] font-extrabold uppercase">Base model</span>}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">
                  <Link href={`${baseUrl}/variants/${v.slug}`} className="hover:underline">
                    {carName} {v.name}
                  </Link>
                </h3>
                <p className="text-xs text-ink-500">
                  {v.fuel} · {v.trans}
                </p>
              </div>
              <p className="whitespace-nowrap font-extrabold">₹{lakh(v.price)}</p>
            </div>
            <p className="mt-3 text-sm text-ink-700">
              {v.prev ? (
                <>
                  For an extra <strong>₹{lakh(v.extra)}</strong>, get everything in {v.prev}, plus:
                </>
              ) : (
                "Covers the essentials, with nothing you do not need:"
              )}
            </p>
            <ul className="mt-2 space-y-1 text-sm text-ink-700">
              {v.highlights.slice(0, 3).map((h) => (
                <li key={h} className="flex gap-2">
                  <Check className="mt-1 size-3.5 shrink-0 text-lime-700" />
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <Link href={`${baseUrl}/variants/${v.slug}`} className="text-xs font-bold text-lime-700 hover:underline">
                See {v.name} price breakup
              </Link>
              <button
                onClick={() => openLead(`${carName} ${v.name} best price`, "Best price on this variant")}
                className="whitespace-nowrap rounded-lg border border-ink-900 px-3 py-1.5 text-xs font-bold transition hover:bg-ink-950 hover:text-white"
              >
                Get offers
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {list.length > 4 && !all && (
          <button onClick={() => setAll(true)} className="inline-flex items-center gap-1 text-sm font-bold hover:underline">
            Show all {list.length} variants
            <ChevronDown className="size-4" />
          </button>
        )}
        <Link href="/compare-cars" className="inline-flex items-center gap-1.5 text-sm font-bold hover:underline">
          <Scale className="size-4" />
          Compare {carName} with other cars
        </Link>
      </div>
    </div>
  );
}

export function EmiPlanner({ variants, carName }) {
  const { cityInfo: city } = useApp();
  const [v, setV] = useState(Math.min(2, variants.length - 1));
  const { ex, reg, insurance: ins, tcs, total, real } = onRoadFor(variants[v], city);
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(48);
  const [rate, setRate] = useState(9.5);
  const down = total * (downPct / 100);
  const loan = total - down;
  const emi = emiOf(loan, rate, months);
  const chip = (on) => `rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${on ? "border-ink-950 bg-lime-400" : "border-ink-200 hover:border-ink-900"}`;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <label className="block text-sm font-semibold">
          Variant
          <select value={v} onChange={(e) => setV(+e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink-900">
            {variants.map((x, i) => (
              <option key={x.name} value={i}>
                {x.name} · ₹{lakhShort(x.price)}
              </option>
            ))}
          </select>
        </label>
        <dl className="mt-4 divide-y divide-ink-100 text-sm">
          <div className="flex justify-between py-2 font-bold">
            <dt>On-road price in {city.name}</dt>
            <dd>{inr(total)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-ink-500">Ex-showroom price</dt>
            <dd>{inr(ex)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-ink-500">RTO and road tax</dt>
            <dd>{inr(reg)}</dd>
          </div>
          <div className="flex justify-between py-2">
            <dt className="text-ink-500">Insurance, first year</dt>
            <dd>{inr(ins)}</dd>
          </div>
          {tcs > 0 && (
            <div className="flex justify-between py-2">
              <dt className="text-ink-500">TCS</dt>
              <dd>{inr(tcs)}</dd>
            </div>
          )}
        </dl>
        <p className="mt-2 text-xs text-ink-500">{priceNote(real, city)}</p>
      </div>
      <div className="rounded-2xl border border-ink-200 p-4">
        <label className="block text-sm font-semibold">
          <span className="flex justify-between">
            <span>Down payment ({downPct}%)</span>
            <span>{inr(down)}</span>
          </span>
          <input type="range" min={0} max={80} step={5} value={downPct} onChange={(e) => setDownPct(+e.target.value)} className="mt-2 w-full accent-lime-700" />
        </label>
        <p className="mt-4 text-sm font-semibold">Loan tenure</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[24, 36, 48, 60, 72].map((m) => (
            <button key={m} aria-pressed={months === m} onClick={() => setMonths(m)} className={chip(months === m)}>
              {m} mo
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold">Interest rate</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[8.5, 9, 9.5, 10, 11].map((r) => (
            <button key={r} aria-pressed={rate === r} onClick={() => setRate(r)} className={chip(rate === r)}>
              {r}%
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-ink-950 p-4 text-white">
          <p className="text-xs text-ink-300">
            {carName} EMI for {months} months at {rate}%
          </p>
          <p className="font-display text-3xl font-extrabold text-lime-400">
            {inr(emi)}
            <span className="text-sm font-medium text-ink-300">/month</span>
          </p>
          <p className="mt-1 text-xs text-ink-300">Total loan {inr(loan)} · illustrative estimate only</p>
        </div>
      </div>
    </div>
  );
}

export function ColourPanel({ colors, photo, name }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl">
        <Pic photo={photo} alt={`${name} colour preview`} sizes="(max-width: 1024px) 100vw, 420px" className="h-full w-full object-cover" />
        <motion.div className="pointer-events-none absolute inset-0 mix-blend-color" animate={{ backgroundColor: colors[i].hex }} style={{ opacity: 0.4 }} />
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {colors.map((c, n) => (
          <button
            key={c.name}
            onClick={() => setI(n)}
            aria-label={`Preview ${c.name}`}
            aria-pressed={n === i}
            style={{ background: c.hex }}
            className={`size-9 rounded-lg border border-ink-200 transition hover:scale-110 ${n === i ? "ring-2 ring-ink-950 ring-offset-2" : ""}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-bold">{colors[i].name}</p>
    </div>
  );
}

export function RateCard({ name }) {
  const [rating, setRating] = useState(0);
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 text-center shadow-card">
      <p className="font-display text-lg font-extrabold">Own a {name}?</p>
      <p className="mt-1 text-sm text-ink-500">Share your experience and help the next buyer decide.</p>
      <div className="mt-3 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} aria-label={`Rate ${n} out of 5`} aria-pressed={rating === n} className="transition hover:scale-110">
            <Star className={`size-7 ${n <= rating ? "fill-lime-500 text-lime-500" : "text-ink-200"}`} />
          </button>
        ))}
      </div>
      <Link href="/write-review" className="mt-4 block rounded-xl border border-ink-900 py-2.5 text-sm font-bold transition hover:bg-ink-950 hover:text-white">
        Write a car review
      </Link>
    </div>
  );
}

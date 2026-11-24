"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { onRoadFor } from "@/data/cars";
import { useApp } from "./app-state";
import { CarCard, Pic } from "./cards";

const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const emiCalc = (p, rate, m) => {
  const r = rate / 1200;
  return (p * r * (1 + r) ** m) / ((1 + r) ** m - 1);
};
const field = "mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900 focus:ring-2 focus:ring-lime-400";

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="rounded-lg bg-ink-100 px-2.5 py-1 font-bold">{display}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="mt-3 w-full accent-lime-700" />
    </label>
  );
}

export function EmiCalculator({ price = 1200000, name }) {
  const [amount, setAmount] = useState(price);
  const [down, setDown] = useState(Math.round(price * 0.2));
  const [rate, setRate] = useState(9.5);
  const [years, setYears] = useState(5);
  const principal = Math.max(amount - down, 0);
  const monthly = principal > 0 ? emiCalc(principal, rate, years * 12) : 0;
  const total = monthly * years * 12;
  const interest = Math.max(total - principal, 0);
  const share = total > 0 ? (principal / total) * 100 : 100;
  return (
    <div className="grid gap-6 rounded-3xl bg-white p-5 shadow-card sm:p-8 lg:grid-cols-2">
      <div className="space-y-6">
        <Slider
          label="Car price"
          value={amount}
          min={300000}
          max={8000000}
          step={10000}
          onChange={(v) => {
            setAmount(v);
            if (down > v) setDown(v);
          }}
          display={fmt(amount)}
        />
        <Slider label="Down payment" value={down} min={0} max={amount} step={10000} onChange={setDown} display={fmt(down)} />
        <Slider label="Interest rate" value={rate} min={7} max={18} step={0.1} onChange={setRate} display={`${rate.toFixed(1)}%`} />
        <Slider label="Loan tenure" value={years} min={1} max={7} step={1} onChange={setYears} display={`${years} years`} />
      </div>
      <div className="flex flex-col justify-center rounded-2xl bg-ink-950 p-6 text-white">
        <p className="text-sm text-ink-300">Your estimated monthly EMI{name ? ` for the ${name}` : ""}</p>
        <motion.p key={Math.round(monthly)} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display mt-1 text-4xl font-extrabold text-lime-400 sm:text-5xl">
          {fmt(monthly)}
        </motion.p>
        <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <motion.div className="bg-lime-400" animate={{ width: `${share}%` }} />
          <div className="flex-1 bg-coral-500" />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink-300">Loan amount</dt>
            <dd className="font-bold">{fmt(principal)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-300">Total interest</dt>
            <dd className="font-bold">{fmt(interest)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-300">Total payable</dt>
            <dd className="font-bold">{fmt(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-ink-300">An illustrative estimate only. Actual rates depend on the lender and your credit profile.</p>
      </div>
    </div>
  );
}

/** One line under a price: exact figure for the city, or an estimate (and why). */
export const priceNote = (real, city) =>
  real
    ? `Exact on-road price in ${city.name}.`
    : city.exact === false
      ? `Estimate for ${city.name}: exact prices for this city are not available yet.`
      : `Estimate for ${city.name}: road tax and insurance are approximate.`;

export function OnRoadTable({ variants, carName, initialCity }) {
  const { cityInfo, cities } = useApp();
  const [override, setOverride] = useState(initialCity ?? null);
  const [v, setV] = useState(0);
  // The chosen city (any Indian city), unless one of the exact-price cities is picked in the box below.
  const picked = override ?? cityInfo.name;
  const city = picked === cityInfo.name ? cityInfo : { ...(cities.find((c) => c.name === picked) ?? cities[0]), exact: true };
  const options = cityInfo.exact ? cities : [cityInfo, ...cities];
  const { ex, reg, insurance: ins, tcs, real } = onRoadFor(variants[v], city);
  const rows = [
    ["Ex-showroom price", ex],
    [`Road tax and registration (${city.state})`, reg],
    ["Insurance, first year", ins],
    ["TCS", tcs],
  ];
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          City
          <select value={city.name} onChange={(e) => setOverride(e.target.value)} className={field}>
            {options.map((c) => (
              <option key={`${c.slug}-${c.name}`}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Variant
          <select value={v} onChange={(e) => setV(+e.target.value)} className={field}>
            {variants.map((x, i) => (
              <option key={x.name} value={i}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <table className="mt-6 w-full text-sm">
        <caption className="sr-only">
          On-road price breakup for {carName} in {city.name}
        </caption>
        <tbody>
          {rows.map(([l, a]) => (
            <tr key={l} className="border-b border-ink-100">
              <th scope="row" className="py-3 pr-3 text-left font-medium text-ink-700">
                {l}
              </th>
              <td className="py-3 text-right font-semibold">{fmt(a)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="pt-4 text-left font-display text-lg font-bold">
              On-road price in {city.name}
            </th>
            <td className="pt-4 text-right font-display text-xl font-extrabold">{fmt(ex + reg + ins + tcs)}</td>
          </tr>
        </tbody>
      </table>
      <p className="mt-3 text-xs text-ink-500">{priceNote(real, city)} Your dealer invoice will confirm the final amounts.</p>
    </div>
  );
}

export function Gallery({ photos, name, compact = false }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const cur = photos[i];
  const step = (d) => setI((v) => (v + d + photos.length) % photos.length);
  return (
    <div className="min-w-0">
      <button onClick={() => setZoom(true)} aria-label={`Open larger photo of ${name}`} className="relative block aspect-16/10 w-full overflow-hidden rounded-3xl bg-ink-100">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} exit={{ opacity: 0.2 }} transition={{ duration: 0.2 }} className="h-full">
            <Pic photo={cur.photo} alt={`${name} ${cur.kind} view`} sizes="(max-width: 1024px) 100vw, 60vw" priority className="h-full w-full object-cover" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-bold capitalize text-white">
          {cur.kind} · {i + 1} of {photos.length}
        </span>
      </button>
      {photos.length > 1 && compact && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {photos.map((p, n) =>
            n === i ? null : (
              <button
                key={p.photo.src}
                onClick={() => setI(n)}
                aria-label={`Show ${p.kind} photo of ${name}`}
                className="aspect-16/10 overflow-hidden rounded-xl ring-2 ring-transparent transition hover:ring-lime-500"
              >
                <Pic photo={p.photo} alt={`${name} ${p.kind} thumbnail`} sizes="(max-width: 1024px) 22vw, 150px" className="h-full w-full object-cover" />
              </button>
            ),
          )}
        </div>
      )}
      {photos.length > 1 && !compact && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {photos.map((p, n) => (
            <button
              key={p.photo.src}
              onClick={() => setI(n)}
              aria-label={`Show ${p.kind} photo of ${name}`}
              aria-current={n === i}
              className={`aspect-16/10 w-24 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:w-28 ${n === i ? "ring-lime-500" : "ring-transparent opacity-70 hover:opacity-100"}`}
            >
              <Pic photo={p.photo} alt={`${name} ${p.kind} thumbnail`} sizes="112px" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {/* Rendered into <body> so no transformed page section can trap the full-screen viewer. */}
      {zoom &&
        createPortal(
          <motion.div
            className="fixed inset-0 z-90 flex items-center justify-center bg-ink-950/95 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(false)}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} photo viewer`}
          >
            <button aria-label="Close photo viewer" className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white">
              <X className="size-5" />
            </button>
            <button
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="size-6" />
            </button>
            <motion.div key={i} initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-h-[85vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Pic photo={cur.photo} alt={`${name} ${cur.kind} large view`} sizes="90vw" className="h-auto max-h-[85vh] w-full rounded-2xl object-contain" />
            </motion.div>
            <button
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute right-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="size-6" />
            </button>
          </motion.div>,
          document.body,
        )}
    </div>
  );
}

export function ColourPicker({ colors, name, photo }) {
  const [i, setI] = useState(0);
  return (
    <div className="grid items-center gap-6 rounded-3xl bg-white p-5 shadow-card sm:p-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-16/10 overflow-hidden rounded-2xl">
        <Pic photo={photo} alt={`${name} photo for colour preview`} sizes="(max-width: 1024px) 100vw, 55vw" className="h-full w-full object-cover" />
        <motion.div className="pointer-events-none absolute inset-0 mix-blend-color" animate={{ backgroundColor: colors[i].hex }} style={{ opacity: 0.45 }} />
      </div>
      <div>
        <p className="text-sm text-ink-500">Selected shade</p>
        <p className="font-display text-2xl font-bold">{colors[i].name}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {colors.map((c, n) => (
            <button
              key={c.name}
              onClick={() => setI(n)}
              aria-label={`Preview ${c.name}`}
              aria-pressed={n === i}
              style={{ background: c.hex }}
              className={`grid size-12 place-items-center rounded-full border border-ink-200 transition hover:scale-110 ${n === i ? "ring-2 ring-ink-950 ring-offset-2" : ""}`}
            >
              {n === i && <Check className="size-5 text-white mix-blend-difference" />}
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-500">Tint preview for demonstration. Final paint shades can look different in daylight, so see the car in person.</p>
      </div>
    </div>
  );
}

export function SimpleForm({ fields, submitLabel, doneTitle, children }) {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto size-12 text-lime-700" />
        <p className="font-display mt-3 text-xl font-bold">{doneTitle}</p>
        <p className="mt-1 text-sm text-ink-500">This form is not connected yet: nothing was stored or sent.</p>
      </div>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className="grid gap-4 rounded-3xl bg-white p-5 shadow-card sm:grid-cols-2 sm:p-8"
    >
      {fields.map((f) => (
        <label key={f.label} className={`text-sm font-semibold ${f.textarea ? "sm:col-span-2" : ""}`}>
          {f.label}
          {f.options ? (
            <select required className={field}>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.textarea ? (
            <textarea required rows={4} className={field} />
          ) : (
            <input required type={f.type ?? "text"} className={field} />
          )}
        </label>
      ))}
      {children}
      <button className="rounded-xl bg-ink-950 py-3.5 font-bold text-white hover:bg-ink-700 sm:col-span-2">{submitLabel}</button>
    </form>
  );
}

export function ReviewForm({ cars }) {
  const [rating, setRating] = useState(0);
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto size-12 text-lime-700" />
        <p className="font-display mt-3 text-xl font-bold">Thanks for sharing your experience</p>
        <p className="mt-1 text-sm text-ink-500">Reviews are not live yet: your review was not stored or published.</p>
      </div>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (rating) setDone(true);
      }}
      className="grid gap-4 rounded-3xl bg-white p-5 shadow-card sm:p-8"
    >
      <label className="text-sm font-semibold">
        Which car do you own?
        <select required className={field}>
          {cars.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className="text-sm font-semibold">Your overall rating</legend>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setRating(n)}
              aria-label={`${n} out of 5`}
              aria-pressed={rating === n}
              className={`text-3xl transition hover:scale-110 ${n <= rating ? "text-lime-500" : "text-ink-200"}`}
            >
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className="text-sm font-semibold">
        Review title
        <input required className={field} />
      </label>
      <label className="text-sm font-semibold">
        Your experience
        <textarea required rows={5} className={field} placeholder="Comfort, mileage, service, and what you would change" />
      </label>
      <button disabled={!rating} className="rounded-xl bg-ink-950 py-3.5 font-bold text-white hover:bg-ink-700 disabled:opacity-40">
        Submit my review
      </button>
    </form>
  );
}

export function Locator({ items, render, label = "Choose a city" }) {
  const { cities } = useApp();
  const [city, setCity] = useState("all");
  const list = city === "all" ? items : items.filter((i) => i.citySlug === city);
  return (
    <div>
      <label className="flex flex-wrap items-center gap-3 text-sm font-semibold">
        {label}
        <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-ink-900">
          <option value="all">All cities</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <span aria-live="polite" className="font-normal text-ink-500">
          {list.length} found
        </span>
      </label>
      <h2 className="sr-only">Locations found</h2>
      <motion.ul layout className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((i) => (
          <motion.li layout key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {render(i)}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

export function PlaceLocator({ items, label }) {
  const { openLead } = useApp();
  return (
    <Locator
      items={items}
      label={label}
      render={(p) => (
        <article className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-card">
          <h3 className="text-base font-bold">{p.name}</h3>
          <p className="mt-1 text-sm text-ink-500">{p.address}</p>
          <ul className="mt-3 space-y-1 text-xs text-ink-700">
            {p.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <div className="min-h-3 flex-1" />
          {p.call && (
            <button
              onClick={() => openLead(`Contact ${p.name}`, "Talk to this dealer")}
              className="rounded-xl border border-ink-900 py-2.5 text-sm font-bold transition hover:bg-ink-950 hover:text-white"
            >
              Contact this dealer
            </button>
          )}
        </article>
      )}
    />
  );
}

export function ShortlistView({ cars }) {
  const { shortlist } = useApp();
  const c = cars.filter((x) => shortlist.includes(x.key));
  if (!c.length)
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-card">
        <p className="font-display text-xl font-bold">Your shortlist is empty</p>
        <p className="mt-1 text-sm text-ink-500">Tap the heart on any car and it will wait for you here.</p>
        <Link href="/popular-cars" className="mt-4 inline-block rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-ink-950">
          Browse popular cars
        </Link>
      </div>
    );
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {c.map((x) => (
        <li key={x.key}>
          <CarCard car={x} />
        </li>
      ))}
    </ul>
  );
}

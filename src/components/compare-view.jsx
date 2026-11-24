"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Crown, MapPin, Plus, Star, ThumbsDown, ThumbsUp, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lakh, lakhShort, onRoadFor } from "@/data/cars";
import { useApp } from "./app-state";
import { LeadButton, Pic } from "./cards";
import { View360Button } from "./view360-button";

const TINT = [
  {
    bar: "bg-lime-500",
    dot: "bg-lime-500",
    soft: "border-lime-500 bg-lime-300/15",
  },
  {
    bar: "bg-ink-900",
    dot: "bg-ink-900",
    soft: "border-ink-900 bg-ink-100/60",
  },
  {
    bar: "bg-coral-500",
    dot: "bg-coral-500",
    soft: "border-coral-500 bg-coral-500/5",
  },
];
const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

function Block({ id, title, sub, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-44 rounded-3xl bg-white p-4 shadow-card sm:p-6">
      <h2 id={`${id}-h`} className="text-xl font-extrabold sm:text-2xl">
        {title}
      </h2>
      {sub && <p className="mt-1 text-sm text-ink-500">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Keeps columns readable: three cars scroll sideways on a phone rather than squashing. */
function Columns({ count, children, tight }) {
  return (
    <div className="scrollbar-none relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div
        className={`grid gap-3 sm:gap-4 ${tight && count === 2 ? "" : count === 3 ? "min-w-180 sm:min-w-0" : "min-w-130 sm:min-w-0"}`}
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </div>
  );
}

function CarTag({ car, i }) {
  return (
    <p className="flex items-center gap-2 text-sm font-bold">
      <span className={`size-2.5 shrink-0 rounded-full ${TINT[i].dot}`} />
      <span className="truncate">{car.name}</span>
    </p>
  );
}

function metricsFor(cars) {
  const sameUnit = new Set(cars.map((c) => c.mileageUnit)).size === 1;
  const mm = (n) => `${n} mm`;
  return (
    [
      {
        key: "price",
        label: "Starting price",
        value: (c) => c.min,
        show: (c) => `₹${lakh(c.min)}`,
        lowerBetter: true,
      },
      {
        key: "power",
        label: "Power",
        value: (c) => c.powerN,
        show: (c) => c.power,
      },
      {
        key: "torque",
        label: "Torque",
        value: (c) => c.torqueN,
        show: (c) => c.torque,
      },
      {
        key: "mileage",
        label: sameUnit && cars[0].mileageUnit === "km" ? "Claimed range" : "Claimed mileage",
        value: (c) => c.mileageN,
        show: (c) => c.mileage,
        skip: !sameUnit,
      },
      {
        key: "boot",
        label: "Boot space",
        value: (c) => c.boot,
        show: (c) => `${c.boot} litres`,
      },
      {
        key: "safety",
        label: "Crash test rating",
        value: (c) => c.ncap,
        show: (c) => `${c.ncap} star`,
      },
      {
        key: "seats",
        label: "Seating",
        value: (c) => c.seats,
        show: (c) => `${c.seats} seats`,
      },
      {
        key: "rating",
        label: "Owner rating",
        value: (c) => c.rating,
        show: (c) => `${c.rating} / 5`,
      },
      {
        key: "length",
        label: "Length",
        value: (c) => c.dims.length,
        show: (c) => mm(c.dims.length),
      },
      {
        key: "wheelbase",
        label: "Wheelbase",
        value: (c) => c.dims.wheelbase,
        show: (c) => mm(c.dims.wheelbase),
      },
    ]
      .map((m) => ({
        ...m,
        value: (c) => Number(m.value(c)) || 0,
        show: (c) => (Number(m.value(c)) > 0 ? m.show(c) : m.key === "safety" ? "Not rated" : "Not listed"),
      }))
      // Only areas where at least two cars have a real figure are compared.
      .filter((m) => !m.skip && cars.filter((c) => m.value(c) > 0).length >= 2)
  );
}

/** Index of the car that leads on this metric, or -1 for a tie. Cars without the figure never win. */
const winnerOf = (m, cars) => {
  const vals = cars.map(m.value);
  const listed = vals.filter((v) => v > 0);
  if (listed.length < 2) return -1;
  const best = m.lowerBetter ? Math.min(...listed) : Math.max(...listed);
  const winners = vals.flatMap((v, i) => (v === best ? [i] : []));
  return winners.length === 1 ? winners[0] : -1;
};

function Scoreboard({ cars }) {
  const metrics = metricsFor(cars);
  const wins = cars.map((_, i) => metrics.filter((m) => winnerOf(m, cars) === i).length);
  const top = Math.max(...wins);
  return (
    <Block id="scoreboard" title="Who wins on paper?" sub="A quick count of where each car leads. Numbers do not replace a test drive.">
      <Columns count={cars.length} tight>
        {cars.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`relative rounded-2xl border-2 p-4 ${top > 0 && wins[i] === top ? TINT[i].soft : "border-ink-100"}`}
          >
            {top > 0 && wins[i] === top && <Trophy className="absolute right-3 top-3 size-5 text-lime-700" />}
            <CarTag car={c} i={i} />
            <p className="font-display mt-2 text-4xl font-extrabold">
              {wins[i]}
              <span className="text-base font-medium text-ink-500"> of {metrics.length}</span>
            </p>
            <p className="text-xs text-ink-500">areas where it leads</p>
          </motion.div>
        ))}
      </Columns>
      <div className="mt-6 space-y-5">
        {metrics.map((m) => {
          const vals = cars.map(m.value);
          const max = Math.max(...vals, 0.001);
          const min = Math.min(...vals.filter((v) => v > 0));
          const w = winnerOf(m, cars);
          return (
            <div key={m.key}>
              <p className="text-sm font-bold">{m.label}</p>
              <ul className="mt-2 space-y-1.5">
                {cars.map((c, i) => {
                  const pct = !vals[i] ? 0 : m.lowerBetter ? (min / vals[i]) * 100 : (vals[i] / max) * 100;
                  return (
                    <li key={c.key} className="grid grid-cols-[72px_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[110px_1fr_130px] sm:text-sm">
                      <span className="truncate font-medium text-ink-700">{c.name}</span>
                      <span className="h-2.5 overflow-hidden rounded-full bg-ink-100">
                        <motion.span
                          className={`block h-full rounded-full ${TINT[i].bar}`}
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${pct ? Math.max(pct, 4) : 0}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.7,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </span>
                      <span className={`flex items-center justify-end gap-1 whitespace-nowrap text-right ${w === i ? "font-extrabold" : "text-ink-500"}`}>
                        {w === i && <Crown className="size-3.5 text-lime-700" />}
                        {m.show(c)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Block>
  );
}

function Verdict({ cars }) {
  const metrics = metricsFor(cars);
  return (
    <Block id="verdict" title="Which one should you pick?" sub="Choose by what you actually need, not by the longest feature list.">
      <Columns count={cars.length}>
        {cars.map((c, i) => {
          const leads = metrics.filter((m) => winnerOf(m, cars) === i).map((m) => m.label.toLowerCase());
          return (
            <article key={c.key} className={`flex flex-col rounded-2xl border-2 p-4 ${TINT[i].soft}`}>
              <h3 className="text-lg font-extrabold">Choose the {c.name} if</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">You want {c.angle}.</p>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-700">
                {c.pros.slice(0, 2).map((p) => (
                  <li key={p} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-lime-700" />
                    {p}
                  </li>
                ))}
                {leads.length > 0 && (
                  <li className="flex gap-2">
                    <Crown className="mt-0.5 size-4 shrink-0 text-lime-700" />
                    Leads here on {leads.slice(0, 3).join(", ")}
                  </li>
                )}
              </ul>
              <p className="mt-3 text-xs text-ink-500">Keep in mind: {lc(c.cons[0])}.</p>
              <div className="mt-auto pt-4">
                <LeadButton title={`Best price for the ${c.full}`} intent="Best price" label={`Get ${c.name} best price`} variant="dark" className="w-full" />
              </div>
            </article>
          );
        })}
      </Columns>
    </Block>
  );
}

function ProsCons({ cars }) {
  return (
    <Block id="pros" title="Pros and cons side by side">
      <Columns count={cars.length}>
        {cars.map((c, i) => (
          <div key={c.key} className="rounded-2xl border border-ink-200 p-4">
            <CarTag car={c} i={i} />
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-lime-700">
              <ThumbsUp className="size-4" />
              What we like
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-700">
              {c.pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-coral-700">
              <ThumbsDown className="size-4" />
              Could be better
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-700">
              {c.cons.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </Columns>
    </Block>
  );
}

function PriceEmi({ cars }) {
  const { cityInfo, cities } = useApp();
  const [override, setOverride] = useState(null);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(5);
  const city =
    !override || override === cityInfo.name
      ? cityInfo
      : {
          ...(cities.find((c) => c.name === override) ?? cities[0]),
          exact: true,
        };
  const calc = (c) => {
    const { ex, reg, insurance: ins, tcs, total } = onRoadFor(c.variants?.[0], city, c.min, c.fuels?.[0]);
    const loan = total * (1 - down / 100);
    const r = 9.5 / 1200;
    const n = years * 12;
    return {
      ex,
      reg,
      ins,
      tcs,
      total,
      emi: (loan * r * (1 + r) ** n) / ((1 + r) ** n - 1),
    };
  };
  const list = cars.map(calc);
  const low = Math.min(...list.map((x) => x.total));
  const rows = [
    ["Ex-showroom", (x) => x.ex],
    ["Road tax and registration", (x) => x.reg],
    ["Insurance, first year", (x) => x.ins],
    ["TCS", (x) => x.tcs],
  ];
  return (
    <Block id="price" title="On-road price and EMI" sub="Base variants compared. Change the city, down payment and tenure to see what each car really costs.">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl bg-paper p-4">
        <label className="text-sm font-semibold">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            City
          </span>
          <select value={city.name} onChange={(e) => setOverride(e.target.value)} className="mt-1 block rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm">
            {(cityInfo.exact ? cities : [cityInfo, ...cities]).map((c) => (
              <option key={`${c.slug}-${c.name}`}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="min-w-44 flex-1 text-sm font-semibold">
          Down payment: {down}%
          <input type="range" min={0} max={70} step={5} value={down} onChange={(e) => setDown(+e.target.value)} className="mt-2 block w-full accent-lime-700" />
        </label>
        <div className="text-sm font-semibold">
          Tenure
          <div className="mt-1 flex gap-1">
            {[3, 4, 5, 7].map((y) => (
              <button
                key={y}
                onClick={() => setYears(y)}
                aria-pressed={years === y}
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${years === y ? "border-ink-950 bg-lime-400" : "border-ink-200 bg-white"}`}
              >
                {y} yr
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Columns count={cars.length}>
          {cars.map((c, i) => (
            <div key={c.key} className="rounded-2xl border border-ink-200 p-4">
              <CarTag car={c} i={i} />
              <dl className="mt-3 divide-y divide-ink-100 text-sm">
                {rows.map(([l, f]) => (
                  <div key={l} className="flex justify-between gap-2 py-1.5">
                    <dt className="text-ink-500">{l}</dt>
                    <dd className="font-semibold">{inr(f(list[i]))}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-ink-500">On-road in {city.name}</p>
              <p className={`font-display text-2xl font-extrabold ${list[i].total === low ? "text-lime-700" : ""}`}>{inr(list[i].total)}</p>
              <div className="mt-3 rounded-xl bg-ink-950 p-3 text-white">
                <p className="text-xs text-ink-300">Estimated EMI at 9.5%</p>
                <p className="font-display text-xl font-extrabold text-lime-400">
                  {inr(list[i].emi)}
                  <span className="text-xs font-medium text-ink-300">/month</span>
                </p>
              </div>
            </div>
          ))}
        </Columns>
      </div>
      <p className="mt-3 text-xs text-ink-500">Estimates from ex-showroom prices and state road tax, not a quote or a loan offer.</p>
    </Block>
  );
}

function RunningCost({ cars }) {
  const [km, setKm] = useState(1000);
  const costs = cars.map((c) => c.costPerKm).filter((v) => v > 0);
  if (!costs.length) return null;
  const max = Math.max(...costs, 0.001);
  const low = costs.length > 1 ? Math.min(...costs) : null;
  return (
    <Block id="running" title="What will it cost to run?" sub="Energy cost from the claimed mileage and today's fuel price. Real costs will be higher in traffic.">
      <label className="block text-sm font-semibold">
        <span className="flex justify-between">
          <span>How much do you drive each month?</span>
          <span className="rounded-lg bg-ink-100 px-2 py-0.5">{km.toLocaleString("en-IN")} km</span>
        </span>
        <input type="range" min={200} max={5000} step={100} value={km} onChange={(e) => setKm(+e.target.value)} className="mt-2 w-full accent-lime-700" />
      </label>
      <ul className="mt-4 space-y-3">
        {/* A car without a listed mileage is left out rather than shown with a guess. */}
        {cars.map((c, i) =>
          c.costPerKm ? (
            <li key={c.key}>
              <div className="flex items-baseline justify-between gap-2">
                <CarTag car={c} i={i} />
                <p className={`font-display text-lg font-extrabold ${c.costPerKm === low ? "text-lime-700" : ""}`}>
                  {inr(c.costPerKm * km)}
                  <span className="text-xs font-medium text-ink-500">/month</span>
                </p>
              </div>
              <span className="mt-1 block h-3 overflow-hidden rounded-full bg-ink-100">
                <motion.span className={`block h-full rounded-full ${TINT[i].bar}`} animate={{ width: `${(c.costPerKm / max) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
              </span>
              <p className="mt-0.5 text-xs text-ink-500">
                About ₹{c.costPerKm.toFixed(2)} per km ({c.costBasis}) · {inr(c.costPerKm * km * 60)} over 5 years
              </p>
            </li>
          ) : null,
        )}
      </ul>
    </Block>
  );
}

function Variants({ cars }) {
  return (
    <Block id="variants" title="Variants and prices" sub="See where each trim sits, and open any variant for its full details.">
      <Columns count={cars.length}>
        {cars.map((c, i) => (
          <div key={c.key}>
            <CarTag car={c} i={i} />
            <ol className="mt-3 space-y-2">
              {c.variants.map((v, n) => (
                <li key={v.slug}>
                  <Link href={`${c.url}/variants/${v.slug}`} className="block rounded-xl border border-ink-200 p-3 transition hover:border-ink-900 hover:shadow-card">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold">{v.name}</span>
                      <span className="whitespace-nowrap text-sm font-extrabold">₹{lakhShort(v.price)}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">{n === 0 ? "Base model" : v.highlights.slice(-1)[0]}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Columns>
    </Block>
  );
}

function Photos({ cars }) {
  const kinds = ["front", "rear", "interior"].filter((k) => cars.every((c) => c.photos.some((p) => p.kind === k)));
  const [kind, setKind] = useState(kinds[0] ?? "front");
  return (
    <Block id="photos" title="Look at them side by side">
      <div className="mb-4 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={`rounded-full px-4 py-1.5 text-sm font-bold capitalize transition ${kind === k ? "bg-ink-950 text-white" : "bg-ink-100"}`}
          >
            {k}
          </button>
        ))}
      </div>
      <Columns count={cars.length}>
        {cars.map((c) => {
          const p = c.photos.find((x) => x.kind === kind) ?? c.photos[0];
          return (
            <figure key={c.key}>
              <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-ink-100">
                <AnimatePresence mode="wait">
                  <motion.div key={p.photo.src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                    <Pic photo={p.photo} alt={`${c.full} ${p.kind} view`} sizes="(max-width: 768px) 80vw, 40vw" className="h-full w-full object-cover" />
                  </motion.div>
                </AnimatePresence>
              </div>
              <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
                {c.name}
                <View360Button model={c.model3d} spin={c.spin} name={c.full} photos={c.photos} colors={c.colors} className="px-3! py-1.5! text-xs!" />
              </figcaption>
            </figure>
          );
        })}
      </Columns>
    </Block>
  );
}

function Colours({ cars }) {
  return (
    <Block id="colours" title="Colour choices">
      <Columns count={cars.length}>
        {cars.map((c, i) => (
          <div key={c.key} className="rounded-2xl border border-ink-200 p-4">
            <CarTag car={c} i={i} />
            <ul className="mt-3 space-y-2">
              {c.colors.map((col) => (
                <li key={col.name} className="flex items-center gap-2 text-sm">
                  <span className="size-6 shrink-0 rounded-full border border-ink-200" style={{ background: col.hex }} />
                  {col.name}
                </li>
              ))}
            </ul>
            <Link href={`${c.url}/colours`} className="mt-3 inline-block text-xs font-bold text-lime-700 hover:underline">
              Preview {c.name} colours
            </Link>
          </div>
        ))}
      </Columns>
    </Block>
  );
}

const cellText = (c) => (typeof c === "string" ? c : `${c.yes}${c.note ?? ""}`);
function CellView({ cell }) {
  if (typeof cell === "string") return <>{cell}</>;
  return (
    <span className="inline-flex items-center gap-1.5">
      {cell.yes ? (
        <span className="grid size-5 place-items-center rounded-full bg-lime-400">
          <Check className="size-3.5" strokeWidth={3} />
          <span className="sr-only">Yes</span>
        </span>
      ) : (
        <span className="grid size-5 place-items-center rounded-full bg-ink-100 text-ink-400">
          <X className="size-3.5" strokeWidth={3} />
          <span className="sr-only">No</span>
        </span>
      )}
      {cell.note && <span className="text-xs text-ink-500">{cell.note}</span>}
    </span>
  );
}

function SpecTable({ cars }) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [closed, setClosed] = useState([]);
  const groups = useMemo(() => {
    // Rows are matched by label, so a figure one car lacks shows "Not listed" instead of shifting the rows.
    const fromGroups = cars[0].groups.map((g, gi) => {
      const titles = [...new Set(cars.map((c) => c.groups[gi]?.title).filter(Boolean))];
      const labels = [...new Set(cars.flatMap((c) => (c.groups[gi]?.rows ?? []).map(([label]) => label)))];
      return {
        title: titles.join(" / "),
        rows: labels.map((label) => [label, cars.map((c) => c.groups[gi]?.rows.find((r) => r[0] === label)?.[1] ?? "Not listed")]),
      };
    });
    const features = {
      title: "Features (base to top variant)",
      rows: cars[0].features.map(([label], ri) => [label, cars.map((c) => c.features[ri][1])]),
    };
    return [...fromGroups, features];
  }, [cars]);
  return (
    <Block id="specs" title="Full specifications" sub="Rows that differ are in bold, so that you can stop reading identical values.">
      <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-paper px-4 py-2 text-sm font-semibold">
        <input type="checkbox" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} className="size-4 accent-lime-700" />
        Show only differences
      </label>
      <div className="space-y-3">
        {groups.map((g) => {
          const rows = onlyDiff ? g.rows.filter(([, v]) => new Set(v.map(cellText)).size > 1) : g.rows;
          const isOpen = !closed.includes(g.title);
          return (
            <div key={g.title} className="overflow-hidden rounded-2xl border border-ink-200">
              <h3>
                <button
                  onClick={() => setClosed(isOpen ? [...closed, g.title] : closed.filter((t) => t !== g.title))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between bg-ink-100/70 px-4 py-3 text-left font-bold"
                >
                  <span>
                    {g.title} <span className="text-xs font-medium text-ink-500">({rows.length})</span>
                  </span>
                  <ChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} />
                </button>
              </h3>
              {isOpen && (
                <div className="scrollbar-none relative overflow-x-auto">
                  <table className="w-full min-w-140 text-sm">
                    <caption className="sr-only">{g.title} comparison</caption>
                    <thead>
                      <tr className="border-b border-ink-100 text-left text-xs text-ink-500">
                        <th scope="col" className="sticky left-0 w-44 bg-white p-3 font-medium">
                          Specification
                        </th>
                        {cars.map((c) => (
                          <th key={c.key} scope="col" className="p-3 font-bold text-ink-900">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={cars.length + 1} className="p-4 text-center text-ink-500">
                            No differences in this section.
                          </td>
                        </tr>
                      )}
                      {rows.map(([label, values]) => {
                        const differs = new Set(values.map(cellText)).size > 1;
                        return (
                          <tr key={label} className="border-b border-ink-100 last:border-0">
                            <th scope="row" className="sticky left-0 bg-white p-3 text-left font-medium text-ink-500">
                              {label}
                            </th>
                            {values.map((v, i) => (
                              <td key={i} className={`p-3 ${differs ? "font-semibold" : "text-ink-500"}`}>
                                <CellView cell={v} />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Block>
  );
}

function Reviews({ cars }) {
  if (!cars.some((c) => c.ownerReviews.length)) return null;
  return (
    <Block id="reviews" title="What owners say" sub="Reviews from owners, checked by our editors.">
      <Columns count={cars.length}>
        {cars.map((c, i) => (
          <div key={c.key}>
            <div className="flex items-center justify-between gap-2">
              <CarTag car={c} i={i} />
              {c.rating > 0 && (
                <p className="flex shrink-0 items-center gap-1 text-sm font-extrabold">
                  <Star className="size-4 fill-lime-500 text-lime-500" />
                  {c.rating}
                </p>
              )}
            </div>
            <ul className="mt-3 space-y-3">
              {c.ownerReviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-ink-200 p-4">
                  <h3 className="text-sm font-bold">{r.title}</h3>
                  <p className="mt-1 line-clamp-4 text-sm leading-relaxed text-ink-700">{r.text}</p>
                  <p className="mt-2 text-xs text-ink-500">
                    {r.author} · {r.date}
                  </p>
                </li>
              ))}
              {c.ownerReviews.length === 0 && <li className="rounded-2xl border border-dashed border-ink-200 p-4 text-sm text-ink-500">Owner reviews will open after launch.</li>}
            </ul>
            <Link href={`${c.url}/reviews`} className="mt-2 inline-block text-xs font-bold text-lime-700 hover:underline">
              All {c.name} reviews
            </Link>
          </div>
        ))}
      </Columns>
    </Block>
  );
}

function Stories({ cars }) {
  if (!cars.some((c) => c.stories.length)) return null;
  return (
    <Block id="stories" title="Latest news on these cars">
      <Columns count={cars.length}>
        {cars.map((c, i) => (
          <div key={c.key}>
            <CarTag car={c} i={i} />
            <ul className="mt-3 space-y-2">
              {c.stories.map((s) => (
                <li key={s.url}>
                  <Link href={s.url} className="block rounded-xl border border-ink-200 p-3 text-sm font-semibold transition hover:border-ink-900">
                    {s.title}
                    <span className="mt-0.5 block text-xs font-normal text-ink-500">{s.date}</span>
                  </Link>
                </li>
              ))}
              {c.stories.length === 0 && (
                <li>
                  <Link href={`${c.url}/news`} className="text-sm font-semibold underline">
                    {c.name} news page
                  </Link>
                </li>
              )}
            </ul>
          </div>
        ))}
      </Columns>
    </Block>
  );
}

const JUMP = [
  ["scoreboard", "Winner"],
  ["verdict", "Verdict"],
  ["pros", "Pros & cons"],
  ["price", "Price & EMI"],
  ["running", "Running cost"],
  ["variants", "Variants"],
  ["photos", "Photos"],
  ["colours", "Colours"],
  ["specs", "Specs"],
  ["reviews", "Reviews"],
  ["stories", "News"],
];

export function CompareView({ cars }) {
  return (
    <div>
      <div className="sticky top-16 z-30 -mx-4 border-b border-ink-200 bg-white/95 px-4 backdrop-blur lg:-mx-6 lg:px-6">
        <ul
          className="grid gap-3 py-2"
          style={{
            gridTemplateColumns: `repeat(${cars.length}, minmax(0, 1fr))`,
          }}
        >
          {cars.map((c, i) => (
            <li key={c.key} className="flex min-w-0 items-center gap-2">
              <span className="hidden h-10 w-14 shrink-0 overflow-hidden rounded-lg sm:block">
                <Pic photo={c.photo} alt="" sizes="56px" className="h-full w-full object-cover" />
              </span>
              <span className="min-w-0">
                <CarTag car={c} i={i} />
                <span className="block truncate text-xs text-ink-500">{c.priceText}</span>
              </span>
            </li>
          ))}
        </ul>
        <nav aria-label="Jump to a comparison section">
          <ul className="scrollbar-none flex gap-1 overflow-x-auto pb-1">
            {JUMP.map(([id, label]) => (
              <li key={id} className="shrink-0">
                <a href={`#${id}`} className="block rounded-full px-3 py-1 text-xs font-bold text-ink-500 transition hover:bg-lime-300 hover:text-ink-950">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-5 space-y-5">
        <Scoreboard cars={cars} />
        <Verdict cars={cars} />
        <ProsCons cars={cars} />
        <PriceEmi cars={cars} />
        <RunningCost cars={cars} />
        <Variants cars={cars} />
        <Photos cars={cars} />
        <Colours cars={cars} />
        <SpecTable cars={cars} />
        <Reviews cars={cars} />
        <Stories cars={cars} />
      </div>
    </div>
  );
}

function Slot({ car, cars, taken, onPick, onRemove, label, tint }) {
  // The car shown on first load is painted at once (it is the LCP image); a car picked later fades in.
  const [firstKey] = useState(car?.key);
  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))), [cars]);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white text-ink-900 shadow-lift">
      <div className="relative aspect-16/10 bg-ink-100">
        {car ? (
          <motion.div key={car.key} initial={car.key === firstKey ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="h-full">
            <Pic photo={car.photo} alt={`${car.full} front view`} sizes="(max-width: 768px) 90vw, 33vw" priority className="h-full w-full object-cover" />
          </motion.div>
        ) : (
          <div className="grid h-full place-items-center text-ink-400">
            <span className="grid justify-items-center gap-1 text-sm font-semibold">
              <Plus className="size-8" />
              Add a third car
            </span>
          </div>
        )}
        {onRemove && (
          <button onClick={onRemove} aria-label={`Remove ${car?.full}`} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white shadow-card hover:bg-lime-300">
            <X className="size-4" />
          </button>
        )}
        <span className={`absolute left-2 top-2 size-3 rounded-full ring-2 ring-white ${TINT[tint].dot}`} />
      </div>
      <div className="p-3">
        <label className="block text-xs font-bold text-ink-500">
          {label}
          <select
            value={car?.key ?? ""}
            onChange={(e) => onPick(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-bold text-ink-900 outline-none focus:border-ink-900"
          >
            {!car && <option value="">Select a car</option>}
            {brands.map((b) => (
              <optgroup key={b} label={b}>
                {cars
                  .filter((c) => c.brand === b)
                  .map((c) => (
                    <option key={c.key} value={c.key} disabled={taken.includes(c.key) && c.key !== car?.key}>
                      {c.full}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        {car && <p className="mt-2 text-sm font-extrabold">{car.priceText}</p>}
      </div>
    </div>
  );
}

/**
 * The compare tool. `cars` is a short list for the pickers (key, brand, name, photo, price); `initial` holds the full
 * comparison data of the first two cars. Data for any other car is loaded only when someone picks it, so the page
 * does not ship every car's full specification up front.
 */
export function CompareHub({ cars, initial, title, intro, crumbs }) {
  const [picked, setPicked] = useState(initial.map((c) => c.key));
  const [full, setFull] = useState(() => Object.fromEntries(initial.map((c) => [c.key, c])));
  const [failed, setFailed] = useState([]);
  const missing = picked.filter((k) => !full[k] && !failed.includes(k));
  const missingKey = missing.join(",");
  useEffect(() => {
    if (!missingKey) return;
    let live = true;
    for (const key of missingKey.split(",")) {
      fetch(`/api/compare-car/${encodeURIComponent(key)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((car) => live && setFull((f) => ({ ...f, [key]: car })))
        .catch(() => live && setFailed((f) => [...f, key]));
    }
    return () => {
      live = false;
    };
  }, [missingKey]);
  const chosen = picked.map((k) => full[k] ?? cars.find((c) => c.key === k)).filter(Boolean);
  const ready = picked.map((k) => full[k]).filter(Boolean);
  const setAt = (i, k) => setPicked(picked.map((p, n) => (n === i ? k : p)));
  return (
    <>
      <div className="bg-ink-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-7 lg:px-6 lg:py-10">
          <div className="[&_a]:text-ink-300 [&_nav]:text-ink-300 [&_span]:text-ink-200">{crumbs}</div>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink-300 sm:text-base">{intro}</p>
          <div className="relative mt-6 grid gap-4 md:grid-cols-3">
            <Slot car={chosen[0]} cars={cars} taken={picked} onPick={(k) => setAt(0, k)} label="First car" tint={0} />
            <Slot car={chosen[1]} cars={cars} taken={picked} onPick={(k) => setAt(1, k)} label="Second car" tint={1} />
            <Slot
              car={chosen[2]}
              cars={cars}
              taken={picked}
              onPick={(k) => (picked[2] ? setAt(2, k) : setPicked([...picked, k]))}
              onRemove={chosen[2] ? () => setPicked(picked.slice(0, 2)) : undefined}
              label="Third car (optional)"
              tint={2}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/3 top-[34%] hidden size-12 -translate-x-1/2 place-items-center rounded-full bg-lime-400 font-display font-extrabold text-ink-950 shadow-lift md:grid"
            >
              VS
            </span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-2/3 top-[34%] hidden size-12 -translate-x-1/2 place-items-center rounded-full bg-lime-400 font-display font-extrabold text-ink-950 shadow-lift md:grid"
            >
              VS
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {missing.length > 0 && <p className="pt-6 text-center text-sm font-semibold text-ink-500">Loading the comparison…</p>}
        {failed.some((k) => picked.includes(k)) && <p className="pt-6 text-center text-sm font-semibold text-ink-500">This car could not be loaded. Please refresh the page and try again.</p>}
        {ready.length >= 2 && <CompareView cars={ready} />}
      </div>
    </>
  );
}

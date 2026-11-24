"use client";

import { Check, MapPin, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// Other names and spellings people type -> the name in the city list.
const ALIASES = {
  bengaluru: "bangalore", gurugram: "gurgaon", bombay: "mumbai", madras: "chennai", calcutta: "kolkata", delhi: "new delhi", ncr: "new delhi",
  trivandrum: "thiruvananthapuram", cochin: "kochi", ernakulam: "kochi", mysuru: "mysore", mangaluru: "mangalore", prayagraj: "allahabad",
  baroda: "vadodara", pondicherry: "puducherry", belagavi: "belgaum", vizag: "visakhapatnam", banaras: "varanasi", poona: "pune",
  trichy: "tiruchirappalli", gauhati: "guwahati", simla: "shimla", hubballi: "hubli",
};

/** "  New-DELHI " -> "new delhi". */
export const normCity = (s) => String(s ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}

/**
 * Cities matching what was typed, best first: exact name or other name, then names starting with it, then names
 * containing it, then close spellings. Cities with exact prices come first among equals. At most `max` results.
 */
export function searchCities(query, supported, all, max = 25) {
  const q = normCity(query);
  if (!q) return [];
  const target = ALIASES[q] ?? q;
  const seen = new Set();
  const pool = [];
  for (const c of [...supported.map((c) => ({ ...c, exact: true })), ...all.map((c) => ({ ...c, exact: false }))]) {
    const key = normCity(c.name);
    if (seen.has(key)) continue;
    seen.add(key);
    pool.push({ c, key });
  }
  const scored = [];
  for (const { c, key } of pool) {
    let score = null;
    if (key === target || key.replace(/ /g, "") === target.replace(/ /g, "")) score = 0;
    else if (key.startsWith(target)) score = 1;
    else if (key.split(" ").some((w) => w.startsWith(target))) score = 2;
    else if (target.length >= 3 && key.includes(target)) score = 3;
    else if (target.length >= 4) {
      const d = distance(target, key.slice(0, Math.max(target.length, key.length)));
      if (d <= (target.length >= 7 ? 2 : 1)) score = 4 + d;
    }
    if (score !== null) scored.push({ c, score });
  }
  return scored
    .sort((x, y) => x.score - y.score || Number(y.c.exact) - Number(x.c.exact) || x.c.name.localeCompare(y.c.name))
    .slice(0, max)
    .map((x) => x.c);
}

let allCities = null; // loaded once per visit

/** The city chooser: search any Indian city; cities with exact on-road prices are listed first and marked. */
export function CityPicker({ cities, current, onPick }) {
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(allCities ?? []);
  const [loading, setLoading] = useState(!allCities);
  const input = useRef(null);

  useEffect(() => {
    input.current?.focus();
    if (allCities) return;
    fetch("/api/cities")
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        allCities = list.map((c) => ({ name: c.n, state: c.s, slug: c.g }));
        setAll(allCities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => searchCities(query, cities, all), [query, cities, all]);
  const pick = (c) => onPick({ name: c.name, state: c.state, slug: c.slug, exact: Boolean(c.exact) });
  const badge = (exact) => (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${exact ? "bg-lime-300 text-ink-950" : "bg-ink-100 text-ink-500"}`}>{exact ? "Exact prices" : "Estimated"}</span>
  );

  return (
    <>
      <p className="font-display pr-8 text-2xl font-bold">Choose your city</p>
      <p className="mt-1 text-sm text-ink-500">On-road prices, EMI and price pages will use this city.</p>
      <label className="relative mt-4 block">
        <span className="sr-only">Search your city</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          ref={input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) pick(results[0]);
          }}
          placeholder="Search any city, e.g. Ludhiana, Bengaluru"
          className="w-full rounded-xl border border-ink-200 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-ink-900"
          autoComplete="off"
        />
      </label>

      {query.trim() ? (
        <div className="mt-3 max-h-80 overflow-y-auto">
          {results.length ? (
            <ul className="divide-y divide-ink-100">
              {results.map((c) => (
                <li key={`${c.slug}-${c.state}`}>
                  <button onClick={() => pick(c)} className="flex w-full items-center gap-3 px-1 py-2.5 text-left text-sm transition hover:bg-lime-300/40">
                    <MapPin className="size-4 shrink-0 text-ink-400" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold">{c.name}</span>
                      <span className="block text-xs text-ink-500">{c.state}</span>
                    </span>
                    {c.name === current && <Check className="size-4 text-ink-900" aria-label="Selected" />}
                    {badge(c.exact)}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-ink-50 p-4 text-sm text-ink-600">
              {loading ? "Loading cities…" : <>No city matches “{query.trim()}”. Check the spelling, or try a nearby bigger city.</>}
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-ink-500">Cities with exact on-road prices</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {cities.map((c) => (
              <button
                key={c.slug}
                onClick={() => pick({ ...c, exact: true })}
                className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${c.name === current ? "border-ink-900 bg-lime-400" : "border-ink-200 hover:border-ink-900"}`}
              >
                {c.name}
                <span className="block text-xs font-normal text-ink-500">{c.state}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-500">Your city is not here? Search above: every city in India is listed, and prices are estimated for the ones without exact prices.</p>
        </>
      )}
    </>
  );
}

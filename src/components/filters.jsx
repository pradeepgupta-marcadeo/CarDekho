"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CarCard } from "./cards";

function Chip({ on, onClick, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-ink-950 bg-ink-950 text-white" : "border-ink-200 bg-white hover:border-ink-900"}`}
    >
      {children}
    </button>
  );
}

function Group({ title, children }) {
  return (
    <fieldset className="border-b border-ink-100 py-4 first:pt-0">
      <legend className="float-left mb-2 w-full text-sm font-bold">{title}</legend>
      <div className="clear-both flex flex-wrap gap-1.5">{children}</div>
    </fieldset>
  );
}

const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function Shell({ count, noun, sort, setSort, sorts, panel, onClear, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-6 lg:grid-cols-[270px_1fr]">
      <aside aria-label="Filters" className="hidden self-start rounded-2xl bg-white p-5 shadow-card lg:sticky lg:top-20 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-bold">Filters</p>
          <button onClick={onClear} className="text-xs font-bold text-ink-500 underline">
            Clear all
          </button>
        </div>
        {panel}
      </aside>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 aria-live="polite" className="font-sans text-sm font-semibold tracking-normal text-ink-700">
            {count} {noun} found
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-full border border-ink-900 bg-white px-3.5 py-2 text-sm font-bold lg:hidden">
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <span className="hidden sm:inline">Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-ink-900">
                {sorts.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {children}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-70 bg-ink-950/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white"
            >
              <div className="flex items-center justify-between p-5 pb-3">
                <p className="font-display text-lg font-bold">Filters</p>
                <button aria-label="Close filters" onClick={() => setOpen(false)} className="rounded-full bg-ink-100 p-2">
                  <X className="size-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5">{panel}</div>
              <div className="flex gap-2 p-4">
                <button onClick={onClear} className="flex-1 rounded-xl border border-ink-900 py-3 font-bold">
                  Clear
                </button>
                <button onClick={() => setOpen(false)} className="flex-2 rounded-xl bg-ink-950 py-3 font-bold text-white">
                  Show {count} {noun}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const newBudgets = [
  ["Under ₹10 L", 0, 10],
  ["₹10-15 L", 10, 15],
  ["₹15-25 L", 15, 25],
  ["₹25-50 L", 25, 50],
  ["Above ₹50 L", 50, 999],
];

const PAGE = 24;

export function NewCarFilters({ cars }) {
  const [budget, setBudget] = useState([]);
  const [brand, setBrand] = useState([]);
  const [body, setBody] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [seats, setSeats] = useState([]);
  const [auto, setAuto] = useState(false);
  const [safe, setSafe] = useState(false);
  const [sort, setSort] = useState("popular");
  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))), [cars]);
  const bodies = useMemo(() => Array.from(new Set(cars.map((c) => c.body))), [cars]);
  const fuels = useMemo(() => Array.from(new Set(cars.flatMap((c) => c.fuels))), [cars]);
  const seatList = useMemo(() => Array.from(new Set(cars.map((c) => c.seats))).sort(), [cars]);
  const clear = () => {
    setBudget([]);
    setBrand([]);
    setBody([]);
    setFuel([]);
    setSeats([]);
    setAuto(false);
    setSafe(false);
  };
  const list = useMemo(() => {
    const out = cars.filter(
      (c) =>
        (!budget.length || budget.some((i) => c.min >= newBudgets[i][1] && c.min < newBudgets[i][2])) &&
        (!brand.length || brand.includes(c.brand)) &&
        (!body.length || body.includes(c.body)) &&
        (!fuel.length || c.fuels.some((f) => fuel.includes(f))) &&
        (!seats.length || seats.includes(c.seats)) &&
        (!auto || c.auto) &&
        (!safe || c.ncap === 5),
    );
    return [...out].sort((a, b) => (sort === "low" ? a.min - b.min : sort === "high" ? b.min - a.min : sort === "rating" ? b.rating - a.rating : b.popularity - a.popularity));
  }, [cars, budget, brand, body, fuel, seats, auto, safe, sort]);
  // The page sends the first cars as HTML (fast first load, a sensible link count); "Show more" adds the rest.
  // Changing a filter starts again from the first page.
  const filterKey = JSON.stringify([budget, brand, body, fuel, seats, auto, safe, sort]);
  const [more, setMore] = useState({ key: filterKey, n: PAGE });
  const shown = more.key === filterKey ? more.n : PAGE;
  const panel = (
    <>
      <Group title="Budget">
        {newBudgets.map(([l], i) => (
          <Chip key={l} on={budget.includes(i)} onClick={() => setBudget(toggle(budget, i))}>
            {l}
          </Chip>
        ))}
      </Group>
      {bodies.length > 1 && (
        <Group title="Body type">
          {bodies.map((b) => (
            <Chip key={b} on={body.includes(b)} onClick={() => setBody(toggle(body, b))}>
              {b}
            </Chip>
          ))}
        </Group>
      )}
      <Group title="Fuel type">
        {fuels.map((f) => (
          <Chip key={f} on={fuel.includes(f)} onClick={() => setFuel(toggle(fuel, f))}>
            {f}
          </Chip>
        ))}
      </Group>
      <Group title="Brand">
        {brands.map((b) => (
          <Chip key={b} on={brand.includes(b)} onClick={() => setBrand(toggle(brand, b))}>
            {b}
          </Chip>
        ))}
      </Group>
      <Group title="Seats">
        {seatList.map((s) => (
          <Chip key={s} on={seats.includes(s)} onClick={() => setSeats(toggle(seats, s))}>
            {s} seats
          </Chip>
        ))}
      </Group>
      <Group title="Must have">
        <Chip on={auto} onClick={() => setAuto(!auto)}>
          Automatic
        </Chip>
        <Chip on={safe} onClick={() => setSafe(!safe)}>
          5-star safety
        </Chip>
      </Group>
    </>
  );
  return (
    <Shell
      count={list.length}
      noun="cars"
      sort={sort}
      setSort={setSort}
      onClear={clear}
      panel={panel}
      sorts={[
        ["popular", "Most popular"],
        ["low", "Price: low to high"],
        ["high", "Price: high to low"],
        ["rating", "Highest rated"],
      ]}
    >
      {list.length === 0 ? (
        <p className="rounded-2xl bg-white p-10 text-center text-ink-500 shadow-card">No cars match these filters. Try removing one or two.</p>
      ) : (
        <motion.ul layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {/* initial={false}: the first list is painted with the page; cars added by a filter change animate in. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {list.slice(0, shown).map((c, i) => (
              <motion.li layout key={c.key} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.25 }}>
                <CarCard car={c} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      {list.length > shown && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMore({ key: filterKey, n: shown + PAGE })}
            className="rounded-full bg-ink-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-ink-800"
          >
            Show {Math.min(PAGE, list.length - shown)} more cars
            <span className="font-normal text-ink-300"> ({list.length - shown} left)</span>
          </button>
        </div>
      )}
    </Shell>
  );
}

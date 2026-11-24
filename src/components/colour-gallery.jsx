"use client";

import { lakh } from "@/data/cars";
import { createContext, useContext, useState } from "react";

import { Pic } from "./cards";
import { Gallery } from "./tools";

/**
 * Colour-wise photos. A buyer who picks a colour sees real photographs of the car in that colour,
 * never a tinted copy of another photo. A colour with no photograph says so instead of faking one.
 */

const Ctx = createContext(null);

/** Holds the chosen colour so the gallery, the price line and the colour section stay in step. */
export function ColourScope({ children }) {
  const [colour, setColour] = useState(null);
  return <Ctx.Provider value={{ colour, setColour }}>{children}</Ctx.Provider>;
}

function useColour() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Colour components must sit inside <ColourScope>");
  return c;
}

const inr = (n) => `₹${Math.abs(Math.round(n)).toLocaleString("en-IN")}`;
export const premiumText = (price) => (price === 0 ? "No extra cost" : `${price > 0 ? "+" : "−"}${inr(price)}`);

function Chips({ colours, photos, all = true }) {
  const { colour, setColour } = useColour();
  const count = (name) => photos.filter((p) => p.colour === name).length;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Choose a colour">
      {all && (
        <button
          type="button"
          onClick={() => setColour(null)}
          aria-pressed={colour === null}
          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${colour === null ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white hover:border-ink-400"}`}
        >
          All photos · {photos.length}
        </button>
      )}
      {colours.map((c) => {
        const n = count(c.name);
        const on = colour === c.name;
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => setColour(c.name)}
            aria-pressed={on}
            title={n ? `${n} photo${n === 1 ? "" : "s"} in ${c.name}` : `No photo of the ${c.name} yet`}
            className={`flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold transition ${on ? "border-ink-900 bg-ink-900 text-white" : n ? "border-ink-200 bg-white hover:border-ink-400" : "border-dashed border-ink-300 bg-white text-ink-500 hover:border-ink-500"}`}
          >
            <span aria-hidden className="size-4 shrink-0 rounded-full border border-ink-200" style={{ background: c.hex }} />
            <span>{c.name}</span>
            {typeof c.price === "number" && c.price !== 0 && <span className={on ? "text-lime-300" : "text-ink-500"}>{premiumText(c.price)}</span>}
            <span className={on ? "text-white/70" : "text-ink-400"}>{n}</span>
          </button>
        );
      })}
    </div>
  );
}

function Empty({ colour, hex }) {
  return (
    <div className="grid aspect-16/10 w-full place-items-center rounded-3xl border-2 border-dashed border-ink-200 bg-paper p-6 text-center">
      <div>
        <span aria-hidden className="mx-auto block size-14 rounded-full border border-ink-200" style={{ background: hex }} />
        <p className="mt-3 font-bold">No photo of the {colour} yet</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-ink-500">We show only real photographs, so this shade has no picture until one with a free licence is found.</p>
      </div>
    </div>
  );
}

/** The car's main gallery, filtered to the chosen colour, with the colour chips below it. */
export function ColourGallery({ photos, colours, name, limit, moreHref }) {
  const { colour } = useColour();
  const all = colour ? photos.filter((p) => p.colour === colour) : photos;
  const shown = limit ? all.slice(0, limit) : all;
  const hex = colours.find((c) => c.name === colour)?.hex ?? "#cccccc";
  return (
    <div className="min-w-0">
      {shown.length ? <Gallery key={colour ?? "all"} photos={shown} name={colour ? `${name} in ${colour}` : name} compact={Boolean(limit)} /> : <Empty colour={colour ?? ""} hex={hex} />}
      {colours.length > 1 && <Chips colours={colours} photos={photos} />}
      {moreHref && all.length > shown.length && (
        <a href={moreHref} className="mt-2 inline-block text-sm font-bold text-lime-700 hover:underline">
          See all {all.length} {colour ? `${colour} ` : ""}photos
        </a>
      )}
    </div>
  );
}

/** "Fiery Red: +₹15,000, ₹11.06 - 20.46 Lakh with this colour", only when the CMS has a price for that colour. */
export function ColourPriceNote({ colours, minLakh, maxLakh }) {
  const { colour } = useColour();
  const c = colours.find((x) => x.name === colour);
  if (!c || typeof c.price !== "number" || !minLakh) return null;
  const lo = minLakh + c.price / 100000;
  const hi = maxLakh + c.price / 100000;
  return (
    <p className="mt-1 text-sm font-semibold" aria-live="polite">
      <span aria-hidden className="mr-1.5 inline-block size-3 rounded-full border border-ink-200 align-middle" style={{ background: c.hex }} />
      {c.name}: {premiumText(c.price)}
      {c.price !== 0 && (
        <span className="font-normal text-ink-500">
          {" "}
          · ₹{lo >= 100 || hi >= 100 ? `${lakh(lo)} - ${lakh(hi)}` : `${lo.toFixed(2)} - ${lakh(hi)}`} with this colour
        </span>
      )}
    </p>
  );
}

/** The colours section: the chosen colour's photographs, every colour's price difference, and the chips. */
export function ColourBrowser({ photos, colours, name }) {
  const { colour, setColour } = useColour();
  if (!colours.length) return <p className="text-sm text-ink-500">The colours of the {name} are not listed yet.</p>;
  const active = colour ?? colours.find((c) => photos.some((p) => p.colour === c.name))?.name ?? colours[0].name;
  const mine = photos.filter((p) => p.colour === active);
  const hex = colours.find((c) => c.name === active)?.hex ?? "#cccccc";
  const priced = colours.filter((c) => typeof c.price === "number");
  return (
    <div>
      {mine.length ? (
        <>
          <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-ink-100">
            <Pic photo={mine[0].photo} alt={`${name} in ${active}`} sizes="(max-width: 1024px) 100vw, 420px" className="h-full w-full object-cover" />
            <span className="absolute bottom-2 left-2 rounded-full bg-ink-950/80 px-3 py-1 text-xs font-bold text-white">
              {active} · {mine.length} photo{mine.length === 1 ? "" : "s"}
            </span>
          </div>
          {mine.length > 1 && (
            <ul className="mt-2 grid grid-cols-4 gap-2">
              {mine.slice(1, 5).map((p) => (
                <li key={p.photo.src} className="aspect-4/3 overflow-hidden rounded-lg">
                  <Pic photo={p.photo} alt={`${name} in ${active}, ${p.kind} view`} sizes="100px" className="h-full w-full object-cover" />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Empty colour={active} hex={hex} />
      )}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Choose a colour">
        <div className="w-full" />
        {colours.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => setColour(c.name)}
            aria-label={`Show ${c.name}`}
            aria-pressed={c.name === active}
            style={{ background: c.hex }}
            className={`mt-3 size-9 rounded-lg border transition ${c.name === active ? "border-ink-900 ring-2 ring-lime-400" : "border-ink-200"}`}
          />
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-bold">
        {active}
        {typeof colours.find((c) => c.name === active)?.price === "number" && <span className="ml-2 font-normal text-ink-500">{premiumText(colours.find((c) => c.name === active).price)}</span>}
      </p>
      {priced.length > 0 && (
        <table className="mt-3 w-full text-left text-sm">
          <caption className="sr-only">Price difference by colour</caption>
          <thead>
            <tr className="text-xs text-ink-500">
              <th className="py-1 font-semibold">Colour</th>
              <th className="py-1 text-right font-semibold">Price difference</th>
            </tr>
          </thead>
          <tbody>
            {priced.map((c) => (
              <tr key={c.name} className="border-t border-ink-100">
                <td className="py-1.5">{c.name}</td>
                <td className="py-1.5 text-right font-semibold">{premiumText(c.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/** Full colour browser for the car's Colours page: chips, that colour's whole gallery, and the price table. */
export function ColourPage({ photos, colours, name }) {
  const { colour } = useColour();
  if (!colours.length) return <Gallery photos={photos} name={name} />;
  const active = colour ?? colours.find((c) => photos.some((p) => p.colour === c.name))?.name ?? colours[0].name;
  const mine = photos.filter((p) => p.colour === active);
  const hex = colours.find((c) => c.name === active)?.hex ?? "#cccccc";
  const priced = colours.filter((c) => typeof c.price === "number");
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card sm:p-8">
      <Chips colours={colours} photos={photos} all={false} />
      <div className="mt-4">{mine.length ? <Gallery key={active} photos={mine} name={`${name} in ${active}`} /> : <Empty colour={active} hex={hex} />}</div>
      {priced.length > 0 && (
        <table className="mt-5 w-full max-w-md text-left text-sm">
          <caption className="mb-1 text-left text-xs font-bold uppercase tracking-wider text-ink-500">Price difference by colour</caption>
          <tbody>
            {colours.map((c) => (
              <tr key={c.name} className="border-t border-ink-100">
                <td className="py-2">
                  <span aria-hidden className="mr-2 inline-block size-3 rounded-full border border-ink-200 align-middle" style={{ background: c.hex }} />
                  {c.name}
                </td>
                <td className="py-2 text-right font-semibold">{typeof c.price === "number" ? premiumText(c.price) : "Not announced"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

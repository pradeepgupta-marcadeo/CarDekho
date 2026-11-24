"use client";

import { AnimatePresence } from "framer-motion";
import { Camera, Palette, Rotate3d, Sofa } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { gallerySections } from "./gallery-sections";

// The viewer and the 3D embed load only after someone asks for them, which keeps the car page fast.
const Viewer360 = dynamic(() => import("./viewer360").then((m) => m.Viewer360), { ssr: false });

const hasSpin = (model, spin) => Boolean(model || spin?.closed || spin?.open || spin?.interior);

/** Opens the full-screen gallery; `start` says where ({ tab, src, shade }). Returns [open(start), viewer element]. */
export function useViewer({ model, spin, name, photos, colors }) {
  const [start, setStart] = useState(null);
  const close = useCallback(() => setStart(null), []);
  const viewer = <AnimatePresence>{start && <Viewer360 name={name} photos={photos} colors={colors} model={model} spin={spin} start={start} onClose={close} />}</AnimatePresence>;
  return [setStart, viewer];
}

export function View360Button({ model, spin, name, photos, colors, className = "" }) {
  const [open, viewer] = useViewer({ model, spin, name, photos, colors });
  // A 360 view needs a studio spin (a frame sequence) or a genuine 3D model; otherwise no button rather than a fake one.
  if (!hasSpin(model, spin)) return null;
  return (
    <>
      <button
        onClick={() => open({ tab: "360" })}
        data-track="view_360"
        className={`inline-flex items-center gap-2 rounded-full bg-lime-400 px-4 py-2.5 text-sm font-bold text-ink-950 shadow-lift transition hover:bg-lime-300 active:scale-95 ${className}`}
      >
        <Rotate3d className="size-4" />
        360° view
      </button>
      {viewer}
    </>
  );
}

/** A row under the main photo, like the car portals: Exterior (27) · Interior (12) · Colours (6) · 360° View. */
export function GalleryLauncher({ model, spin, name, photos, colors, className = "" }) {
  const [open, viewer] = useViewer({ model, spin, name, photos, colors });
  const s = gallerySections(photos, colors);
  const items = [
    ["exterior", "Exterior", s.exterior.list.length, Camera],
    ["interior", "Interior", s.interior.list.length, Sofa],
    ["colours", "Colours", s.colours.filter((c) => c.photo).length, Palette],
    ["360", "360° View", hasSpin(model, spin) ? -1 : 0, Rotate3d],
  ].filter(([, , n]) => n !== 0);
  if (!items.length) return null;
  return (
    <>
      <div role="group" aria-label={`${name} gallery`} className={`scrollbar-none flex gap-2 overflow-x-auto ${className}`}>
        {items.map(([tab, label, n, Icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => open({ tab })}
            data-track={tab === "360" ? "view_360" : "open_gallery"}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition ${tab === "360" ? "border-lime-400 bg-lime-400 text-ink-950 hover:bg-lime-300" : "border-ink-200 bg-white text-ink-800 hover:border-ink-400"}`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {n > 0 && <span className="font-normal text-ink-500">({n})</span>}
          </button>
        ))}
      </div>
      {viewer}
    </>
  );
}

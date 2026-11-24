"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pic } from "./cards";
import { gallerySections, groupAt, photoTitle } from "./gallery-sections";
import { Studio360, studioModes } from "./studio360";

function ModelPane({ carName, model }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-ink-900">
        {!loaded && <p className="absolute inset-0 grid place-items-center text-sm font-semibold text-ink-200">Loading the {carName} 3D model...</p>}
        <iframe
          title={`Interactive 360 degree 3D model of the ${carName}`}
          src={`https://sketchfab.com/models/${model.uid}/embed?autostart=1&preload=1&dnt=1&ui_theme=dark&ui_hint=2`}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          onLoad={() => setLoaded(true)}
          className="relative h-full w-full border-0"
        />
      </div>
      <p className="mt-2 text-center text-xs leading-relaxed text-ink-300">
        Drag to rotate, scroll or pinch to zoom. Fan-made 3D model, so small details can differ from the showroom car.{" "}
        <a href={model.url} target="_blank" rel="noopener" className="font-semibold text-lime-400 underline">
          {model.name} by {model.author}
        </a>{" "}
        ({model.license})
      </p>
    </div>
  );
}

/** Chips that jump to a group, a big photo with arrows (keys, swipe), "7/12 Car Seat Upholstery" and a thumbnail strip. */
function PhotoStage({ section, name, index, setIndex }) {
  const { list, groups } = section;
  const n = list.length;
  const i = Math.min(index, n - 1);
  const cur = list[i];
  const step = useCallback((d) => setIndex((v) => (Math.min(v, n - 1) + d + n) % n), [n, setIndex]);
  const strip = useRef(null);
  const touch = useRef(null);
  const active = groupAt(groups, i);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);
  // Keep the current thumbnail in sight.
  useEffect(() => {
    strip.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [i]);

  return (
    <div className="flex h-full flex-col">
      {groups.length > 1 && (
        <div role="group" aria-label={`${name} photo groups`} className="scrollbar-none mb-3 flex gap-2 overflow-x-auto">
          {groups.map((g) => (
            <button
              key={g.name}
              type="button"
              onClick={() => setIndex(g.first)}
              aria-pressed={active?.name === g.name}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition ${active?.name === g.name ? "border-lime-400 bg-lime-400 text-ink-950" : "border-white/25 text-ink-100 hover:border-white/60"}`}
            >
              {g.name} ({g.count})
            </button>
          ))}
        </div>
      )}
      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-ink-900"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
      >
        <Pic key={cur.photo.src} photo={cur.photo} alt={`${name} ${photoTitle(cur).toLowerCase()}`} sizes="(max-width: 1200px) 95vw, 1150px" className="h-full w-full object-contain" />
        {n > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-ink-950/60 p-2.5 hover:bg-ink-950/80 sm:left-4">
              <ChevronLeft className="size-6" />
            </button>
            <button onClick={() => step(1)} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-ink-950/60 p-2.5 hover:bg-ink-950/80 sm:right-4">
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>
      <p className="mt-2 truncate text-sm" aria-live="polite">
        <span className="font-bold text-lime-400">
          {i + 1}/{n}
        </span>{" "}
        <span className="font-semibold">
          {name} {photoTitle(cur)}
        </span>
      </p>
      {n > 1 && (
        <ul ref={strip} className="scrollbar-none mt-2 flex gap-2 overflow-x-auto pb-1">
          {list.map((p, k) => (
            <li key={p.photo.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(k)}
                aria-label={`Show ${photoTitle(p)}`}
                aria-current={k === i}
                className={`block aspect-3/2 w-20 overflow-hidden rounded-lg ring-2 transition sm:w-24 ${k === i ? "ring-lime-400" : "opacity-60 ring-transparent hover:opacity-100"}`}
              >
                <Pic photo={p.photo} alt="" sizes="96px" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ColourStage({ colours, name, shade, setShade }) {
  const cur = colours[Math.min(shade, colours.length - 1)];
  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-ink-900">
        {/* The car's own photo in that colour; a colour without one says so (no tinted copies). */}
        {cur.photo ? (
          <Pic key={cur.photo.photo.src} photo={cur.photo.photo} alt={`${name} in ${cur.colour.name}`} sizes="(max-width: 1200px) 95vw, 1150px" className="h-full w-full object-contain" />
        ) : (
          <p className="grid h-full place-items-center text-sm text-ink-300">
            No photo of the {name} in {cur.colour.name} yet.
          </p>
        )}
      </div>
      <p className="mt-2 text-sm">
        <span className="font-bold text-lime-400">
          {shade + 1}/{colours.length}
        </span>{" "}
        <span className="font-semibold">
          {name} {cur.colour.name}
        </span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {colours.map((c, k) => (
          <button
            key={c.colour.name}
            onClick={() => setShade(k)}
            aria-pressed={k === shade}
            aria-label={`Show ${c.colour.name}`}
            title={c.colour.name}
            style={{ background: c.colour.hex }}
            className={`size-9 rounded-full border border-white/30 ${k === shade ? "ring-2 ring-lime-400 ring-offset-2 ring-offset-ink-950" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The car's full-screen gallery, like the car portals: Exterior, Interior, Colours and 360° View tabs; inside a photo
 * tab, the source's groups (Looks, Details, Lights; Dashboard, Seats, Sunroof...) as chips with counts.
 * start: { tab: "exterior" | "interior" | "colours" | "360", src?: photo to open on, shade?: colour index }.
 */
export function Viewer360({ name, photos, colors, model, spin, start = { tab: "360" }, onClose }) {
  const sections = useMemo(() => gallerySections(photos, colors), [photos, colors]);
  const has360 = studioModes(spin).length > 0 || Boolean(model);
  const tabs = [
    ["exterior", "Exterior", sections.exterior.list.length],
    ["interior", "Interior", sections.interior.list.length],
    ["colours", "Colours", sections.colours.length],
    ["360", "360° View", has360 ? 1 : 0],
  ].filter(([, , count]) => count > 0);
  const startIndex = (key) => Math.max(0, sections[key]?.list?.findIndex((p) => p.photo.src === start.src) ?? 0);
  const [tab, setTab] = useState(() => (tabs.some(([k]) => k === start.tab) ? start.tab : tabs[0]?.[0]));
  const [index, setIndex] = useState(() => ({ exterior: start.tab === "exterior" ? startIndex("exterior") : 0, interior: start.tab === "interior" ? startIndex("interior") : 0 }));
  const [shade, setShade] = useState(start.shade ?? 0);
  const setFor = useCallback((key) => (v) => setIndex((m) => ({ ...m, [key]: typeof v === "function" ? v(m[key]) : v })), []);
  const setExterior = useMemo(() => setFor("exterior"), [setFor]);
  const setInterior = useMemo(() => setFor("interior"), [setFor]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} gallery and 360 degree view`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-90 flex flex-col bg-ink-950 text-white"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 border-b border-white/10 px-3 sm:px-6">
        <div className="flex items-center gap-2 py-2.5">
          <button onClick={onClose} aria-label="Close viewer" className="rounded-full p-2 hover:bg-white/10">
            <ArrowLeft className="size-5" />
          </button>
          <p className="font-display font-bold">{name}</p>
        </div>
        <div role="tablist" aria-label="Viewer sections" className="scrollbar-none flex gap-1 overflow-x-auto">
          {tabs.map(([t, label, count]) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative whitespace-nowrap px-3 py-3 text-sm font-bold ${tab === t ? "text-white" : "text-ink-300 hover:text-white"}`}
            >
              {label}
              {t !== "360" && <span className={`ml-1 font-normal ${tab === t ? "text-lime-400" : "text-ink-400"}`}>({count})</span>}
              {tab === t && <motion.span layoutId="viewer-tab" className="absolute inset-x-1 bottom-0 h-0.75 rounded-full bg-lime-400" />}
            </button>
          ))}
        </div>
        <button onClick={onClose} aria-label="Close" className="hidden rounded-full p-2 hover:bg-white/10 sm:block">
          <X className="size-5" />
        </button>
      </header>
      <div className="min-h-0 flex-1 p-3 sm:p-5">
        <div className="mx-auto h-full max-w-6xl">
          {tab === "360" && (
            <div className="h-full">
              {/* The studio 360 (Exterior / Open / Interior) like the car portals; a 3D model only when there is no studio view. */}
              {studioModes(spin).length ? <Studio360 spin={spin} name={name} /> : model ? <ModelPane carName={name} model={model} /> : null}
            </div>
          )}
          {tab === "exterior" && <PhotoStage section={sections.exterior} name={name} index={index.exterior} setIndex={setExterior} />}
          {tab === "interior" && <PhotoStage section={sections.interior} name={name} index={index.interior} setIndex={setInterior} />}
          {tab === "colours" && <ColourStage colours={sections.colours} name={name} shade={shade} setShade={setShade} />}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

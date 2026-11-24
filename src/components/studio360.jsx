"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Panorama360 } from "./panorama360";
import { Spin360 } from "./spin360";

/** The views a car has, in the portals' order: Exterior, Open (doors open), Interior. */
export function studioModes(spin) {
  return [...(spin?.closed ? [["closed", "Exterior"]] : []), ...(spin?.open ? [["open", "Open"]] : []), ...(spin?.interior ? [["interior", "Interior"]] : [])];
}

/** A control on the picture: a thin white icon, like a showroom configurator. */
export function OverlayButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full text-white drop-shadow transition hover:bg-white/15 disabled:opacity-40 sm:size-11"
    >
      {children}
    </button>
  );
}

/**
 * The car's 360 studio: one big picture with the view tabs (Exterior / Open / Interior) at the bottom left, the
 * view's own controls at the bottom right and full screen at the top right, all laid over the picture.
 * inline: sized by its width (16:9) on a page; otherwise it fills its box (the full-screen viewer).
 */
export function Studio360({ spin, name, inline = false }) {
  const modes = studioModes(spin);
  const [mode, setMode] = useState(modes[0]?.[0]);
  const [full, setFull] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    const onFs = () => setFull(document.fullscreenElement === box.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);
  if (!modes.length) return null;
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else box.current?.requestFullscreen?.();
  };
  const tabs = (
    <div role="tablist" aria-label={`${name} 360 views`} className="flex overflow-hidden rounded-md border border-white/40 bg-ink-950/55 backdrop-blur-sm">
      {modes.map(([k, label]) => (
        <button
          key={k}
          type="button"
          role="tab"
          aria-selected={mode === k}
          onClick={() => setMode(k)}
          className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide transition sm:px-5 sm:py-2.5 sm:text-sm ${mode === k ? "bg-white text-cyan-600" : "text-white hover:bg-white/15"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
  return (
    <div ref={box} className={`relative overflow-hidden bg-[#e9e9e9] ${full ? "h-full w-full" : inline ? "aspect-4/3 w-full rounded-xl sm:aspect-video" : "h-full w-full rounded-2xl"}`}>
      {mode === "interior" ? <Panorama360 key="interior" view={spin.interior} name={name} tabs={tabs} /> : <Spin360 key={mode} view={spin[mode]} name={name} tabs={tabs} />}
      <div className="absolute right-3 top-3">
        <button
          type="button"
          onClick={toggleFull}
          aria-label={full ? "Leave full screen" : "Full screen"}
          className="grid size-11 place-items-center rounded-full border border-white/60 bg-ink-950/30 text-white backdrop-blur-sm transition hover:bg-ink-950/50"
        >
          {full ? <Minimize2 className="size-5" /> : <Maximize2 className="size-5" />}
        </button>
      </div>
    </div>
  );
}

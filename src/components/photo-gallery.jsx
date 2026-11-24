"use client";

import { useMemo, useState } from "react";
import { Pic } from "./cards";
import { gallerySections, photoTitle } from "./gallery-sections";
import { useViewer } from "./view360-button";

const STEP = 24; // photos shown at a time in a tab; "Show more" adds the next ones

const chip = (on) => `shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${on ? "bg-ink-950 text-white" : "bg-white text-ink-700 shadow-card hover:bg-lime-300/40"}`;

/**
 * The car's whole gallery, in tabs like the car portals: All, Exterior, Interior and Colours, and inside Exterior and
 * Interior the source's groups (Looks, Details, Lights; Dashboard, Seats, Sunroof...). A photo opens the full-screen
 * gallery on that photo, with the 360 view one tab away.
 */
export function PhotoGallery({ photos, colours = [], name, model = null, spin = null }) {
  const s = useMemo(() => gallerySections(photos, colours), [photos, colours]);
  const tabs = useMemo(() => {
    const col = s.colours.filter((c) => c.photo).map((c) => c.photo);
    return [
      ["all", "All", [...s.exterior.list, ...s.interior.list, ...col], []],
      ["exterior", "Exterior", s.exterior.list, s.exterior.groups],
      ["interior", "Interior", s.interior.list, s.interior.groups],
      ["colours", "Colours", col, []],
    ].filter(([, , list]) => list.length);
  }, [s]);
  const [tab, setTab] = useState(tabs[0]?.[0]);
  const [group, setGroup] = useState(null);
  const [shown, setShown] = useState({ key: "", n: STEP });
  const [open, viewer] = useViewer({ model, spin, name, photos, colors: colours });
  const cur = tabs.find(([k]) => k === tab);
  const groups = cur?.[3] ?? [];
  const g = groups.find((x) => x.name === group);
  const list = g ? cur[2].slice(g.first, g.first + g.count) : (cur?.[2] ?? []);
  const key = `${tab}/${group ?? ""}`;
  const count = shown.key === key ? shown.n : STEP;
  if (!tabs.length) return null;

  const openAt = (p) => {
    if (p.colour)
      return open({
        tab: "colours",
        shade: Math.max(
          0,
          colours.findIndex((c) => c.name === p.colour),
        ),
      });
    open({ tab: p.kind === "interior" ? "interior" : "exterior", src: p.photo.src });
  };

  return (
    <div>
      <div role="tablist" aria-label={`${name} photo groups`} className="scrollbar-none flex gap-2 overflow-x-auto">
        {tabs.map(([k, label, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => {
              setTab(k);
              setGroup(null);
            }}
            className={chip(tab === k)}
          >
            {label} <span className={tab === k ? "text-lime-400" : "text-ink-400"}>{l.length}</span>
          </button>
        ))}
      </div>
      {groups.length > 1 && (
        <div role="group" aria-label={`${name} ${tab} photo groups`} className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {[{ name: null, label: "All", count: cur[2].length }, ...groups.map((x) => ({ ...x, label: x.name }))].map((x) => (
            <button
              key={x.label}
              type="button"
              aria-pressed={group === x.name}
              onClick={() => setGroup(x.name)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${group === x.name ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-400"}`}
            >
              {x.label} ({x.count})
            </button>
          ))}
        </div>
      )}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.slice(0, count).map((p, i) => (
          <li key={`${p.photo.src}-${i}`}>
            <button onClick={() => openAt(p)} className="group block w-full text-left" aria-label={`Open ${p.colour ?? photoTitle(p)} of the ${name}`}>
              <span className="block aspect-4/3 overflow-hidden rounded-xl bg-ink-100">
                <Pic
                  photo={p.photo}
                  alt={p.colour ? `${name} in ${p.colour}` : `${name} ${photoTitle(p).toLowerCase()}`}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </span>
              <span className="mt-1 block truncate text-xs font-medium text-ink-700">{p.colour ?? photoTitle(p)}</span>
            </button>
          </li>
        ))}
      </ul>
      {list.length > count && (
        <div className="mt-5 text-center">
          <button onClick={() => setShown({ key, n: count + STEP })} className="rounded-full bg-ink-950 px-6 py-3 text-sm font-bold text-white hover:bg-ink-800">
            Show more photos <span className="font-normal text-ink-300">({list.length - count} left)</span>
          </button>
        </div>
      )}
      {viewer}
    </div>
  );
}

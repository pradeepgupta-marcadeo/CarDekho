"use client";

import { ChevronLeft, ChevronRight, Minus, Pause, Plus, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { OverlayButton } from "./studio360";

/**
 * Order in which frames are fetched: every 8th first (the car can be turned almost at once, a little coarse),
 * then the frames between them, so the turn gets finer while you watch.
 */
function loadOrder(n) {
  const seen = new Set();
  const out = [];
  for (const step of [8, 4, 2, 1]) {
    for (let i = 0; i < n; i += step) {
      if (!seen.has(i)) {
        seen.add(i);
        out.push(i);
      }
    }
  }
  return out;
}

const MAX_ZOOM = 2.5;

/**
 * A studio 360 view like the car portals: a sequence of photos taken all round the car on a turntable (usually 72,
 * one every 5 degrees), drawn one at a time on a canvas, so the car itself turns. Drag or swipe to turn (with a
 * short glide), it turns by itself until touched, arrow keys and buttons step it, the wheel, pinch or the buttons
 * zoom (then drag moves the picture), double-click resets the zoom, and it can go full screen.
 * view: { frames: [url], w, h }.
 */
export function Spin360({ view, name, tabs = null }) {
  const n = view.frames.length;
  const wrap = useRef(null);
  const canvas = useRef(null);
  const imgs = useRef([]);
  const st = useRef({ pos: 0, vel: 0, auto: true, zoom: 1, panX: 0, panY: 0, drag: null, pinch: null, drawn: -1, dirty: true });
  const pointers = useRef(new Map());
  const [loaded, setLoaded] = useState(0);
  const [auto, setAuto] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [zoom, setZoom] = useState(1);
  const bg = useRef("#e9e9e9"); // the studio colour, read from the first frame, fills any space round the picture

  // Nearest frame that has loaded (while loading, the coarse frames stand in for the missing ones).
  const frameAt = useCallback(
    (i) => {
      for (let d = 0; d < n; d++) {
        for (const j of [i - d, i + d]) {
          const k = ((j % n) + n) % n;
          if (imgs.current[k]?.complete && imgs.current[k].naturalWidth) return imgs.current[k];
        }
      }
      return null;
    },
    [n],
  );

  const draw = useCallback(() => {
    const c = canvas.current;
    if (!c) return false;
    const s = st.current;
    const i = ((Math.round(s.pos) % n) + n) % n;
    const img = frameAt(i);
    if (!img) return false;
    const dpr = window.devicePixelRatio || 1;
    const W = c.clientWidth;
    const H = c.clientHeight;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bg.current;
    ctx.fillRect(0, 0, W, H);
    // contain the frame, then zoom around the centre and pan
    const fit = Math.min(W / img.naturalWidth, H / img.naturalHeight) * s.zoom;
    const dw = img.naturalWidth * fit;
    const dh = img.naturalHeight * fit;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (W - dw) / 2 + s.panX, (H - dh) / 2 + s.panY, dw, dh);
    s.drawn = i;
    s.dirty = false;
    return true;
  }, [frameAt, n]);

  // The studio colour fills the space round a frame of another shape. It is read from a tiny copy served by this
  // site's own image service, since a canvas may not read pixels of a picture from another address.
  useEffect(() => {
    const probe = new Image();
    probe.onload = () => {
      try {
        const t = document.createElement("canvas").getContext("2d");
        t.drawImage(probe, 0, 0, 1, 1, 0, 0, 1, 1);
        const [r, g, b] = t.getImageData(0, 0, 1, 1).data;
        bg.current = `rgb(${r},${g},${b})`;
        st.current.dirty = true;
      } catch {
        // the default studio grey stays
      }
    };
    // Live, frames come from the storage bucket, which allows reading pixels (CORS); locally, through the image service.
    const direct = view.frames[0].includes("/storage/v1/object/public/") || view.frames[0].includes("/media/");
    if (direct) probe.crossOrigin = "anonymous";
    probe.src = direct ? view.frames[0] : `/_next/image?url=${encodeURIComponent(view.frames[0])}&w=96&q=70`;
  }, [view]);

  // Load every frame, coarse ones first.
  useEffect(() => {
    let alive = true;
    imgs.current = new Array(n);
    for (const i of loadOrder(n)) {
      const im = new Image();
      im.decoding = "async";
      im.onload = () => {
        if (!alive) return;
        setLoaded((x) => x + 1);
        st.current.dirty = true;
      };
      im.src = view.frames[i];
      imgs.current[i] = im;
    }
    return () => {
      alive = false;
    };
  }, [view, n]);

  // One animation loop: the turn by itself, the glide after a drag, and a redraw only when something changed.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    st.current.auto = auto;
    const tick = (t) => {
      const s = st.current;
      const dt = Math.min(64, t - last) / 1000;
      last = t;
      if (!s.drag && !s.pinch) {
        if (Math.abs(s.vel) > 0.5) {
          s.pos += s.vel * dt;
          s.vel *= Math.pow(0.02, dt); // the glide fades out within about a second
        } else if (s.auto) {
          s.pos += (n / 6) * dt; // one full turn in about 6 seconds
        }
      }
      const i = ((Math.round(s.pos) % n) + n) % n;
      if (i !== s.drawn || s.dirty) draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onResize = () => (st.current.dirty = true);
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onResize);
    };
  }, [auto, draw, n]);

  const stopAuto = () => {
    st.current.auto = false;
    setAuto(false);
  };
  const setZoomTo = (z) => {
    const s = st.current;
    s.zoom = Math.min(MAX_ZOOM, Math.max(1, z));
    if (s.zoom === 1) s.panX = s.panY = 0;
    s.dirty = true;
    setZoom(s.zoom);
  };
  const step = (d) => {
    stopAuto();
    const s = st.current;
    s.vel = 0;
    s.pos = Math.round(s.pos) + d;
  };

  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = st.current;
    stopAuto();
    s.vel = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      s.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: s.zoom };
      s.drag = null;
    } else {
      s.drag = { x: e.clientX, y: e.clientY, pos: s.pos, panX: s.panX, panY: s.panY, t: performance.now(), lastX: e.clientX };
    }
  };
  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = st.current;
    if (s.pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      setZoomTo((s.pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / s.pinch.d);
      return;
    }
    const d = s.drag;
    if (!d) return;
    if (s.zoom > 1) {
      // zoomed in: drag moves the picture
      s.panX = d.panX + (e.clientX - d.x);
      s.panY = d.panY + (e.clientY - d.y);
      s.dirty = true;
      return;
    }
    const width = wrap.current?.clientWidth || 800;
    // A drag across about one and a half widths turns the car once round.
    const perPx = n / (width * 1.5);
    s.pos = d.pos - (e.clientX - d.x) * perPx;
    const now = performance.now();
    const dt = Math.max(8, now - d.t) / 1000;
    s.vel = (-(e.clientX - d.lastX) * perPx) / dt;
    d.t = now;
    d.lastX = e.clientX;
  };
  const onUp = (e) => {
    pointers.current.delete(e.pointerId);
    const s = st.current;
    if (pointers.current.size < 2) s.pinch = null;
    if (s.drag && performance.now() - s.drag.t > 80) s.vel = 0; // held still before letting go: no glide
    s.vel = Math.max(-n * 1.5, Math.min(n * 1.5, s.vel));
    s.drag = null;
  };

  const pct = Math.round((loaded / n) * 100);
  return (
    <div ref={wrap} className="absolute inset-0">
      <canvas
        ref={canvas}
        role="img"
        aria-label={`${name}, 360 degree view. Drag to turn the car.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
          if (e.key === "+" || e.key === "=") setZoomTo(st.current.zoom + 0.5);
          if (e.key === "-") setZoomTo(st.current.zoom - 0.5);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDoubleClick={() => setZoomTo(1)}
        onWheel={(e) => setZoomTo(st.current.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15))}
        className={`absolute inset-0 h-full w-full touch-none select-none outline-none ${zoom > 1 ? "cursor-move" : "cursor-grab active:cursor-grabbing"}`}
      />
      {loaded === 0 && <p className="absolute inset-0 grid place-items-center text-sm font-semibold text-ink-500">Loading the 360 view…</p>}
      {loaded > 0 && loaded < n && <span className="absolute left-3 top-3 rounded-full bg-ink-950/60 px-3 py-1 text-xs font-semibold text-white">Loading {pct}%</span>}
      {loaded === n && auto && (
        <span className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-ink-950/55 px-3 py-1 text-xs font-semibold text-white">Drag to rotate the car</span>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-linear-to-t from-ink-950/55 via-ink-950/20 to-transparent p-3 pt-10">
        <div className="pointer-events-auto">{tabs}</div>
        <div className="pointer-events-auto flex items-center">
          <OverlayButton label="Turn left" onClick={() => step(-1)}>
            <ChevronLeft className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton
            label={auto ? "Stop turning" : "Turn by itself"}
            onClick={() => {
              st.current.auto = !auto;
              setAuto(!auto);
            }}
          >
            {auto ? <Pause className="size-6" strokeWidth={1.5} /> : <RotateCw className="size-6" strokeWidth={1.5} />}
          </OverlayButton>
          <OverlayButton label="Turn right" onClick={() => step(1)}>
            <ChevronRight className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton label="Zoom in" onClick={() => setZoomTo(zoom + 0.5)} disabled={zoom >= MAX_ZOOM}>
            <Plus className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton label="Zoom out" onClick={() => setZoomTo(zoom - 0.5)} disabled={zoom <= 1}>
            <Minus className="size-7" strokeWidth={1.5} />
          </OverlayButton>
        </div>
      </div>
    </div>
  );
}

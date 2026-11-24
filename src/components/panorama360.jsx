"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Minus, Pause, Plus, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OverlayButton } from "./studio360";

const FACE = 2000; // drawing size of a cube face in CSS pixels (the photos are 1875 px)
// Where each face of the cube sits around the viewer: front, right, back, left, up, down (the panorama's order).
const PLACE = ["", "rotateY(-90deg)", "rotateY(180deg)", "rotateY(90deg)", "rotateX(-90deg)", "rotateX(90deg)"];
const MIN_FOV = 30;
const MAX_FOV = 100;

/**
 * Look round the cabin: a cube panorama (six photos of the inside of the car, one per face) seen from its centre.
 * Drag or swipe to look around (with a glide), it turns slowly by itself until touched, arrow buttons and keys
 * look left, right, up and down, the wheel, pinch or buttons zoom, and it can go full screen. Drawn with CSS 3D,
 * so the browser's graphics chip does the work. view: { faces: [6 urls], start: { pan, tilt, fov } }.
 */
export function Panorama360({ view, name, tabs = null }) {
  const wrap = useRef(null);
  const box = useRef(null);
  const cam = useRef(null);
  const st = useRef({ pan: view.start?.pan ?? 0, tilt: view.start?.tilt ?? 0, fov: view.start?.fov ?? 75, vp: 0, vt: 0, auto: true, drag: null, pinch: null });
  const pointers = useRef(new Map());
  const [loaded, setLoaded] = useState(0);
  const [auto, setAuto] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Place the camera: the cube is pushed back by the perspective distance, so the eye sits at its centre.
  const apply = () => {
    const s = st.current;
    const el = box.current;
    if (!el || !cam.current) return;
    const p = el.clientHeight / 2 / Math.tan((s.fov * Math.PI) / 360);
    el.style.perspective = `${p}px`;
    // pan grows to the left and tilt grows upwards, so "look right" lowers pan and the picture follows a drag
    cam.current.style.transform = `translateZ(${p}px) rotateX(${s.tilt}deg) rotateY(${-s.pan}deg)`;
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    st.current.auto = auto;
    const tick = (t) => {
      const s = st.current;
      const dt = Math.min(64, t - last) / 1000;
      last = t;
      if (!s.drag && !s.pinch) {
        if (Math.abs(s.vp) > 1 || Math.abs(s.vt) > 1) {
          s.pan += s.vp * dt;
          s.tilt += s.vt * dt;
          const k = Math.pow(0.03, dt);
          s.vp *= k;
          s.vt *= k;
        } else if (s.auto) s.pan -= 6 * dt; // a slow look round
      }
      s.tilt = Math.max(-90, Math.min(90, s.tilt));
      apply();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const stopAuto = () => {
    st.current.auto = false;
    setAuto(false);
  };
  const zoomBy = (f) => {
    const s = st.current;
    s.fov = Math.max(MIN_FOV, Math.min(MAX_FOV, s.fov * f));
  };
  const look = (dp, dt) => {
    stopAuto();
    const s = st.current;
    s.vp = s.vt = 0;
    s.pan += dp;
    s.tilt += dt;
  };

  const onDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = st.current;
    stopAuto();
    s.vp = s.vt = 0;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      s.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), fov: s.fov };
      s.drag = null;
    } else s.drag = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = st.current;
    if (s.pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      s.fov = Math.max(MIN_FOV, Math.min(MAX_FOV, (s.pinch.fov * s.pinch.d) / Math.hypot(a.x - b.x, a.y - b.y)));
      return;
    }
    const d = s.drag;
    if (!d) return;
    // The picture follows the finger: degrees per pixel from the current zoom.
    const perPx = s.fov / (box.current?.clientHeight || 600);
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    s.pan += dx * perPx;
    s.tilt += dy * perPx;
    const now = performance.now();
    const dt = Math.max(8, now - d.t) / 1000;
    s.vp = (dx * perPx) / dt;
    s.vt = (dy * perPx) / dt;
    d.x = e.clientX;
    d.y = e.clientY;
    d.t = now;
  };
  const onUp = (e) => {
    pointers.current.delete(e.pointerId);
    const s = st.current;
    if (pointers.current.size < 2) s.pinch = null;
    if (s.drag && performance.now() - s.drag.t > 80) s.vp = s.vt = 0;
    s.vp = Math.max(-240, Math.min(240, s.vp));
    s.vt = Math.max(-240, Math.min(240, s.vt));
    s.drag = null;
  };
  return (
    <div ref={wrap} className="absolute inset-0">
      <div
        ref={box}
        role="img"
        aria-label={`${name} cabin, 360 degree view. Drag to look around.`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") look(10, 0);
          if (e.key === "ArrowRight") look(-10, 0);
          if (e.key === "ArrowUp") look(0, 10);
          if (e.key === "ArrowDown") look(0, -10);
          if (e.key === "+" || e.key === "=") zoomBy(0.85);
          if (e.key === "-") zoomBy(1 / 0.85);
        }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={(e) => zoomBy(e.deltaY < 0 ? 0.9 : 1 / 0.9)}
        className="absolute inset-0 cursor-grab touch-none select-none overflow-hidden bg-ink-900 outline-none active:cursor-grabbing"
      >
        <div ref={cam} className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d" }}>
          {view.faces.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- a cube face is placed in 3D space; next/image cannot be transformed like this
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              onLoad={() => setLoaded((x) => x + 1)}
              className="absolute max-w-none"
              style={{
                width: FACE,
                height: FACE,
                left: -FACE / 2,
                top: -FACE / 2,
                backfaceVisibility: "hidden",
                // a hair larger than the cube, so no seam shows where two faces meet
                transform: `${PLACE[i]} translateZ(${-FACE / 2}px) scale(1.003)`,
              }}
            />
          ))}
        </div>
        {loaded < 6 && <p className="absolute inset-0 grid place-items-center text-sm font-semibold text-white">Loading the cabin view… {Math.round((loaded / 6) * 100)}%</p>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-linear-to-t from-ink-950/55 via-ink-950/20 to-transparent p-3 pt-10">
        <div className="pointer-events-auto">{tabs}</div>
        <div className="pointer-events-auto flex items-center">
          <OverlayButton label="Look up" onClick={() => look(0, 15)}>
            <ChevronUp className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton label="Look down" onClick={() => look(0, -15)}>
            <ChevronDown className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton label="Look left" onClick={() => look(20, 0)}>
            <ChevronLeft className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton
            label={auto ? "Stop turning" : "Look round by itself"}
            onClick={() => {
              st.current.auto = !auto;
              setAuto(!auto);
            }}
          >
            {auto ? <Pause className="size-6" strokeWidth={1.5} /> : <RotateCw className="size-6" strokeWidth={1.5} />}
          </OverlayButton>
          <OverlayButton label="Look right" onClick={() => look(-20, 0)}>
            <ChevronRight className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton label="Zoom in" onClick={() => zoomBy(0.8)}>
            <Plus className="size-7" strokeWidth={1.5} />
          </OverlayButton>
          <OverlayButton label="Zoom out" onClick={() => zoomBy(1 / 0.8)}>
            <Minus className="size-7" strokeWidth={1.5} />
          </OverlayButton>
        </div>
      </div>
    </div>
  );
}

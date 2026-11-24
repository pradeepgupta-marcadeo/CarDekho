"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useRef } from "react";

export function Carousel({ children, label, item = "w-[78%] sm:w-[44%] lg:w-[31%] xl:w-[24%]" }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div className="group/c relative" role="group" aria-label={label}>
      <div ref={ref} className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 py-3 lg:mx-0 lg:px-0.5">
        {Children.map(children, (child) => (
          <div className={`shrink-0 snap-start ${item}`}>{child}</div>
        ))}
      </div>
      <button
        onClick={() => scroll(-1)}
        aria-label={`Scroll ${label} back`}
        className="absolute -left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white opacity-0 shadow-lift transition hover:bg-lime-400 group-hover/c:opacity-100 lg:grid"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label={`Scroll ${label} forward`}
        className="absolute -right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white opacity-0 shadow-lift transition hover:bg-lime-400 group-hover/c:opacity-100 lg:grid"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

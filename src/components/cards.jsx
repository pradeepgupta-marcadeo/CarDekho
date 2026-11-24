"use client";

import { Ic } from "./icon-sprite";
import Image from "next/image";
import Link from "next/link";
import { useApp } from "./app-state";

export function Pic({ photo, alt, sizes, className, priority }) {
  return (
    <Image
      src={photo.src}
      alt={alt}
      width={photo.w}
      height={photo.h}
      sizes={sizes}
      className={className}
      // The first big photo on a page is usually its LCP element: preload it and fetch it before anything else.
      preload={priority}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : undefined}
      quality={80}
      unoptimized={photo.src.startsWith("http") && !photo.src.includes("/uploads/")}
    />
  );
}

export function HeartButton({ id, name }) {
  const { shortlist, toggleShortlist } = useApp();
  const on = shortlist.includes(id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleShortlist(id);
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from shortlist` : `Add ${name} to shortlist`}
      className="grid size-9 place-items-center rounded-full bg-white/90 shadow-card backdrop-blur transition hover:scale-110 active:scale-90"
    >
      <Ic name="heart" className={`size-4 transition ${on ? "fill-coral-500 text-coral-500" : "text-ink-700"}`} />
    </button>
  );
}

export function LeadButton({ title, intent, label, variant = "dark", className = "" }) {
  const { openLead } = useApp();
  const styles = {
    dark: "bg-ink-900 text-white hover:bg-ink-700",
    lime: "bg-lime-400 text-ink-950 hover:bg-lime-300",
    outline: "border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white",
    light: "bg-white text-ink-950 hover:bg-lime-400",
  }[variant];
  return (
    <button onClick={() => openLead(title, intent)} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition active:scale-[0.98] ${styles} ${className}`}>
      {label}
    </button>
  );
}

export function CarCard({ car, priority }) {
  const upcoming = car.status === "upcoming";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-16/10 overflow-hidden bg-ink-100">
        <Link href={car.url} aria-label={`${car.full} details`} tabIndex={-1}>
          <Pic
            photo={car.photo}
            alt={`${car.full} ${car.body} front view`}
            sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 25vw"
            priority={priority}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute right-2.5 top-2.5 z-10">
          <HeartButton id={car.key} name={car.full} />
        </div>
        {car.status !== "on-sale" && (
          <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${upcoming ? "bg-ink-950 text-white" : "bg-lime-400 text-ink-950"}`}>
            {upcoming ? `Expected ${car.launch}` : car.launch}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-ink-500">{car.brand}</p>
        <h3 className="mt-0.5 truncate text-lg font-bold leading-tight">
          {/* The name's link covers the whole card, so a click anywhere on it opens the car. */}
          <Link href={car.url} className="hover:underline after:absolute after:inset-0">
            {car.name}
          </Link>
        </h3>
        <p className="mt-2 text-base font-extrabold">
          {car.priceText}
          <span className="ml-1 text-xs font-medium text-ink-500">{upcoming ? "expected" : "ex-showroom"}</span>
        </p>
        <ul className="mt-3 flex min-h-13 flex-wrap content-start gap-x-3 gap-y-1 text-xs text-ink-500">
          <li className="flex items-center gap-1">
            <Ic name="fuel" className="size-3.5" />
            {car.fuels.join(" / ")}
          </li>
          {car.mileage && (
            <li className="flex items-center gap-1">
              <Ic name="gauge" className="size-3.5" />
              {car.mileage}
            </li>
          )}
          <li className="flex items-center gap-1">
            <Ic name="users" className="size-3.5" />
            {car.seats} seats
          </li>
          {car.rating > 0 && (
            <li className="flex items-center gap-1">
              <Ic name="star" className="size-3.5 fill-lime-500 text-lime-500" />
              {car.rating} ({car.reviews})
            </li>
          )}
        </ul>
        <div className="relative z-10 mt-auto pt-4">
          <LeadButton
            title={upcoming ? `Alert me about the ${car.full}` : `Best price for the ${car.full}`}
            intent={upcoming ? "Launch alert" : "Best price"}
            label={upcoming ? "Alert me at launch" : "Get best price"}
            variant="outline"
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BRANDS, brandLogo } from "@/data/cars";

export function BrandGrid() {
  return (
    <section className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card lg:sticky lg:top-20">
      <h2 className="px-5 pt-5 text-xl font-extrabold">All Brands</h2>
      <ul className="mt-3 grid grid-cols-3 border-t border-ink-100">
        {BRANDS.slice(0, 9).map((b) => {
          const logo = brandLogo(b.slug);
          return (
            <li key={b.slug} className="border-b border-r border-ink-100 [&:nth-child(3n)]:border-r-0">
              <Link href={`/brands/${b.slug}`} aria-label={`${b.name} cars`} title={b.name} className="flex h-20 items-center justify-center p-2 transition hover:bg-lime-300/50">
                {logo ? (
                  <Image
                    src={logo.src}
                    alt={`${b.name} logo`}
                    width={logo.w}
                    height={logo.h}
                    unoptimized
                    className="h-auto max-h-14 w-full max-w-21 object-contain [filter:contrast(1.3)_saturate(1.3)_drop-shadow(0_0_0.5px_rgba(0,0,0,0.65))]"
                  />
                ) : (
                  <span className="font-display text-lg font-extrabold">{b.name}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="p-4">
        <Link href="/brands" className="text-sm font-bold text-lime-700 hover:underline">
          View all car brands
        </Link>
      </div>
    </section>
  );
}

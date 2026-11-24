import Link from "next/link";
import { FOOTER, SITE, block } from "@/data/site";
import { credits } from "@/data/store";

export function Footer() {
  return (
    <footer className="bg-ink-950 pb-24 text-ink-300 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_3fr]">
          <div>
            <p className="font-display text-2xl font-extrabold text-white">{SITE.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">{block("footer.about", "Research new cars, compare them honestly and talk to a dealer only when you are ready.")}</p>
            <p className="mt-4 rounded-xl border border-white/10 p-3 text-xs leading-relaxed text-ink-300">
              Prices are ex-showroom, Delhi, and can change: confirm them with an authorised dealer before you buy. Some reviews and dealer details are still sample data. Car names belong to their
              makers and are used only to identify the models.
            </p>
            {credits().length > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-ink-400">
                Data:{" "}
                {credits().map((c, i) => (
                  <span key={c.name}>
                    {i > 0 && " · "}
                    <a href={c.url} rel="noopener" className="underline hover:text-lime-400">
                      {c.name}
                    </a>{" "}
                    ({c.license})
                  </span>
                ))}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {FOOTER.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-bold uppercase tracking-widest text-white">{g.title}</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="transition hover:text-lime-400">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-ink-400">© 2026 {SITE.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}

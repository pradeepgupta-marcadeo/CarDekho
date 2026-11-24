import Link from "next/link";

export const metadata = { title: "Page not found | Wheelora", description: "This page could not be found.", robots: { index: false, follow: true } };

export default function NotFound() {
  const links = [
    { label: "Explore new cars", href: "/new-cars" },
    { label: "See popular cars", href: "/popular-cars" },
    { label: "Compare cars", href: "/compare-cars" },
    { label: "Read car news", href: "/news" },
  ];
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-2xl place-content-center px-4 py-16 text-center">
      <p className="font-display text-7xl font-extrabold text-lime-700">404</p>
      <h1 className="mt-2 text-3xl font-extrabold">Wrong turn, but you are not lost</h1>
      <p className="mt-2 text-ink-500">We could not find that page. Try one of these routes instead.</p>
      <ul className="mt-6 flex flex-wrap justify-center gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block rounded-full bg-ink-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-ink-700">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

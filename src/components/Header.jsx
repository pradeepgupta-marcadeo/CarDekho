"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Home, Menu, MapPin, Newspaper, Scale, Search, User, X, CarFront } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useApp } from "./app-state";

function Logo() {
  const { siteName } = useApp();
  return (
    <Link href="/" aria-label={`${siteName} home page`} className="group flex shrink-0 items-center gap-2">
      <span className="grid size-9 place-items-center rounded-xl bg-lime-400 transition group-hover:rotate-[-8deg]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="#080c16" strokeWidth="2.6" />
          <circle cx="12" cy="12" r="2.6" fill="#080c16" />
          <path d="M12 3v6M4 16.5 9.7 13.3M20 16.5l-5.7-3.2" stroke="#080c16" strokeWidth="2.2" />
        </svg>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-white">{siteName}</span>
    </Link>
  );
}

let fullList = null; // the complete search list, loaded once per visit

function SearchBox({ items: popular, onDone, autoFocus }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(fullList ?? popular);
  const ref = useRef(null);
  // The page carries only a few suggestions; the full list arrives the first time the box is used.
  const loadAll = () => {
    if (fullList) return;
    fetch("/api/search-items")
      .then((r) => (r.ok ? r.json() : null))
      .then((list) => {
        if (!list) return;
        fullList = list;
        setItems(list);
      })
      .catch(() => {});
  };
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items.slice(0, 6);
    return items.filter((i) => i.label.toLowerCase().includes(t)).slice(0, 8);
  }, [q, items]);
  useEffect(() => {
    const out = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", out);
    return () => document.removeEventListener("mousedown", out);
  }, []);
  return (
    <div ref={ref} className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
      <input
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          loadAll();
        }}
        onFocus={() => {
          setOpen(true);
          loadAll();
        }}
        aria-label="Search cars, brands and tools"
        placeholder="Search cars, brands, tools"
        className="w-full rounded-full border border-white/15 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-ink-300 focus:border-lime-400 focus:bg-white/15"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl bg-white p-2 text-ink-900 shadow-lift"
          >
            {!q && <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-400">Trending now</p>}
            {results.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                onClick={() => {
                  setOpen(false);
                  setQ("");
                  onDone?.();
                }}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-ink-100"
              >
                <span className="font-semibold">{r.label}</span>
                <span className="shrink-0 text-xs text-ink-500">{r.meta}</span>
              </Link>
            ))}
            {results.length === 0 && <p className="px-3 py-4 text-sm text-ink-500">No match yet. Try a brand or a model name.</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header({ searchItems, nav }) {
  const pathname = usePathname();
  const { city, openCity, openLogin, shortlist } = useApp();
  const [active, setActive] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [expanded, setExpanded] = useState("New Cars");
  const [routeKey, setRouteKey] = useState(pathname);
  const closeTimer = useRef(null);

  if (routeKey !== pathname) {
    setRouteKey(pathname);
    setActive(null);
    setDrawer(false);
    setMobileSearch(false);
  }

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const enter = (label) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActive(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setActive(null), 140);
  };
  const bottom = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/new-cars", label: "New", Icon: CarFront },
    { href: "/compare-cars", label: "Compare", Icon: Scale },
    { href: "/news", label: "News", Icon: Newspaper },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-ink-950 text-white" onMouseLeave={leave}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:gap-5 lg:px-6">
          <Logo />
          <nav aria-label="Main navigation" className="ml-2 hidden items-center lg:flex">
            {nav.map((tab) => (
              <div key={tab.label} className="relative" onMouseEnter={() => (tab.groups.length ? enter(tab.label) : setActive(null))}>
                <Link
                  href={tab.href}
                  aria-haspopup={tab.groups.length ? "true" : undefined}
                  aria-expanded={tab.groups.length ? active === tab.label : undefined}
                  onFocus={() => (tab.groups.length ? enter(tab.label) : setActive(null))}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition ${active === tab.label ? "bg-white/10 text-lime-400" : "text-ink-200 hover:text-white"}`}
                >
                  {tab.label}
                  {tab.groups.length > 0 && <ChevronDown className={`size-3.5 transition ${active === tab.label ? "rotate-180" : ""}`} />}
                </Link>
                <AnimatePresence>
                  {active === tab.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, x: tab.groups.length > 4 ? "-50%" : 0 }}
                      animate={{ opacity: 1, y: 0, x: tab.groups.length > 4 ? "-50%" : 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className={`absolute top-full z-50 pt-3 ${tab.groups.length > 4 ? "left-1/2" : "left-0"}`}
                    >
                      <div className="flex w-max gap-7 rounded-2xl bg-white p-5 text-ink-900 shadow-lift">
                        {tab.groups.map((g) => (
                          <div key={g.title} className="w-max">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-400">{g.title}</p>
                            <ul className="mt-2">
                              {g.links.map((l) => (
                                <li key={l.href + l.label}>
                                  <Link
                                    href={l.href}
                                    onClick={() => setActive(null)}
                                    className="-mx-2 block whitespace-nowrap rounded-lg px-2 py-1.5 text-sm font-semibold transition hover:bg-lime-300/60"
                                  >
                                    {l.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
          <div className="ml-auto hidden w-full max-w-64 lg:block xl:max-w-80">
            <SearchBox items={searchItems} />
          </div>
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <button onClick={() => setMobileSearch((v) => !v)} aria-label="Open search" className="rounded-full p-2.5 hover:bg-white/10 lg:hidden">
              <Search className="size-5" />
            </button>
            <button onClick={openCity} className="hidden items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-ink-200 hover:bg-white/10 sm:flex">
              <MapPin className="size-4 text-lime-400" />
              {city}
            </button>
            <Link href="/shortlist" aria-label={`Your shortlist, ${shortlist.length} cars saved`} className="relative rounded-full p-2.5 hover:bg-white/10">
              <Heart className="size-5" />
              {shortlist.length > 0 && (
                <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-lime-400 text-[10px] font-extrabold text-ink-950">{shortlist.length}</span>
              )}
            </Link>
            <button
              onClick={openLogin}
              className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-950 transition hover:bg-lime-400 sm:flex"
            >
              <User className="size-4" />
              Sign in
            </button>
            <button onClick={() => setDrawer(true)} aria-label="Open navigation menu" className="rounded-full p-2.5 hover:bg-white/10 lg:hidden">
              <Menu className="size-6" />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileSearch && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-visible px-4 pb-3 lg:hidden">
              <SearchBox items={searchItems} autoFocus onDone={() => setMobileSearch(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-70 bg-ink-950/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)}>
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white"
            >
              <div className="flex items-center justify-between bg-ink-950 px-4 py-3">
                <button
                  onClick={() => {
                    setDrawer(false);
                    openCity();
                  }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white"
                >
                  <MapPin className="size-4 text-lime-400" />
                  {city}
                </button>
                <button onClick={() => setDrawer(false)} aria-label="Close navigation menu" className="rounded-full p-2 text-white hover:bg-white/10">
                  <X className="size-5" />
                </button>
              </div>
              <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-2 py-2">
                {nav.map((tab) => (
                  <div key={tab.label} className="border-b border-ink-100">
                    {tab.groups.length === 0 ? (
                      <Link href={tab.href} className="block px-3 py-4 font-bold">
                        {tab.label}
                      </Link>
                    ) : (
                      <>
                        <button
                          onClick={() => setExpanded(expanded === tab.label ? null : tab.label)}
                          aria-expanded={expanded === tab.label}
                          className="flex w-full items-center justify-between px-3 py-4 text-left font-bold"
                        >
                          {tab.label}
                          <ChevronDown className={`size-4 transition ${expanded === tab.label ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {expanded === tab.label && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="space-y-4 px-3 pb-4">
                                {tab.groups.map((g) => (
                                  <div key={g.title}>
                                    <p className="text-xs font-bold uppercase tracking-widest text-ink-400">{g.title}</p>
                                    <ul className="mt-1">
                                      {g.links.map((l) => (
                                        <li key={l.href + l.label}>
                                          <Link href={l.href} className="block py-2 text-sm font-medium text-ink-700">
                                            {l.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                ))}
              </nav>
              <div className="p-4">
                <button
                  onClick={() => {
                    setDrawer(false);
                    openLogin();
                  }}
                  className="w-full rounded-xl bg-ink-900 py-3 font-bold text-white"
                >
                  Sign in
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-ink-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {bottom.map(({ href, label, Icon }) => {
          const on = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? "text-ink-950" : "text-ink-500"}`}>
              <span className={`grid h-7 w-11 place-items-center rounded-full transition ${on ? "bg-lime-400" : ""}`}>
                <Icon className="size-4.5" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

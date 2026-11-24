"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, MapPin, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CityPicker } from "./city-picker";

const Ctx = createContext(null);
export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
};

function Modal({ onClose, children, label }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-80 flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:max-w-md sm:rounded-3xl sm:p-8"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button aria-label="Close dialog" onClick={onClose} className="absolute right-4 top-4 rounded-full bg-ink-100 p-2 hover:bg-ink-200">
          <X className="size-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

const inputCls = "mt-1.5 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink-900 focus:ring-2 focus:ring-lime-400";

function LeadFlow({ ctx, city, siteName, onClose }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [consent, setConsent] = useState(false);
  const valid = name.trim().length > 1 && /^[6-9]\d{9}$/.test(mobile) && consent;
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-lime-700">{ctx.intent}</p>
      <p className="font-display mt-1 pr-8 text-2xl font-bold">{ctx.title}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-ink-500">
        <MapPin className="size-3.5" /> Showing partners in {city}
      </p>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-lime-400" : "bg-ink-100"}`} />
        ))}
      </div>
      {step === 1 && (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) setStep(2);
          }}
        >
          <label className="block text-sm font-semibold">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputCls} placeholder="Full name" />
          </label>
          <label className="block text-sm font-semibold">
            Mobile number
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              autoComplete="tel-national"
              className={inputCls}
              placeholder="10-digit mobile"
            />
          </label>
          <label className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-lime-700" />I agree to be contacted by the selected dealer about
            this enquiry. You can withdraw this consent at any time.
          </label>
          <button disabled={!valid} className="w-full rounded-xl bg-ink-900 py-3.5 font-bold text-white transition hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40">
            Send verification code
          </button>
          <p className="text-center text-xs text-ink-400">This form is not connected yet: nothing you type here is stored or sent.</p>
        </form>
      )}
      {step === 2 && (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (otp.length === 4) setStep(3);
          }}
        >
          <label className="block text-sm font-semibold">
            Enter the 4-digit code sent to {mobile}
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoComplete="one-time-code"
              className={`${inputCls} text-center text-xl tracking-[0.6em]`}
              placeholder="0000"
            />
          </label>
          <button disabled={otp.length !== 4} className="w-full rounded-xl bg-ink-900 py-3.5 font-bold text-white transition hover:bg-ink-700 disabled:opacity-40">
            Verify and continue
          </button>
          <p className="text-center text-xs text-ink-400">Sign-in is not live yet: any four digits will work.</p>
        </form>
      )}
      {step === 3 && (
        <div className="mt-6 text-center">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }}>
            <CheckCircle2 className="mx-auto size-14 text-lime-700" />
          </motion.div>
          <p className="font-display mt-3 text-xl font-bold">You are all set, {name.split(" ")[0]}</p>
          <p className="mt-2 text-sm text-ink-500">
            In the live product, a {siteName} partner in {city} would call you with the details you asked for.
          </p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl bg-lime-400 py-3 font-bold text-ink-950 hover:bg-lime-300">
            Keep exploring cars
          </button>
        </div>
      )}
    </>
  );
}

function LoginFlow({ siteName, onClose }) {
  const [mobile, setMobile] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  return (
    <>
      <p className="font-display pr-8 text-2xl font-bold">Sign in to {siteName}</p>
      <p className="mt-1 text-sm text-ink-500">Save shortlists, follow price drops and keep track of your enquiries.</p>
      {!sent ? (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (/^[6-9]\d{9}$/.test(mobile)) setSent(true);
          }}
        >
          <label className="block text-sm font-semibold">
            Mobile number
            <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" className={inputCls} placeholder="10-digit mobile" />
          </label>
          <button disabled={!/^[6-9]\d{9}$/.test(mobile)} className="w-full rounded-xl bg-ink-900 py-3.5 font-bold text-white disabled:opacity-40">
            Send code
          </button>
        </form>
      ) : (
        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (otp.length === 4) onClose();
          }}
        >
          <label className="block text-sm font-semibold">
            Enter the 4-digit code
            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" className={`${inputCls} text-center text-xl tracking-[0.6em]`} />
          </label>
          <button disabled={otp.length !== 4} className="w-full rounded-xl bg-ink-900 py-3.5 font-bold text-white disabled:opacity-40">
            Sign in
          </button>
        </form>
      )}
      <p className="mt-3 text-center text-xs text-ink-400">Sign-in is not live yet: no account is created.</p>
    </>
  );
}

/**
 * The chosen city as the price widgets need it. A city with exact prices is the site's own city record; any other
 * Indian city borrows the road-tax and insurance rates of a city in the same state (else typical rates), and is
 * marked exact: false so the widgets can say the price is an estimate.
 */
export function cityInfoFor(pick, cities) {
  const own = cities.find((c) => c.name === pick?.name || (pick?.slug && c.slug === pick.slug));
  if (own) return { ...own, exact: true };
  if (!pick?.name) return { ...cities[0], exact: true };
  const sameState = cities.find((c) => c.state === pick.state);
  return { slug: pick.slug ?? "", name: pick.name, state: pick.state ?? "", rto: sameState?.rto ?? 0.1, ins: sameState?.ins ?? 0.05, taxRules: sameState?.taxRules ?? null, registrationFeeRs: sameState?.registrationFeeRs ?? null, exact: false, rateFrom: sameState?.name ?? null };
}

const CAR_PAGE = /^\/cars\/([^/]+)\/([^/]+)(?:\/[^/]+)?\/?$/;

export function AppProvider({ children, cities, siteName }) {
  const [pick, setPick] = useState({ name: "New Delhi" });
  const city = pick.name;
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const [shortlist, setShortlist] = useState([]);
  const [lead, setLead] = useState(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    try {
      const c = localStorage.getItem("wheelora-city");
      const s = localStorage.getItem("wheelora-shortlist");
      // Saved as JSON ({ name, state, slug }); older visits saved just the name.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser storage is only readable after hydration
      if (c) setPick(c.startsWith("{") ? JSON.parse(c) : { name: c });
      if (s) setShortlist(JSON.parse(s));
    } catch {
      /* storage may be unavailable */
    }
  }, []);

  const setCity = useCallback((c) => {
    const next = typeof c === "string" ? { name: c } : { name: c.name, state: c.state, slug: c.slug };
    setPick(next);
    try {
      localStorage.setItem("wheelora-city", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const cityInfo = useMemo(() => cityInfoFor(pick, cities), [pick, cities]);

  const showToast = useCallback((t) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 7000);
  }, []);

  /** After a city is chosen: on a car page with exact prices go to that city's price page; always say what changed. */
  const chooseCity = useCallback(
    (c) => {
      setCity(c);
      setCityOpen(false);
      const info = cityInfoFor(c, cities);
      const car = pathname?.match(CAR_PAGE);
      if (info.exact && car) {
        router.push(`/cars/${car[1]}/${car[2]}/price-in-${info.slug}`);
        showToast({ title: `Showing prices for ${info.name}`, text: `This page now shows the exact on-road price in ${info.name}. EMI and price tools on every car use ${info.name} too.` });
      } else if (info.exact) {
        showToast({ title: `City set to ${info.name}`, text: `Open any car to see its exact on-road price, EMI and price breakup in ${info.name}.` });
      } else {
        showToast({
          title: `City set to ${info.name}`,
          text: `Exact on-road prices for ${info.name} are not available yet, so prices are estimated with ${info.rateFrom ? `the road tax of ${info.state} (as in ${info.rateFrom})` : "typical road tax (about 10%) and insurance (about 5%)"}.`,
        });
      }
    },
    [cities, pathname, router, setCity, showToast],
  );

  const toggleShortlist = useCallback((key) => {
    setShortlist((cur) => {
      const next = cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key];
      try {
        localStorage.setItem("wheelora-shortlist", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      city,
      cityInfo,
      cities,
      siteName,
      setCity,
      shortlist,
      toggleShortlist,
      openLead: (title, intent = "Get the best offer") => setLead({ title, intent }),
      openCity: () => setCityOpen(true),
      openLogin: () => setLoginOpen(true),
    }),
    [city, cityInfo, cities, siteName, setCity, shortlist, toggleShortlist],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {lead && (
          <Modal key="lead" label={lead.title} onClose={() => setLead(null)}>
            <LeadFlow ctx={lead} city={city} siteName={siteName} onClose={() => setLead(null)} />
          </Modal>
        )}
        {loginOpen && (
          <Modal key="login" label="Sign in" onClose={() => setLoginOpen(false)}>
            <LoginFlow siteName={siteName} onClose={() => setLoginOpen(false)} />
          </Modal>
        )}
        {cityOpen && (
          <Modal key="city" label="Choose your city" onClose={() => setCityOpen(false)}>
            <CityPicker cities={cities} current={city} onPick={chooseCity} />
          </Modal>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.title}
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed inset-x-3 bottom-20 z-90 mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-ink-950 p-4 text-white shadow-2xl sm:bottom-6"
          >
            <MapPin className="mt-0.5 size-5 shrink-0 text-lime-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{toast.title}</p>
              <p className="mt-0.5 text-sm text-ink-300">{toast.text}</p>
            </div>
            <button onClick={() => setToast(null)} aria-label="Close message" className="rounded-lg p-1 text-ink-300 transition hover:text-white">
              <X className="size-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

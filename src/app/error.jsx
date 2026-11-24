"use client";

import Link from "next/link";

export default function ErrorPage({ reset }) {
  return (
    <div className="mx-auto grid min-h-[60dvh] max-w-xl place-content-center px-4 py-16 text-center">
      <h1 className="text-3xl font-extrabold">Something went wrong on our side</h1>
      <p className="mt-2 text-ink-500">Please try again. If it keeps happening, head back to the home page.</p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={reset} className="rounded-xl bg-ink-950 px-5 py-3 text-sm font-bold text-white">
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-ink-900 px-5 py-3 text-sm font-bold">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}

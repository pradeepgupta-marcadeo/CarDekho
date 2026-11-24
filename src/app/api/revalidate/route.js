import { revalidateTag } from "next/cache";

// The CMS calls this after every save. Pages using the "cms" tag are marked stale:
// the next visit still gets the cached page instantly and triggers a fresh render
// in the background, so the visit after that shows the change.
export async function POST(req) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false, error: "Not allowed" }, { status: 401 });
  }
  revalidateTag("cms", "max");
  return Response.json({ ok: true, at: new Date().toISOString() });
}

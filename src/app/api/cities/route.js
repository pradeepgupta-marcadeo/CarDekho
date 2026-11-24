// Every Indian city the city picker can search ([{ n: name, s: state, g: slug }]), read from the CMS.
// Served from this site's own address so the browser needs no cross-site request. Empty list if the CMS is down:
// the picker then still offers the cities the site has exact prices for.
const CMS = (process.env.CMS_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export async function GET() {
  try {
    const res = await fetch(`${CMS}/api/public/cities`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`CMS answered ${res.status}`);
    return new Response(await res.text(), { headers: { "content-type": "application/json", "cache-control": "public, max-age=3600" } });
  } catch {
    return Response.json([], { headers: { "cache-control": "no-store" } });
  }
}

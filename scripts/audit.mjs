// Crawls the running site from its sitemap and checks pages against WEBSITE_GUARDRAILS.md.
// Usage: node scripts/audit.mjs http://localhost:3100
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const siteUrlInSitemap = /<loc>(.*?)<\/loc>/g;

const text = async (u) => { const r = await fetch(u, { redirect: "manual" }); return { status: r.status, body: await r.text(), location: r.headers.get("location") }; };
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/₹/g, "₹");

const sm = await text(`${base}/sitemap.xml`);
const urls = [...sm.body.matchAll(siteUrlInSitemap)].map((m) => new URL(m[1]).pathname);
const robots = await text(`${base}/robots.txt`);
console.log(`Sitemap URLs: ${urls.length}; robots.txt ${robots.status}, references sitemap: ${/Sitemap:/i.test(robots.body)}`);

const issues = {}; const add = (k, p, d = "") => { (issues[k] ??= []).push(d ? `${p} (${d})` : p); };
const titles = new Map(), descs = new Map(), bodies = new Map(), inbound = new Map(), internal = new Set(), images = new Set();
let done = 0;

async function check(path) {
  const { status, body, location } = await text(base + path);
  if (status !== 200) return add(`status-${status}`, path, location ?? "");
  const html = body;
  const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? "");
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => decode(m[1].replace(/<[^>]+>/g, "")).trim());
  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
  const main = html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html;
  const words = main.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

  if (!title) add("title-missing", path); else { if (title.length < 30 || title.length > 60) add("title-length", path, `${title.length}: ${title}`); (titles.get(title) ?? titles.set(title, []).get(title)).push(path); }
  if (!desc) add("desc-missing", path); else { if (desc.length < 120 || desc.length > 160) add("desc-length", path, `${desc.length}: ${desc}`); (descs.get(desc) ?? descs.set(desc, []).get(desc)).push(path); }
  if (h1s.length !== 1) add("h1-count", path, String(h1s.length));
  if (h1s[0] && h1s[0] === title) add("title-equals-h1", path);
  if (canon.length !== 1) add("canonical-count", path, String(canon.length));
  if (words < 300) add("thin-under-300-words", path, String(words));
  if (html.length > 2_000_000) add("html-over-2mb", path, String(html.length));
  if (!/<html[^>]* lang="/.test(html)) add("html-lang", path);
  if (!/name="viewport"/.test(html)) add("viewport", path);
  if (/noindex/i.test(html.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? "")) add("noindex-in-sitemap", path);

  const heads = [...main.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  for (let i = 1; i < heads.length; i++) if (heads[i] - heads[i - 1] > 1) { add("heading-skip", path, `h${heads[i - 1]} to h${heads[i]}`); break; }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\salt="/.test(tag)) add("img-no-alt", path, tag.slice(0, 80));
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) add("img-no-dimensions", path, tag.slice(0, 80));
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1]; if (src) images.add(decode(src));
  }

  const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  if (links.length > 300) add("links-over-300", path, String(links.length));
  for (const [, attrs, inner] of links) {
    const href = decode(attrs.match(/href="([^"]*)"/)?.[1] ?? "");
    const label = inner.replace(/<[^>]+>/g, "").trim() || attrs.match(/aria-label="([^"]*)"/)?.[1] || (inner.match(/alt="([^"]+)"/)?.[1] ?? "");
    if (!label) add("empty-anchor", path, href);
    if (/^(click here|read more|here)$/i.test(label)) add("generic-anchor", path, label);
    if (href.startsWith("http://")) add("http-link", path, href);
    if (/nofollow/.test(attrs) && href.startsWith("/")) add("nofollow-internal", path, href);
    if (href.startsWith("/") && !href.startsWith("//")) {
      const clean = href.split("#")[0].split("?")[0];
      internal.add(clean);
      if (clean !== path) (inbound.get(clean) ?? inbound.set(clean, new Set()).get(clean)).add(path);
    }
  }
  bodies.set(path, main);
}

const pool = 8; let i = 0;
await Promise.all(Array.from({ length: pool }, async () => { while (i < urls.length) { const p = urls[i++]; await check(p); done++; if (done % 200 === 0) console.log(`  checked ${done}/${urls.length}`); } }));

for (const [t, ps] of titles) if (ps.length > 1) add("duplicate-title", ps.join(", "), t);
for (const [d, ps] of descs) if (ps.length > 1) add("duplicate-desc", ps.join(", "), d.slice(0, 50));

for (const l of internal) { const r = await fetch(base + l, { redirect: "manual" }); if (r.status !== 200) add(`internal-link-${r.status}`, l); }
for (const src of images) { if (/^https?:/.test(src)) continue; const r = await fetch(new URL(src, base)); if (!r.ok) add(`image-${r.status}`, src); }
for (const u of urls) if (u !== "/" && !(inbound.get(u)?.size >= 1)) add("orphan-no-inbound", u);

// Click depth from the home page.
const depth = new Map([["/", 0]]); let frontier = ["/"];
const linksOf = new Map();
for (const [to, froms] of inbound) for (const f of froms) (linksOf.get(f) ?? linksOf.set(f, []).get(f)).push(to);
while (frontier.length) { const next = []; for (const p of frontier) for (const n of linksOf.get(p) ?? []) if (!depth.has(n)) { depth.set(n, depth.get(p) + 1); next.push(n); } frontier = next; }
for (const u of urls) if ((depth.get(u) ?? 99) > 3) add("deeper-than-3-clicks", u, String(depth.get(u) ?? "unreachable"));

console.log(`Checked ${urls.length} pages, ${internal.size} internal link targets, ${images.size} images.`);
const keys = Object.keys(issues).sort();
if (!keys.length) console.log("No issues found.");
for (const k of keys) { console.log(`\n${k}: ${issues[k].length}`); issues[k].slice(0, +(process.argv[3] ?? 8)).forEach((x) => console.log(`  ${x}`)); }

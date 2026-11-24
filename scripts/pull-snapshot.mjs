// Saves the CMS's current content as src/data/snapshot.json. The website reads
// the CMS live, and falls back to this file whenever the CMS cannot be reached,
// so a build never fails and pages never go empty. Runs before every build.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const envFile = new URL("../.env.local", import.meta.url);
if (existsSync(envFile)) process.loadEnvFile(envFile);
const cms = (process.env.CMS_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const out = new URL("../src/data/snapshot.json", import.meta.url);

try {
  const res = await fetch(`${cms}/api/public/snapshot`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`CMS answered ${res.status}`);
  const snap = await res.json();
  writeFileSync(out, JSON.stringify(snap));
  console.log(`Saved CMS snapshot ${snap.version}: ${snap.cars.length} cars, ${snap.articles.length} articles.`);
} catch (err) {
  if (!existsSync(out)) throw new Error(`No CMS at ${cms} and no saved snapshot: ${err.message}`);
  const old = JSON.parse(readFileSync(out, "utf8"));
  console.warn(`CMS not reachable (${err.message}); building from the saved snapshot ${old.version}.`);
}

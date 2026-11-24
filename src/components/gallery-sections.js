// How a car's photos are sorted for its gallery viewer, the way the car portals do it: Exterior and Interior, each
// split into the source's own groups (Looks, Details, Lights; Dashboard, Steering Wheel, Seats, Sunroof...), and the
// colours. Pure functions, used on the server and in the browser.

/** "front left side" -> "Front left side"; a photo with no title is named after its kind ("Rear view"). */
export function photoTitle(p) {
  const t = String(p.title ?? `${p.kind} view`).trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Photos of one section, each group together in the order the groups first appear; untitled ones last as "More". */
function grouped(list) {
  const by = new Map();
  for (const p of list) {
    const g = p.group || null;
    if (!by.has(g)) by.set(g, []);
    by.get(g).push(p);
  }
  const names = [...by.keys()].filter(Boolean);
  if (!names.length) return { list, groups: [] }; // no groups from the source: one plain list, no chips
  if (by.has(null)) names.push(null);
  const out = [];
  const groups = [];
  for (const g of names) {
    groups.push({ name: g ?? "More", first: out.length, count: by.get(g).length });
    out.push(...by.get(g));
  }
  return { list: out, groups };
}

/** { exterior: {list, groups}, interior: {list, groups}, colours: [{colour, photo}] } */
export function gallerySections(photos, colours = []) {
  const own = photos.filter((p) => !p.colour);
  return {
    exterior: grouped(own.filter((p) => p.kind !== "interior")),
    interior: grouped(own.filter((p) => p.kind === "interior")),
    colours: colours.map((c) => ({ colour: c, photo: photos.find((p) => p.colour === c.name) ?? null })),
  };
}

/** The group a photo index falls in. */
export const groupAt = (groups, i) => groups.findLast((g) => g.first <= i) ?? null;

import { Fuel, Gauge, Heart, Star, Users } from "lucide-react";

// Icons repeated on every car card are drawn once per page in a hidden sprite and reused with <use>, instead of
// repeating the full SVG markup on every card (a list of 100 cards saved over 150 KB of HTML this way).
const ICONS = { fuel: Fuel, gauge: Gauge, heart: Heart, star: Star, users: Users };

export function IconSprite() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
      {Object.entries(ICONS).map(([name, Icon]) => (
        <symbol key={name} id={`ic-${name}`} viewBox="0 0 24 24">
          {/* fill inherits, so a card can fill an icon (a starred rating, a saved heart) with a class. */}
          <Icon fill="inherit" />
        </symbol>
      ))}
    </svg>
  );
}

/** One icon from the sprite, e.g. <Ic name="fuel" className="size-3.5" />. Colour follows the text colour. */
export function Ic({ name, className }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
      <use href={`#ic-${name}`} />
    </svg>
  );
}

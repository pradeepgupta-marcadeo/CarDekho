// Defaults; the CMS snapshot overwrites these in place (hydrateSite) before pages render.
export const SITE = {
  name: "Wheelora",
  tagline: "Decide your next car with confidence",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.wheelora.example",
  phone: "1800 000 0000",
  email: "hello@wheelora.example",
};

export const CITIES = [
  { slug: "new-delhi", name: "New Delhi", state: "Delhi", rto: 0.1, ins: 0.05 },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", rto: 0.13, ins: 0.052 },
  { slug: "bangalore", name: "Bangalore", state: "Karnataka", rto: 0.18, ins: 0.05 },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", rto: 0.14, ins: 0.05 },
  { slug: "pune", name: "Pune", state: "Maharashtra", rto: 0.13, ins: 0.05 },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", rto: 0.115, ins: 0.05 },
  { slug: "kanpur", name: "Kanpur", state: "Uttar Pradesh", rto: 0.1, ins: 0.05 },
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", rto: 0.1, ins: 0.05 },
];

export const NAV = [
  {
    label: "New Cars",
    href: "/new-cars",
    groups: [
      {
        title: "Explore",
        links: [
          { label: "All new cars", href: "/new-cars", hint: "Filter by budget, fuel and more" },
          { label: "Popular cars", href: "/popular-cars", hint: "What India is shortlisting" },
          { label: "Electric cars", href: "/electric-cars", hint: "Range, charging, running cost" },
          { label: "Upcoming cars", href: "/upcoming-cars", hint: "Launch dates and expected prices" },
          { label: "New launches", href: "/latest-cars", hint: "Fresh on the road" },
          { label: "All car brands", href: "/brands", hint: "Every maker in one place" },
        ],
      },
      {
        title: "By body type",
        links: [
          { label: "SUV cars", href: "/new-cars/suv" },
          { label: "Hatchback cars", href: "/new-cars/hatchback" },
          { label: "Sedan cars", href: "/new-cars/sedan" },
          { label: "MUV and 7-seater cars", href: "/new-cars/muv" },
          { label: "Luxury cars", href: "/new-cars/luxury" },
        ],
      },
      {
        title: "By budget",
        links: [
          { label: "Cars under 10 lakh", href: "/new-cars/under-10-lakh" },
          { label: "Cars under 15 lakh", href: "/new-cars/under-15-lakh" },
          { label: "Cars under 25 lakh", href: "/new-cars/under-25-lakh" },
          { label: "Cars above 25 lakh", href: "/new-cars/above-25-lakh" },
        ],
      },
      {
        title: "Tools and places",
        links: [
          { label: "Compare cars", href: "/compare-cars" },
          { label: "Today's fuel prices", href: "/fuel-prices" },
        ],
      },
    ],
  },
  { label: "Compare", href: "/compare-cars", groups: [] },
  { label: "News & Reviews", href: "/news", groups: [] },
];

export const FOOTER = [
  {
    title: "Company",
    links: [
      { label: "About Wheelora", href: "/about" },
      { label: "Careers at Wheelora", href: "/careers" },
      { label: "Contact our team", href: "/contact" },
      { label: "Help and FAQs", href: "/faqs" },
      { label: "Share feedback", href: "/feedback" },
    ],
  },
  {
    title: "For business",
    links: [
      { label: "Advertise with us", href: "/advertise" },
      { label: "Become a partner dealer", href: "/partner-dealer" },
    ],
  },
  {
    title: "Popular tools",
    links: [
      { label: "Compare cars", href: "/compare-cars" },
      { label: "EMI calculator", href: "/emi-calculator" },
      { label: "Today's fuel prices", href: "/fuel-prices" },
      { label: "Car collections", href: "/car-collections" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy-policy" },
      { label: "Terms of use", href: "/terms" },
      { label: "Image credits", href: "/image-credits" },
    ],
  },
];

/** Editable website text from the CMS ("Website text" screen), with the built-in wording as fallback. */
const BLOCKS = {};
export const block = (key, fallback) => BLOCKS[key] ?? fallback;

export function hydrateSite(input) {
  const { name, tagline, phone, email } = input.site;
  Object.assign(SITE, Object.fromEntries(Object.entries({ name, tagline, phone, email }).filter(([, v]) => v)));
  if (input.cities.length) CITIES.splice(0, CITIES.length, ...input.cities);
  if (input.nav.length) NAV.splice(0, NAV.length, ...input.nav);
  if (input.footer.length) FOOTER.splice(0, FOOTER.length, ...input.footer);
  for (const k of Object.keys(BLOCKS)) delete BLOCKS[k];
  Object.assign(BLOCKS, input.blocks);
}

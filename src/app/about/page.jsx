import { SITE } from "@/data/site";
import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "About Wheelora: a calmer way to buy a car",
    description: "Learn what Wheelora is, the problems it wants to solve for car buyers in India and the principles behind it, including open pricing and control over your personal data.",
    path: "/about",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="About"
      title="Why we are building Wheelora"
      intro="Buying a car is a big decision. We think that it should feel clear and calm, rather than confusing and pushy."
      links={[
        { label: "Contact our team", href: "/contact" },
        { label: "Careers at Wheelora", href: "/careers" },
        { label: "Explore new cars", href: "/new-cars" },
      ]}
      sections={[
        {
          h: "The problem we want to solve",
          p: [
            `Most people buy only a handful of cars in their lifetime, and each one involves a lot of money and a surprising amount of confusing information. Prices vary by city, discounts are hard to compare, and it can feel as if you must hand over your phone number just to learn a basic fact. ${SITE.name} is a concept for doing that better.`,
            "We believe research should be open and pressure-free. You should be able to see a realistic on-road price, understand the real strengths and weaknesses of a car, and compare it fairly with its rivals, all before speaking to a salesperson.",
          ],
        },
        {
          h: "The principles behind the design",
          p: [
            "Numbers come first. On-road prices are visible without a form, and each charge is broken down so you can see where your money goes. Downsides are shown alongside the strengths, because a review that only praises a car is not much use to anyone trying to make a decision.",
            "You stay in control of your data. We ask for a phone number only when you actively request a call or an offer, consent boxes are never ticked for you, and you can see who your details would go to. Paid placements, when they exist, should always be clearly labelled as such.",
          ],
        },
        {
          h: "Where this project stands today",
          p: [
            `Wheelora helps you research new cars in India: prices, variants, specifications, photos and on-road costs in one place. Prices, specifications and photos are updated regularly from published listings, so always confirm the final details with an authorised dealer. Forms do not store anything, and no cars are actually being sold through this site.`,
            "Car names are used only to identify the models that are being discussed, and they belong to their respective makers. We have no affiliation with them. Car photos remain the property of their owners, as explained on our image credits page.",
          ],
        },
      ]}
    />
  );
}

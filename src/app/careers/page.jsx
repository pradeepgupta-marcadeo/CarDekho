import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

const roles = [
  { t: "Frontend engineer", l: "Remote, India", d: "Build fast and accessible pages with Next.js and careful attention to motion." },
  { t: "Automotive data analyst", l: "Jaipur", d: "Keep specifications and prices accurate, with a clear source behind every value." },
  { t: "Car reviewer and writer", l: "Delhi NCR", d: "Drive cars, write honestly and explain trade-offs in simple language." },
  { t: "Dealer partnerships lead", l: "Lucknow", d: "Build relationships with local dealers, and make every lead genuinely useful." },
];

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Careers at Wheelora: open roles",
    description: "Explore the kinds of roles at Wheelora across engineering, automotive data, editorial and dealer partnerships, and see how we like to work, what we value and how to apply.",
    path: "/careers",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Careers"
      title="Help people choose cars with confidence"
      intro="We care about clear thinking, honest content and doing simple things very well. These are the kinds of roles we hire for."
      links={[
        { label: "About Wheelora", href: "/about" },
        { label: "Contact our team", href: "/contact" },
      ]}
      sections={[
        {
          h: "How we like to work",
          p: [
            "We prefer small teams that own a problem from start to finish. Writers talk to engineers, data analysts sit in on design reviews, and anyone can question a decision if a user might be misled by it. We would rather ship one honest and useful feature than three which just look impressive in a demo.",
            "Accuracy is a shared responsibility here. If a price or a specification is on the site, somebody should be able to say where it came from and when it was last checked. That habit shapes how we build tools, how we write stories and how we work with our partners every day.",
          ],
        },
        {
          h: "What you can expect from us",
          p: [
            "We try to give people clear goals, time to think and honest feedback. We hold short meetings, write things down and try to make decisions in the open. Because the team is still young, your work will be visible right away, and you will have real influence over how the product develops.",
            "There are no open vacancies right now, but you are welcome to write to us about any of these roles. Applications are not being collected, and no personal details are stored through this site. The page shows how a careers section would appear in the live product.",
          ],
        },
      ]}
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {roles.map((r) => (
          <li key={r.t} className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-lg font-bold">{r.t}</h2>
            <p className="text-xs font-semibold text-lime-700">{r.l}</p>
            <p className="mt-2 text-sm text-ink-700">{r.d}</p>
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}

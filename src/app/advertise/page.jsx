import { SimpleForm } from "@/components/tools";
import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Advertise with Wheelora: reach car buyers",
    description: "Reach people actively researching cars through clearly labelled ads and sponsored content on Wheelora. See the available formats and the principles behind our advertising.",
    path: "/advertise",
  });
}

export default async function Page() {
  await ready();
  const formats = [
    { t: "Launch spotlights", d: "Feature a new model on the home page and in related categories." },
    { t: "Sponsored comparisons", d: "Appear beside the cars that buyers are already comparing." },
    { t: "Branded stories", d: "Tell a longer story with content that is clearly labelled as sponsored." },
  ];
  return (
    <InfoPage
      crumb="Advertise"
      title="Reach buyers while they are deciding"
      intro="Clearly labelled formats that respect the reader and put your car in front of people who are shopping."
      links={[
        { label: "Become a partner dealer", href: "/partner-dealer" },
        { label: "Contact our team", href: "/contact" },
        { label: "About Wheelora", href: "/about" },
      ]}
      sections={[
        {
          h: "Our advertising principles",
          p: [
            "Trust is what makes a research site valuable, so paid content must always be easy to recognise. Sponsored placements carry a visible label, editorial reviews are never for sale, and advertising does not change a car's rating or its position within any editorial list. We believe readers respond better to advertising when they know exactly what it is.",
            "We also care about page speed. Heavy ad scripts slow down the experience for everyone, so formats are designed to load efficiently and to avoid shifting the page layout while somebody is reading. That approach protects the reader's experience, and it also helps your message be seen in a far better context.",
          ],
        },
        {
          h: "Working with us",
          p: [
            "Tell us about your launch or campaign, along with the timing, target cities and the audience you hope to reach. We would then suggest a suitable mix of formats and share what can realistically be measured, so that you can judge the results for yourself instead of having to rely on broad claims.",
            "These formats are still being planned, and no advertising space is on sale at the moment. No audience figures are claimed, since the site has no real traffic yet. The form below only demonstrates how an enquiry would work in the live product.",
          ],
        },
      ]}
    >
      <ul className="mb-6 grid gap-4 md:grid-cols-3">
        {formats.map((f) => (
          <li key={f.t} className="rounded-2xl bg-ink-950 p-5 text-white">
            <h2 className="text-lg font-bold text-lime-400">{f.t}</h2>
            <p className="mt-2 text-sm text-ink-200">{f.d}</p>
          </li>
        ))}
      </ul>
      <SimpleForm
        submitLabel="Send my enquiry"
        doneTitle="Thanks for your enquiry"
        fields={[
          { label: "Company name" },
          { label: "Work email", type: "email" },
          { label: "Campaign goal", options: ["New launch", "Brand awareness", "Lead generation", "Something else"] },
          { label: "Tell us about the campaign", textarea: true },
        ]}
      />
    </InfoPage>
  );
}

import { Faq } from "@/components/ui";
import { FAQS_HOME } from "@/data/content";
import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

const more = [
  {
    q: "Do I need an account to use the site?",
    a: "No. You can research, compare and calculate without signing in. An account would only help you keep your shortlist and enquiries across different devices.",
  },
  {
    q: "Why does the on-road price change with my city?",
    a: "Road tax and registration fees are set by each state, and insurance can vary too. That is why the same variant may cost a different amount in another city.",
  },
  {
    q: "Will dealers call me if I use the calculators?",
    a: "No. Calculators and price pages do not need your number. A dealer would contact you only if you submit an enquiry and give your consent.",
  },
  {
    q: "Can I save the cars that I like?",
    a: "Yes. Tap the heart on any car and it is added to your shortlist on this device, so that you can come back and compare your favourites whenever you are ready.",
  },
];

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Help and FAQs about using Wheelora",
    description: "Answers to common questions about using Wheelora, including on-road prices, comparing cars, your personal data and how dealers contact you, all written in simple language.",
    path: "/faqs",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Help and FAQs"
      title="Answers before you have to ask"
      intro="The questions people ask us the most about prices, comparing cars and their data."
      links={[
        { label: "Contact our team", href: "/contact" },
        { label: "Privacy policy", href: "/privacy-policy" },
        { label: "Compare cars", href: "/compare-cars" },
      ]}
      sections={[
        {
          h: "Could not find your answer?",
          p: [
            "Our guides go into far more detail than a short answer ever can. The tips section covers choosing a first car, picking a fuel type and looking after your car on Indian roads. Each guide is written in simple language, and each one links to the tools that can help.",
            "If you still need help, please reach out through our contact page with the model, variant and city that you are asking about, because that context lets us give a much more precise answer. Prices and specifications are updated regularly, but always confirm the final details with an authorised dealer.",
          ],
        },
      ]}
    >
      <Faq items={[...FAQS_HOME, ...more]} />
    </InfoPage>
  );
}

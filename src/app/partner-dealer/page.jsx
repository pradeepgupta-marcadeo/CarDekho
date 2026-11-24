import { SimpleForm } from "@/components/tools";
import { CITIES } from "@/data/site";
import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Become a partner dealer on Wheelora",
    description: "List your new car showroom on Wheelora and receive enquiries from verified buyers in your city, with clear consent records. See how the partner programme would work.",
    path: "/partner-dealer",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Partner dealers"
      title="Grow your dealership with better enquiries"
      intro="Enquiries from people who chose to contact you, with a clear record of their consent."
      links={[
        { label: "Advertise with us", href: "/advertise" },
      ]}
      sections={[
        {
          h: "Why partner with us",
          p: [
            "Quality matters more than volume. Each enquiry on the live product would come from a person who verified their mobile number and asked to hear from you by name, rather than from a broad list shared with many dealers at once. This makes for better conversations, and it gives you a clearer picture of what you are paying for.",
            "We also want buyers to arrive better prepared. Because they can see on-road prices, compare variants and read honest pros and cons beforehand, they tend to come with specific questions. Your sales team can then spend less time on the basics, and more time on a useful test drive and a fair deal.",
          ],
        },
        {
          h: "How onboarding would work",
          p: [
            "We would begin with a short call to understand your brands, your location and the kind of stock you hold. We would then verify your business details and showroom address, set up your profile and agree on simple, written terms for how enquiries are delivered and charged. Showrooms could then keep their offers and opening hours up to date themselves.",
            "The partner programme is still being planned, and pricing has not been set. No enquiries are being delivered at this stage, and the form on this page only demonstrates the experience. Dealers shown elsewhere on this site are fictional examples rather than real partners.",
            "We would welcome early conversations with dealers about what makes an enquiry truly useful.",
          ],
        },
      ]}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-xl font-bold">Register your interest</h2>
        <SimpleForm
          submitLabel="Register my dealership"
          doneTitle="Thanks for your interest"
          fields={[
            { label: "Dealership name" },
            { label: "Contact person" },
            { label: "City", options: CITIES.map((c) => c.name) },
            { label: "Brand you represent" },
            { label: "Mobile number", type: "tel" },
            { label: "Work email", type: "email" },
          ]}
        />
      </div>
    </InfoPage>
  );
}

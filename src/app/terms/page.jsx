import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Terms of use and site rules",
    description: "The terms for using Wheelora: information is for research only, nothing here is an offer to sell, and details should be checked with authorised dealers.",
    path: "/terms",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Terms of use"
      title="The terms for using this site"
      intro="These simple terms apply. Formal terms would be prepared with a lawyer before any public launch."
      links={[
        { label: "Privacy policy", href: "/privacy-policy" },
        { label: "Image credits", href: "/image-credits" },
      ]}
      sections={[
        {
          h: "Demonstration only",
          p: [
            "Wheelora is a car research website. Prices, specifications, fuel rates and other figures come from published listings and are updated regularly, but they can change or contain errors, and some articles and reviews are sample content. None of it should be relied upon to make a purchase or financial decision.",
            "Nothing on this site is an offer to sell a vehicle, provide a loan or arrange insurance. Calculators produce illustrative estimates using simplified formulas. Please confirm all information with an authorised dealer, a licensed lender or insurer, or the relevant authority before you act on it.",
          ],
        },
        {
          h: "Names, trademarks and images",
          p: [
            "Car makers' names and model names belong to their respective owners, and they are used here only to identify the vehicles under discussion. This site is not affiliated with, or endorsed by, any manufacturer, dealer or other automotive portal. Brand logos shown on this site are trademarks of their owners, and they appear only to identify each maker for this local demonstration.",
            "Car photos remain the property of their owners and are used only to identify the cars, as explained on our image credits page. Those licences continue to apply to the images, so anyone who wishes to reuse a photo should follow the terms given on its source page.",
          ],
        },
        {
          h: "Using this site",
          p: [
            "Please use this site for evaluating the design and experience. Do not enter sensitive personal information into its forms, even though they do not store anything. We may change or remove any part of the site at any time, as it is under active development and is provided as it stands, without any warranties.",
            "If you notice something on this site that seems wrong or misleading, please tell us through the contact page so that we can correct it.",
          ],
        },
      ]}
    />
  );
}

import { SimpleForm } from "@/components/tools";
import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Contact Wheelora: support and enquiries",
    description: "Get in touch with Wheelora for help with car research, dealers, partnerships or feedback. See how to reach us and what details will help us respond to you more quickly.",
    path: "/contact",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Contact"
      title="Talk to a real person"
      intro="Tell us what you need, and we will point you in the right direction."
      links={[
        { label: "Help and FAQs", href: "/faqs" },
        { label: "Become a partner dealer", href: "/partner-dealer" },
        { label: "Advertise with us", href: "/advertise" },
      ]}
      sections={[
        {
          h: "Getting a faster answer",
          p: [
            "The more specific your message, the quicker we can help. If your question is about a car, tell us the model, the variant and your city, since prices and availability change from place to place. If it concerns a page on this site, please include the link and a short description of what went wrong.",
            "For questions about a purchase, dealer or service visit, please contact the dealer or the manufacturer first, as they hold your records and can act directly. If that does not resolve the issue, keep your invoices and messages together, as they will make any further complaint much simpler and clearer.",
          ],
        },
        {
          h: "Business and partnership enquiries",
          p: [
            "Dealers who would like to join can use our partner page, and brands or agencies who would like to advertise can use the advertising page. Choosing the right page helps your message reach the correct team on the first attempt, which saves a good deal of back and forth.",
            "The form above is not connected yet, so messages sent through it are not saved. Nothing you enter is stored or sent, and the contact details shown on this site are placeholders. Please do not use it for urgent matters, or to share any personal or sensitive information.",
            "Until it is, please use the phone number or email address on this page. Notes about specific pages or screens are especially useful, because they help us improve the experience before anything goes further.",
          ],
        },
      ]}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-xl font-bold">Send us a message</h2>
        <SimpleForm
          submitLabel="Send my message"
          doneTitle="Thanks, your message would now be on its way"
          fields={[
            { label: "Your name" },
            { label: "Email address", type: "email" },
            { label: "Topic", options: ["Car research", "Dealer enquiry", "Partnership", "Feedback", "Something else"] },
            { label: "City" },
            { label: "How can we help?", textarea: true },
          ]}
        />
      </div>
    </InfoPage>
  );
}

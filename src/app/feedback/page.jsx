import { SimpleForm } from "@/components/tools";
import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Share your feedback on Wheelora",
    description: "Tell us what works and what does not on Wheelora. Your ideas and bug reports help us improve car research, comparison tools and the overall experience for everyone here.",
    path: "/feedback",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Feedback"
      title="Tell us what to improve"
      intro="Something confusing, broken or missing? Good. That is exactly what we want to hear about."
      links={[
        { label: "Contact our team", href: "/contact" },
        { label: "Help and FAQs", href: "/faqs" },
      ]}
      sections={[
        {
          h: "What makes feedback useful",
          p: [
            "Tell us what you were trying to do, what you expected to happen and what happened instead. A short description like this is far more helpful than a general rating, as it lets us reproduce the problem. If you can, mention the page you were on and whether you were using a phone or a computer.",
            "Ideas are just as welcome as bug reports. If you wish a filter existed, or found that a comparison left out the thing you cared about most, please let us know. Some of the best product decisions come from one person explaining a very ordinary frustration that nobody had noticed before.",
          ],
        },
        {
          h: "What happens next",
          p: [
            "In the live product, each message would be read by the team, sorted and grouped with similar requests, so that the most common problems rise to the top. We would not be able to reply to everything, but we would publish regular notes that describe what has changed and why it was changed.",
            "This form is not connected yet, so feedback sent through it is not saved. Nothing that you type is stored or sent anywhere. Please avoid including personal information in your message, and email us for anything urgent.",
            "Screenshots and short notes are always welcome when you share your thoughts with the team, because seeing exactly what you saw is often the fastest way for us to understand a problem and to fix it properly.",
          ],
        },
      ]}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-xl font-bold">Your feedback</h2>
        <SimpleForm
          submitLabel="Send my feedback"
          doneTitle="Thanks for helping us improve"
          fields={[
            { label: "Type of feedback", options: ["Something is broken", "An idea", "Wrong information", "General comment"] },
            { label: "Page or feature" },
            { label: "Tell us more", textarea: true },
          ]}
        />
      </div>
    </InfoPage>
  );
}

import { InfoPage } from "@/lib/info-page";
import { pageMeta } from "@/lib/seo";
import { ready } from "@/data/store";

export async function generateMetadata() {
  await ready();
  return pageMeta({
    title: "Privacy policy: how we treat your data",
    description: "How Wheelora treats your information: forms that are not connected store nothing, your shortlist and city stay on your device, and page views are counted without cookies.",
    path: "/privacy-policy",
  });
}

export default async function Page() {
  await ready();
  return (
    <InfoPage
      crumb="Privacy policy"
      title="How we treat your information"
      intro="A plain-language note on your data. A full policy, reviewed by a lawyer, would be required before any public launch."
      links={[
        { label: "Terms of use", href: "/terms" },
        { label: "Contact our team", href: "/contact" },
      ]}
      sections={[
        {
          h: "What we do with your data",
          p: [
            "Here is what happens to your information today. The forms for enquiries, sign-in, reviews and contact are for demonstration only, so what you type is held in your browser just long enough to show the next screen. It is not sent to our servers or passed to dealers, and the verification code step does not send a real message.",
            "Your chosen city and your shortlist are saved in your browser's local storage, so that they are still there when you come back. This information stays on your device, and you can remove it at any time by clearing your browser data. Page views and clicks are counted by our own cookie-free counter. Google Analytics or Microsoft Clarity load only when they are switched on, and there are no advertising trackers.",
          ],
        },
        {
          h: "What a live version would need to do",
          p: [
            "Before going live, the product would need a complete privacy notice that explains exactly what data is collected, why it is collected, who receives it and how long it is kept. Consent would be requested separately for each purpose, boxes would never be pre-ticked, and every dealer who could receive your details would be named.",
            "People would be able to see their data, correct it and withdraw consent as easily as they gave it. Records of consent, security safeguards and a process for handling breaches would all be put in place in line with applicable Indian law, including the Digital Personal Data Protection Act. This section describes our intent, and it is not legal advice.",
          ],
        },
        {
          h: "Images and third parties",
          p: [
            "Fonts and brand logos are bundled with this site, car photos load from our own server, and the 360 degree view loads a 3D model from Sketchfab when you open it. Those services can see your IP address and basic browser details when your device requests their files. External links are subject to the privacy policies of those websites.",
          ],
        },
      ]}
    />
  );
}

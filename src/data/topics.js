// News topic sections (/news/topic/<key>). Defaults below; the CMS "News topics" screen overrides them.

export const TOPICS = {
  ev: {
    label: "Electric Car News",
    navLabel: "EV news",
    h1: "Electric car news and EV updates",
    fuel: "Electric",
    intro: "New launches, charging developments and honest ownership costs for electric cars in India.",
    guide:
      "Electric car decisions depend heavily on where you will charge and how far you drive each month. Stories here focus on range, charging speed and the true cost of running an EV, rather than on headline figures alone. If you have no home charger, pay special attention to coverage of public networks in your own city.",
  },
  petrol: {
    label: "Petrol Car News",
    navLabel: "Petrol news",
    h1: "Petrol car news and updates",
    fuel: "Petrol",
    intro: "Launches, price changes and mileage stories for the petrol cars most Indian families buy.",
    guide:
      "Petrol remains the simplest choice for buyers who do not drive very long distances, as the purchase price is lower and refuelling is easy everywhere. These stories help you compare turbo and naturally aspirated engines, and understand how each of them behaves in traffic and on open highways.",
  },
  diesel: {
    label: "Diesel Car News",
    navLabel: "Diesel news",
    h1: "Diesel car news and updates",
    fuel: "Diesel",
    intro: "What is changing for diesel cars, from new variants and prices to the rules that affect them.",
    guide:
      "Diesel makes the most sense if you cover high monthly distances or often travel fully loaded, because its strong low-speed torque and good highway economy can offset the higher price. Before you buy, check the rules in your city, since older diesel vehicles face restrictions in some parts of the country.",
  },
  cng: {
    label: "CNG Car News",
    navLabel: "CNG news",
    h1: "CNG car news and updates",
    fuel: "CNG",
    intro: "New CNG variants, pump network growth and real running costs for budget-conscious buyers.",
    guide:
      "CNG can cut your fuel bill sharply, but the savings depend on having a filling station that is convenient to reach. These stories look at factory-fitted options, the boot space you give up to the cylinder, and how much driving you need to do for the extra purchase cost to pay for itself.",
  },
  hybrid: {
    label: "Hybrid Car News",
    navLabel: "Hybrid news",
    h1: "Hybrid car news and updates",
    fuel: "Hybrid",
    intro: "Strong and mild hybrid launches, real mileage and the tax rules that change what you pay.",
    guide:
      "Hybrids shine in stop-and-go traffic, where the electric motor does more of the work and the engine rests. Coverage here explains the difference between mild and strong hybrids, what happens to boot space and how state tax rules can shift the on-road price by a noticeable amount.",
  },
  launches: {
    label: "New Launches",
    navLabel: "New launches",
    h1: "New car launches in India",
    category: "launch",
    intro: "Everything that is arriving in showrooms, with prices, variants and what is genuinely new.",
    guide:
      "A launch story is most useful when it tells you what has changed for your budget. We look at which variant to choose, what rival cars offer at the same price and whether it is sensible to wait through the first batch of deliveries or book right away.",
  },
  prices: {
    label: "Price Updates",
    navLabel: "Price updates",
    h1: "Car price updates and revisions",
    category: "pricing",
    intro: "Price hikes, new variant pricing and what each change means for your on-road cost.",
    guide:
      "Price revisions tend to cluster around the new year and the start of the financial year. A small change in the ex-showroom figure also affects road tax and insurance, so these stories focus on the final amount you pay, and on whether it is better to book now or wait a little.",
  },
  comparisons: {
    label: "Comparisons",
    navLabel: "Comparisons",
    h1: "Car comparisons: which should you buy?",
    category: "comparison",
    intro: "Close rivals side by side on price, space, features and powertrains, with a clear verdict.",
    guide:
      "A good comparison starts from the trims you can actually afford rather than from the most expensive versions. Each of these stories lines up price, dimensions, features and engines, and then explains which kind of buyer should choose which car, so that you can match the verdict to your own needs.",
  },
  spy: {
    label: "Spy Shots",
    navLabel: "Spy shots",
    h1: "Car spy shots and test sightings",
    category: "spy",
    intro: "Early sightings of cars under test, and what they may tell us about upcoming models.",
    guide:
      "Spy shots are fun, but they are not promises. Plans change, and a camouflaged car can differ a lot from the final version. We try to separate what can actually be seen from what is only speculation, so that you can decide whether a rumoured update is really worth delaying your purchase for.",
  },
  mileage: {
    label: "Mileage And Running Costs",
    navLabel: "Mileage and costs",
    h1: "Car mileage and running cost guides",
    category: "mileage",
    intro: "Real-world fuel economy, monthly costs and simple ways of spending less on every trip.",
    guide:
      "Claimed mileage figures come from laboratory tests, so they work better for comparing cars than for predicting your own fuel bill. These stories explain what changes the number in real life, from traffic and tyre pressure to speed and load, and how to estimate what a car will really cost you to run.",
  },
  safety: {
    label: "Safety",
    navLabel: "Safety",
    h1: "Car safety news and explainers",
    category: "safety",
    intro: "Crash ratings, airbags and driver assistance, explained in simple and practical language.",
    guide:
      "Safety equipment often changes from one trim to another, so a headline crash rating may not describe the exact car you are buying. These stories explain what the ratings measure, which features matter the most in everyday driving and how to check the specification of your chosen variant.",
  },
  deals: {
    label: "Offers And Discounts",
    navLabel: "Offers and deals",
    h1: "New car offers and discount news",
    category: "discount",
    intro: "How current deals really work, and how to tell a real saving from a clever headline.",
    guide:
      "A big discount figure usually combines several separate benefits, and you may qualify for only some of them. These stories explain how to read an offer, what to ask the dealer and why comparing the full on-road totals is more useful than comparing the discount amounts alone.",
  },
  policy: {
    label: "Policy And Rules",
    navLabel: "Policy and rules",
    h1: "Car policy news and new rules",
    category: "policy",
    intro: "New rules on safety, emissions and tax, and how they could change what you pay for a car.",
    guide:
      "Government rules can quietly change prices and availability, sometimes removing a popular fuel type from a range altogether. We explain what a new rule actually requires, when it is likely to apply and what buyers should do about it, without assuming that you follow the industry closely.",
  },
  sales: {
    label: "Sales Reports",
    navLabel: "Sales reports",
    h1: "Car sales reports and market trends",
    category: "sales",
    intro: "Which cars and segments are selling, and what those trends can mean for you as a buyer.",
    guide:
      "Sales trends are useful even if you do not follow the industry. A popular car usually has better service coverage and resale value, but it may also come with longer waiting periods and smaller discounts. These reports explain what the numbers could mean for your next purchase.",
  },
};

export function hydrateTopics(input) {
  if (!Object.keys(input).length) return;
  for (const k of Object.keys(TOPICS)) delete TOPICS[k];
  Object.assign(TOPICS, input);
}

import { absoluteUrl } from "./seo";

export type RodeoNewsPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  status: "draft" | "published";
  featured: boolean;
  heroImage?: string;
  sourceUrls: string[];
  storyScore?: number;
  tags: string[];
  paragraphs: string[];
};

export const newsPosts: RodeoNewsPost[] = [
  {
    slug: "carlee-otero-world-standings-push",
    title: "Carlee Otero Is Closing In on the WPRA World Lead",
    excerpt:
      "Carlee Otero is second in the WPRA barrel racing world standings and less than $4,000 from the lead, while the Otero family keeps its rodeo season moving as a full-family effort.",
    category: "WPRA Standings",
    author: "Rodeo Daily",
    publishedAt: "2026-08-31T00:00:00.000Z",
    status: "published",
    featured: true,
    sourceUrls: [
      "https://wpra.com/pro-rodeo-world-standings/?svcUrl=pro-gb-world",
      "https://barrelracing.com/news/barrel-racing-results-world-standings-august-10-16-2026/",
      "https://barrelracing.com/news/barrel-racing-results-world-standings-august-17-23-2026/",
      "https://barrelhorsenews.com/event-coverage/2026-wpra-world-standings-updates/",
      "https://wpra.com/carlee-otero/",
      "https://www.rodeohouston.com/rodeohouston/advancements-tie-down-roping/",
      "https://www.thecowboychannel.com/carlee-and-michael-otero-find-success-at-utah-days-of-47-rodeo"
    ],
    storyScore: 92,
    tags: ["WPRA news", "PRCA news", "ProRodeo news", "WPRA standings", "PRCA results", "barrel racing", "Carlee Otero", "Michael Otero", "NFR standings"],
    paragraphs: [
      "# Carlee Otero Is Closing In on the WPRA World Lead",
      "### Otero has turned late-summer consistency into a real chance at taking over the barrel racing race before the regular season closes.",
      "Carlee Otero is no longer just protecting an NFR position.",
      "She is chasing the world lead.",
      "As of the Aug. 26 WPRA Pro Rodeo World Standings, Otero sat second in barrel racing with $179,101.00 in season earnings. Hayle Gibson-Stillwell held the No. 1 spot at $182,604.68, leaving Otero just $3,503.68 behind the lead with the final month of the regular season still ahead.",
      "That is the kind of gap that can disappear in one strong weekend.",
      "For Otero, the push has not come from one isolated rodeo. It has been built through steady checks, fast horses, and a schedule that keeps giving her chances to pressure the top of the standings.",
      "## The Late-Summer Move",
      "The middle of August was when Otero's run toward the top became impossible to ignore.",
      "During the Aug. 10-16 rodeo week, she cashed at every rodeo she entered and picked up four checks across three stops. Her week included money in the average and short round at the Farm-City Pro Rodeo in Hermiston, Oregon, along with checks at Owyhee County and Payette. That stretch added $6,329 and moved her from fifth to second in the world race.",
      "The next week, she kept adding.",
      "From Aug. 17-23, Otero was projected with another $8,628 in weekly earnings. The standings still showed Gibson-Stillwell in front, but the race had narrowed into a true late-season contest.",
      "Then came another statement in Idaho.",
      "At Gooding, Otero and Blingolena set a new arena record with a 16.54-second run and earned $7,432. For a barrel racer already sitting second in the world, that kind of result does more than add money. It confirms that the push is not just mathematical. It is happening in the arena.",
      "## More Than a Standings Climb",
      "Otero's season also carries weight because of what came before it.",
      "She finished 2025 fifth in the world with $325,166 and won four rounds at the National Finals Rodeo. Her WPRA profile lists five NFR qualifications, including 2011, 2012, 2014, 2024 and 2025.",
      "That history matters now because Otero is not simply trying to get back to Las Vegas. She is trying to arrive there in position to win a world championship.",
      "The current standings put her in range. The rodeo count shows the miles behind the number. Otero had 68 rodeos counted in the Aug. 26 WPRA standings, while Gibson-Stillwell had 56. The race is tight, but the styles of the campaigns are different. Gibson-Stillwell still owns the lead. Otero has been applying pressure through volume, consistency and late-season checks.",
      "## The Family Behind the Miles",
      "The Otero story is also bigger than a standings sheet.",
      "Carlee and her husband, PRCA tie-down roper Michael Otero, have built a rodeo life around traveling, competing and keeping family close. Houston Livestock Show and Rodeo described Carlee as a five-time NFR qualifier who spends more than 250 days on the road competing alongside Michael, while also noting that she is a mother of five.",
      "The WPRA lists her children as sons Kale Pierce, Hudson Otero and Houston Otero, and daughters Makala Pierce and Jacy Pierce. Her profile also notes that she became a grandmother in 2024.",
      "That makes the season a full-family operation, not just a barrel racing campaign. The rodeo road is where the Oteros compete, parent, work, haul horses and keep moving toward the next chance to win.",
      "Michael has been part of that momentum too.",
      "At RODEOHOUSTON in 2026, Michael advanced in tie-down roping after earning $9,000 in Super Series I, and the results list him with an 8.9-second round win worth $3,000. A year earlier, at the Utah Days of 47 Rodeo, Carlee won the barrel racing gold medal and Michael earned the silver medal in tie-down roping, bringing home more than $17,000 during the Salt Lake City event.",
      "That is part of what makes this push different. Carlee's chase for the WPRA lead is not happening separately from the rest of her life. It is happening while Michael is making his own runs count, while their family moves through the same schedule, and while the Oteros keep finding ways to make the road work.",
      "## What Comes Next",
      "The regular season closes Sept. 30, and Otero has already done the hardest part of a world-title chase before the NFR. She has put herself close enough that every check matters.",
      "The math is narrow.",
      "A $3,503.68 gap can be erased quickly in barrel racing, especially when late-season rodeos and playoff opportunities still have meaningful money available. But the same pressure works both ways. Gibson-Stillwell still leads. Emily Beisel, Kassie Mowry and Hailey Kinsel are still close enough to matter. The top of the WPRA standings is not settled.",
      "That is why Otero's consistency matters.",
      "She has been winning enough to move from fifth to second. She has been fast enough to set an arena record. She has been steady enough to turn every August check into pressure on the No. 1 spot.",
      "Now the question is whether the push becomes a lead.",
      "If Otero keeps cashing through September, the barrel racing world standings could have a new name on top before the regular season ends. And if she reaches Las Vegas from that position, her 2026 story changes from another NFR qualification into something much bigger.",
      "It becomes a real world-title run."
    ]
  },
  {
    slug: "monday-pro-rodeo-roundup-prca-wpra-results",
    title: "Monday Pro Rodeo Roundup: PRCA Results, WPRA Standings, and Weekend Stories",
    excerpt:
      "Rodeo Daily is adding a weekly news workflow built around PRCA results, WPRA results, pro rodeo standings, NFR implications, and the biggest stories from each weekend.",
    category: "Pro Rodeo Roundup",
    author: "Rodeo Daily",
    publishedAt: "2026-08-29T12:00:00.000Z",
    status: "published",
    featured: true,
    sourceUrls: [],
    storyScore: 100,
    tags: ["PRCA results", "WPRA results", "pro rodeo results", "PRCA standings", "WPRA standings"],
    paragraphs: [
      "Rodeo Daily is building a weekly pro rodeo roundup for fans who want the story behind the weekend results. The goal is to connect PRCA results, WPRA results, pro rodeo standings, athlete movement, payouts, and NFR implications in one easy place to read.",
      "The roundup will focus on the most meaningful story from the past weekend rather than simply repeating a result list. A strong story might come from a major win, a standings jump, a breakthrough performance, a comeback, a notable WPRA result, or a result that changes the NFR picture.",
      "The best version of this workflow starts with structured rodeo data, then uses source research to verify names, dates, scores, times, money, and standings impact. That keeps the article useful for search while still giving rodeo fans context they cannot get from a raw leaderboard alone.",
      "Future Monday roundup articles can include the winning performance, why it mattered, how it affected PRCA standings or WPRA standings, related pro rodeo results, and where fans can follow the next rodeo on the schedule."
    ]
  }
];

export function publishedNewsPosts() {
  return newsPosts
    .filter((post) => post.status === "published")
    .slice()
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function newsPostBySlug(slug: string) {
  return publishedNewsPosts().find((post) => post.slug === slug);
}

export function newsPostUrl(post: RodeoNewsPost) {
  return absoluteUrl(`/news/${post.slug}`);
}

export function newsPostImage(post: RodeoNewsPost) {
  if (post.heroImage?.startsWith("http://") || post.heroImage?.startsWith("https://")) {
    return post.heroImage;
  }
  return absoluteUrl(post.heroImage || "/rodeo-daily-icon.png");
}

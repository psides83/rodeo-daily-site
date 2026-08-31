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
    "slug": "2026-prorodeo-regular-season-record-watch",
    "title": "Records Within Reach: 2026 Leaders Have One More Month to Make History",
    "excerpt": "Several of ProRodeo's top earners have a chance to break single-season regular-season earnings records before the 2026 NFR. Riley Webb and Tyler Waguespack are particularly close, while Noah Lee, Cole Patterson, Rusty Wright, Bradlee Miller, Stetson Wright, and the team of Kaleb Driggers and Junior Nogueira also have records within reach.",
    "content": "\"# Records Within Reach: 2026 Leaders Have One More Month to Make History\n\nThe 2026 ProRodeo season is entering its final stretch, and the race to Las Vegas isn't the only thing worth watching.\n\nSeveral of the sport's event leaders have another piece of history in front of them.\n\nWith the regular season ending September 30, the top competitors in several events have a legitimate opportunity to challenge the PRCA's single-season earnings records before the NFR begins.\n\nThe records are high. The time is short. But with the Puyallup Playoff Series, the Governor's Cup in Sioux Falls and the final September rodeos still ahead, the possibility is real.\n\nAnd nobody is closer than Riley Webb.\n\n## Riley Webb Is Closing In on His Own Record\n\nRiley Webb has spent 2026 doing what he has become accustomed to doing: winning money.\n\nThe Denton, Texas, tie-down roper currently leads the event with **$291,261** in season earnings. The PRCA's regular-season record for tie-down roping is **$305,132**, set by Webb himself in 2025.\n\nThat leaves Webb only **$13,871** short of a record he established just one year ago.\n\nIt's an unusual position for the three-time World Champion.\n\nRather than chasing someone else's mark, Webb is chasing his own.\n\nAnd he has already put together the kind of season that makes the possibility believable. His current total is nearly $40,000 ahead of second-place Haven Meged, who sits at $204,146.\n\nThe regular season doesn't end until September 30, giving Webb several more opportunities to erase the remaining gap.\n\nIf he does it, Webb wouldn't simply defend his place at the top of the tie-down roping standings. He would raise the standard for what constitutes the greatest regular-season earnings year in the event.\n\n## Tyler Waguespack Is Nearly There\n\nThe closest record chase by percentage may belong to Tyler Waguespack.\n\nThe Gonzales, Louisiana, steer wrestler currently has **$187,269** in season earnings.\n\nThe PRCA regular-season record for steer wrestling is **$199,263**, set by Dalton Massey in 2024.\n\nWaguespack needs just **$11,994** to take the record.\n\nThat is a remarkably small gap considering how much money remains available during the final month of the season.\n\nWaguespack has also built a substantial lead in the event. Jesse Brown currently sits second at $157,039, meaning Waguespack has nearly $30,000 separating himself from the next man in the standings.\n\nIf Waguespack can find one or two big checks during September, the record could fall.\n\n## Noah Lee Has a Shot at a Bull Riding Record\n\nNobody is closer to a regular-season record in raw dollars than Noah Lee.\n\nThe Mineral Wells, Texas, bull rider currently leads the PRCA with **$328,972**.\n\nThe regular-season bull riding record belongs to Stetson Wright, who won **$368,630** during the 2023 season.\n\nLee needs another **$39,658** to surpass it.\n\nThat's a substantial amount of money, but bull riding can produce enormous checks in a short period of time. Lee has already established himself as one of the season's dominant money winners, and his current total has put him more than $46,000 ahead of second-place Tristen Hutchings.\n\nThe opportunity is there.\n\nSo is the pressure.\n\nLee isn't simply trying to win a world championship. He's trying to put together a season that would go into the record book before he ever backs into the Thomas & Mack Center.\n\n## Cole Patterson Still Has a Path\n\nSteer roping doesn't get the same attention as some of the larger PRCA events, but Cole Patterson has quietly put together another outstanding season.\n\nPatterson currently leads the event with **$89,858**.\n\nHis regular-season record is **$125,080**, set in 2025.\n\nThat leaves Patterson **$35,222** away.\n\nUnlike some of the other records, that gap would require a significant September. But steer roping's schedule and payout structure can create opportunities for a cowboy who gets hot at the right time.\n\nPatterson has already proven he can produce that kind of season.\n\nNow he has one more month to do it again.\n\n## Rusty Wright Has the Saddle Bronc Record in Sight\n\nRusty Wright currently sits atop a loaded saddle bronc riding field with **$242,499**.\n\nThe record he is chasing belongs to Ryder Wright, who earned **$293,994** during the 2025 regular season.\n\nRusty needs **$51,495** to break it.\n\nThe Wright family has already dominated the top of the standings this season. Stetson Wright sits second with $223,290, while Ryder Wright is third with $222,310.\n\nThat means Rusty's record chase is happening in one of the deepest events in ProRodeo.\n\nA big September could change the history book.\n\n## Team Roping Could Take a Team Effort\n\nThe team roping record presents a slightly different situation.\n\nKaleb Driggers and Junior Nogueira currently lead the event with **$180,713 each**.\n\nThe PRCA regular-season record is **$227,878**, established by Driggers and Nogueira in 2022.\n\nThe pair therefore needs another **$47,165 apiece** to break their own record.\n\nThat's what makes this storyline particularly interesting.\n\nThey're not chasing a record held by another team.\n\nThey're chasing a record they already own.\n\nDriggers and Nogueira have spent years among the sport's elite, and the fact that they're still in position to rewrite their own record book entry four years later says plenty about the level they're performing at.\n\n## Bradlee Miller Has a Bigger Mountain\n\nBradlee Miller has been one of the biggest stories in bareback riding all year.\n\nThe Huntsville, Texas, cowboy currently leads the event with **$251,230**.\n\nThe regular-season record is **$303,547**, set by Rocker Steiner in 2025.\n\nMiller therefore needs another **$52,317**.\n\nThat's a much steeper climb than Webb or Waguespack face, but Miller has already shown that he can produce the kind of season necessary to make the attempt interesting.\n\nHe leads the bareback standings by more than $45,000 over Jacob Lees and has been one of the most consistent money winners in the event.\n\nThe record is not likely to come easily.\n\nBut with September still available, it remains within mathematical reach.\n\n## Stetson Wright Has the Biggest Record Chase of All\n\nStetson Wright's season has been remarkable even without the record chase.\n\nHe currently leads the PRCA all-around standings with **$349,016**.\n\nThe regular-season all-around earnings record is **$459,621**, established by Wright himself in 2023.\n\nThat means Stetson would need another **$110,605** before September 30 to break his own record.\n\nThat's an enormous number.\n\nBut Stetson is also competing in multiple events, which gives him more opportunities to add money than a competitor restricted to one discipline.\n\nThe all-around race also demonstrates just how extraordinary his 2026 season has already been. His $349,016 total is more than double the current earnings of second-place Brushton Minton.\n\nThe record may be a long shot.\n\nBut the fact that Stetson Wright is even within striking distance of a $459,621 regular-season total is remarkable.\n\n## What About Barrel Racing?\n\nThere is also a potential record storyline on the women's side.\n\nHayle Gibson-Stillwell currently leads the WPRA barrel racing standings with **$183,138**.\n\nThe WPRA regular-season earnings record is **$270,563**, set by Brittany Pozzi Tonozzi in 2023.\n\nThat leaves Gibson-Stillwell **$87,425** short.\n\nThat's a much larger gap than the closest men's event leaders face, making the record a significant long shot.\n\nBut the race is worth watching because Gibson-Stillwell is already leading the field and the WPRA season continues through September 30.\n\n## The Final Month Could Rewrite the Record Book\n\nThe important thing about these races is that none of them require the NFR.\n\nThese are **regular-season records**.\n\nThe money earned between now and September 30 counts toward the regular-season totals, while the NFR provides a completely separate opportunity to add to annual earnings.\n\nThat means the next month is essentially the final chapter of one record book before another one begins.\n\nRiley Webb needs $13,871.\n\nTyler Waguespack needs $11,994.\n\nNoah Lee needs $39,658.\n\nCole Patterson needs $35,222.\n\nKaleb Driggers and Junior Nogueira need $47,165 each.\n\nRusty Wright needs $51,495.\n\nBradlee Miller needs $52,317.\n\nStetson Wright needs $110,605.\n\nHayle Gibson-Stillwell needs $87,425.\n\nThose numbers aren't predictions.\n\nThey're the distances between today's leaders and the historical marks they are chasing.\n\nAnd with the richest part of the season still ahead, every check could change the answer.\n\nBy the time the regular season closes on September 30, the 2026 season may have produced more than new world champions.\n\nIt may have produced a new set of records.\"",
    "status": "published",
    "category": "Pro Rodeo Roundup",
    "author": "Rodeo Daily",
    "tags": "[\"2026 ProRodeo\",\"PRCA\",\"WPRA\",\"regular season records\",\"earnings records\",\"Riley Webb\",\"Tyler Waguespack\",\"Noah Lee\",\"Cole Patterson\",\"Rusty Wright\",\"Bradlee Miller\",\"Stetson Wright\",\"Kaleb Driggers\",\"Junior Nogueira\",\"Hayle Gibson-Stillwell\",\"NFR\"]",
    "hero_image": "https://achpzqhveafdqkdufwhk.supabase.co/storage/v1/object/sign/article-images/ShadMayfield.jpg?token=eyJraWQiOiJmNGY5ZjBiNC0xOWEwLTQ5YzUtOTkwMi1iZWRjZjQ3OGQyMTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhcnRpY2xlLWltYWdlcy9TaGFkTWF5ZmllbGQuanBnIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4ODIxODc0MiwiZXhwIjoyMTAzNTc4NzQyfQ.CzwVJInhGsulZscmt6VAJ73CM2KWZzEF5YItZ6fxRn8",
    "source_urls": "[\"https://prorodeoresults.app\"]",
    "featured": true,
    "story_score": 98,
    "published_at": "2026-08-31 23:22:19+00",
    "created_at": "2026-08-31 23:22:19+00",
    "updated_at": "2026-08-31 23:25:49.57581+00"
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

# Rodeo Daily AdSense readiness audit

Reviewed October 13, 2026. Production site: https://www.prorodeoresults.app/

**Recommendation: resolve the remaining content and account checks before requesting another review. These changes improve readiness; they do not establish full compliance or guarantee approval.**

## Live-site evidence

Fetched all 350 unique URLs in the current main and news sitemaps. All returned HTTP 200; no request failures. Search Console's reported 535 indexed pages can include URLs outside the current sitemaps. A Search Console export is needed to examine those additional URLs.

The audit inspected initial response HTML with scripts/styles removed, not a JavaScript-rendered browser session. Empty markers can reflect delayed client loading rather than a permanently empty page. Word counts include navigation and are diagnostic only: Google does not establish an approval threshold of 150 words.

- 161 responses contained empty-data or placeholder markers: homepage, 80 result pages, 80 schedule pages.
- 283 had fewer than 150 words in the initial response, including 59 athlete profiles and 54 listing details.
- 330 responses lacked a direct `/privacy` link. A privacy link elsewhere in a settings menu may still exist.
- No AdSense serving script appeared in these initial responses. Scripts loaded after user interaction were not assessed.
- Privacy, About, support, robots.txt, and ads.txt were reachable. robots.txt permits crawlers. ads.txt and the ownership meta tag use publisher ID `4837925489125062` consistently. Actual account ownership remains unverified.
- The results and event landing pages often describe app features instead of directly supplying the promised results.

Full per-URL baseline: [adsense-live-audit-2026-10-13.json](adsense-live-audit-2026-10-13.json).

## Changes in this checkout

1. Restored commented-out information collection and tracking disclosures. Added Google advertising cookie disclosures, third-party technologies, Google data-use information, personalized-ad controls, and industry opt-out links. Updated Portuguese and Spanish advertising disclosures and click tracking disclosures too.
2. Added a site-wide footer with About, contact/corrections, privacy, and official association links.
3. Result details now receive the results, rounds, selected event, and payouts already fetched on the server. Schedule and listing details likewise receive server-fetched records rather than throwing them away before rendering.
4. Result pages without available event data, unresolved schedule placeholders, and unavailable listings receive noindex instructions. This avoids inviting indexing of these responses; it does not itself make a site AdSense compliant. Valid content can become indexable after feeds recover.
5. Result and schedule ad placements are suppressed when relevant data is absent or not loaded. House promotions are suppressed by the same guards.
6. Invalid numeric athlete/rodeo route identifiers receive HTTP 404 and noindex at the request boundary, with not-found handling in the route components too.
7. Removed a listing structured-data claim that Rodeo Daily organizes third-party rodeos. Added an independent-reference disclosure to About.
8. Removed the viewport restriction that prevented user zoom.

These changes are local and have not been deployed or submitted to AdSense.

## Remaining work before resubmission

### Content quality and usefulness — highest priority

Google requires valuable content and disallows monetization of low-value screens or copied material without added value. Indexed page volume is not evidence of meeting those requirements. The findings do not prove the reason for the prior denials.

Deploy the fixes, then verify real rendered content on representative results, schedules, listings, and profiles. Refresh the full sitemap audit after deployment. Some feeds genuinely contain no results: the public result records for Texas Circuit Finals (18962) and its breakaway event (18966) returned `Events: null` during this review. Pre-rendering cannot create missing upstream data.

Replace near-identical event landing pages with useful event-specific content and directly accessible records, or consolidate pages that serve the same purpose. Add substantive, fact-checked explanations and original reporting where the current pages merely repeat source records. Do not pad pages to a word target or publish invented biographies. Evaluate missing/stale records and the additional URLs in Search Console. Keep ads off utility, unavailable, or empty screens.

### Rights and attribution — owner confirmation required

Confirm permission or an applicable license for third-party athlete photographs, biographies, source text, and data reuse. Public access and attribution do not establish permission. Review images and article text for copied material and prohibited content. Data curation and navigation may add value, but they do not guarantee that Google will judge the site sufficiently original.

### Consent and privacy — account configuration required

The existing custom personalized/basic/decline banner is not evidence of a Google-certified CMP. Google requires a certified CMP integrated with the IAB TCF for personalized ads to visitors in the EEA, UK, and Switzerland. Non-personalized ads can still involve cookies and other consent obligations.

Before enabling ads, configure and publish a certified consent message in AdSense Privacy & messaging, select/disclose the actual ad technology providers, and test consent, rejection, and withdrawal. Reconcile the custom banner and its requestNonPersonalizedAds flag with the certified CMP so competing signals do not override the visitor's choices. Review regional privacy settings and actual data retention against the policy. The default code leaves Google ads disabled unless NEXT_PUBLIC_ENABLE_ADSENSE=true; deployed environment values were not inspected.

### Account, traffic, and live presentation — unverified

Verify the AdSense Sites and Policy center screens, correct domain and publisher account, age/account eligibility, duplicate-account issues, account details, and the latest review status. Check traffic sources for purchased, automated, incentivized, or otherwise invalid traffic. Do not click your own ads or ask others to click them.

Test mobile and desktop presentation after deployment, especially ads near filters, back buttons, and other actions. Keep advertising distinguishable from content and avoid more promotional material than publisher content. Confirm HTTP-to-HTTPS redirects and crawler access on the deployed version. The privacy disclosures must match actual behavior, vendors, and retention, not merely contain standard wording.

## Validation

Production builds completed successfully with Next.js compilation, lint, and type checking. Local response checks confirmed the updated privacy pages, opt-out links, independent-reference disclosure, and global footer. Final route checks are recorded in the chat. No post-deployment verification or account-level review has been performed.

## Primary Google references

- [Site readiness and review](https://support.google.com/adsense/answer/12176698?hl=en)
- [Pages ready for AdSense](https://support.google.com/adsense/answer/7299563?hl=en)
- [Publisher policies: content, inventory, privacy, and behavior](https://support.google.com/publisherpolicies/answer/10502938?hl=en)
- [AdSense program policies](https://support.google.com/adsense/answer/48182?hl=en)
- [Required privacy policy content](https://support.google.com/adsense/answer/1348695?hl=en)
- [Privacy disclosures](https://support.google.com/publisherpolicies/answer/10437794?hl=en)
- [Google-certified CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en)
- [Connect your site and verify ownership](https://support.google.com/adsense/answer/7584263?hl=en)

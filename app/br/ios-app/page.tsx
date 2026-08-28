import type { Metadata } from "next";
import { LocalizedMarketingPage, getLocalizedContent, localeAlternates } from "../../components/localized-public-pages";
import { absoluteUrl } from "../../lib/seo";

const content = getLocalizedContent("br");

export const metadata: Metadata = {
  title: content.marketing.title,
  description: content.marketing.description,
  alternates: {
    canonical: absoluteUrl("/br/ios-app"),
    languages: localeAlternates("ios-app")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/br/ios-app"),
    locale: "pt_BR",
    title: content.marketing.title,
    description: content.marketing.description
  },
  twitter: {
    card: "summary",
    title: content.marketing.title,
    description: content.marketing.description
  }
};

export default function BrazilMarketingPage() {
  return <LocalizedMarketingPage locale="br" />;
}

import type { Metadata } from "next";
import { LocalizedMarketingPage, getLocalizedContent, localeAlternates } from "../../components/localized-public-pages";
import { absoluteUrl } from "../../lib/seo";

const content = getLocalizedContent("mx");

export const metadata: Metadata = {
  title: content.marketing.title,
  description: content.marketing.description,
  alternates: {
    canonical: absoluteUrl("/mx/ios-app"),
    languages: localeAlternates("ios-app")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/mx/ios-app"),
    locale: "es_MX",
    title: content.marketing.title,
    description: content.marketing.description
  },
  twitter: {
    card: "summary",
    title: content.marketing.title,
    description: content.marketing.description
  }
};

export default function MexicoMarketingPage() {
  return <LocalizedMarketingPage locale="mx" />;
}

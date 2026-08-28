import type { Metadata } from "next";
import { LocalizedPrivacyPage, getLocalizedContent, localeAlternates } from "../../components/localized-public-pages";
import { absoluteUrl } from "../../lib/seo";

const content = getLocalizedContent("mx");

export const metadata: Metadata = {
  title: content.privacy.title,
  description: content.privacy.description,
  alternates: {
    canonical: absoluteUrl("/mx/privacy"),
    languages: localeAlternates("privacy")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/mx/privacy"),
    locale: "es_MX",
    title: content.privacy.title,
    description: content.privacy.description
  },
  twitter: {
    card: "summary",
    title: content.privacy.title,
    description: content.privacy.description
  }
};

export default function MexicoPrivacyPage() {
  return <LocalizedPrivacyPage locale="mx" />;
}

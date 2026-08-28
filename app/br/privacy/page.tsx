import type { Metadata } from "next";
import { LocalizedPrivacyPage, getLocalizedContent, localeAlternates } from "../../components/localized-public-pages";
import { absoluteUrl } from "../../lib/seo";

const content = getLocalizedContent("br");

export const metadata: Metadata = {
  title: content.privacy.title,
  description: content.privacy.description,
  alternates: {
    canonical: absoluteUrl("/br/privacy"),
    languages: localeAlternates("privacy")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/br/privacy"),
    locale: "pt_BR",
    title: content.privacy.title,
    description: content.privacy.description
  },
  twitter: {
    card: "summary",
    title: content.privacy.title,
    description: content.privacy.description
  }
};

export default function BrazilPrivacyPage() {
  return <LocalizedPrivacyPage locale="br" />;
}

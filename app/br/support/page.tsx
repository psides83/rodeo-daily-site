import type { Metadata } from "next";
import { LocalizedSupportPage, getLocalizedContent, localeAlternates } from "../../components/localized-public-pages";
import { absoluteUrl } from "../../lib/seo";

const content = getLocalizedContent("br");

export const metadata: Metadata = {
  title: content.support.title,
  description: content.support.description,
  alternates: {
    canonical: absoluteUrl("/br/support"),
    languages: localeAlternates("support")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/br/support"),
    locale: "pt_BR",
    title: content.support.title,
    description: content.support.description
  },
  twitter: {
    card: "summary",
    title: content.support.title,
    description: content.support.description
  }
};

export default function BrazilSupportPage() {
  return <LocalizedSupportPage locale="br" />;
}

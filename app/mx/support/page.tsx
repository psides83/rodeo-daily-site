import type { Metadata } from "next";
import { LocalizedSupportPage, getLocalizedContent, localeAlternates } from "../../components/localized-public-pages";
import { absoluteUrl } from "../../lib/seo";

const content = getLocalizedContent("mx");

export const metadata: Metadata = {
  title: content.support.title,
  description: content.support.description,
  alternates: {
    canonical: absoluteUrl("/mx/support"),
    languages: localeAlternates("support")
  },
  openGraph: {
    type: "website",
    url: absoluteUrl("/mx/support"),
    locale: "es_MX",
    title: content.support.title,
    description: content.support.description
  },
  twitter: {
    card: "summary",
    title: content.support.title,
    description: content.support.description
  }
};

export default function MexicoSupportPage() {
  return <LocalizedSupportPage locale="mx" />;
}

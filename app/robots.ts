import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "./lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    sitemap: [absoluteUrl("/sitemap.xml"), absoluteUrl("/news/sitemap.xml")],
    host: siteUrl
  };
}

import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1
    },
    {
      url: absoluteUrl("/prca-results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.98
    },
    {
      url: absoluteUrl("/prca-standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.98
    },
    {
      url: absoluteUrl("/rodeo-results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.92
    },
    {
      url: absoluteUrl("/rodeo-standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.92
    },
    {
      url: absoluteUrl("/?tab=standings"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95
    },
    {
      url: absoluteUrl("/?tab=results"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95
    },
    {
      url: absoluteUrl("/?tab=schedule"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85
    },
    {
      url: absoluteUrl("/?tab=more&section=nfr"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75
    },
    {
      url: absoluteUrl("/?tab=more&section=champions"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: absoluteUrl("/?tab=more&section=listings"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7
    }
  ];
}

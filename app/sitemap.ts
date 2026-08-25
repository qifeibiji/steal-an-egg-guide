import type { MetadataRoute } from "next";
import { pages, siteUrl } from "@/lib/site-data";

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: page.checkedDate,
    changeFrequency: page.path.includes("codes") || page.path.includes("events") ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : page.path === "/guides/" ? 0.9 : 0.8
  }));
}

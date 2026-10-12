import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const pages = [
  { path: "", priority: 1 },
  { path: "/servicii", priority: 0.9 },
  { path: "/contact", priority: 0.9 },
  { path: "/despre", priority: 0.7 },
  { path: "/politica-de-confidentialitate", priority: 0.3 },
  { path: "/politica-de-cookie-uri", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: `${site.url}${page.path}`,
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}

import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.org";
  const paths = ["", "/hoi-vien", "/than-kinh", "/hanh-cac-thanh", "/giao-ly", "/do-vui", "/binh-ca", "/thu-vien"];
  return paths.map((path) => ({ url: base + path, lastModified: new Date(), changeFrequency: "weekly", priority: path ? 0.7 : 1 }));
}

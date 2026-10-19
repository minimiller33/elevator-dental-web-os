import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://elevatordental.com/" },
    { url: "https://elevatordental.com/diagnostico-seo" },
  ];
}

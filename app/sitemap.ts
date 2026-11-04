import type { MetadataRoute } from "next";
import { services } from "@/lib/services";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://elevatordental.com/" },
    { url: "https://elevatordental.com/diagnostico-seo" },
    ...services.map(({ slug }) => ({ url: `https://elevatordental.com/servicios/${slug}` })),
  ];
}

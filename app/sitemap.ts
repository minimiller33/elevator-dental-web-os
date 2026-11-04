import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
import { leadMagnets } from "@/lib/lead-magnets";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://elevatordental.com/" },
    { url: "https://elevatordental.com/diagnostico-seo" },
    { url: "https://elevatordental.com/recursos" },
    ...leadMagnets.map(m => ({ url: `https://elevatordental.com${m.slug}` })),
    ...services.map(({ slug }) => ({ url: `https://elevatordental.com/servicios/${slug}` })),
  ];
}

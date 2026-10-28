import type { MetadataRoute } from "next";

const routes = ["", "/flags", "/about", "/process", "/gallery", "/name-registry", "/add-name", "/donate", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `https://flagtoremember.com${r}` }));
}

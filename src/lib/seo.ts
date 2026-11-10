export const SITE_NAME = "LogoColorStudio";
export const SITE_URL = "https://logocolorstudio.com";
export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

type HeadOpts = {
  title: string;
  description: string;
  /** Shorter social-sharing copy; defaults to the search title/description. */
  ogTitle?: string;
  ogDescription?: string;
  path: string;
  type?: string;
  image?: string;
  noindex?: boolean;
  follow?: boolean;
  jsonLd?: object[];
};

export function pageHead({ title, description, ogTitle = title, ogDescription = description, path, type = "website", image, noindex, follow = false, jsonLd = [] }: HeadOpts) {
  const url = absoluteUrl(path);
  const defaultImage = path === "/" ? "/images/share/home.jpg" : path.startsWith("/tools") ? "/images/share/tools.jpg" : path.startsWith("/palette") ? "/images/share/palettes.jpg" : path.startsWith("/blog") ? "/images/share/blog.jpg" : undefined;
  const shareImage = image ? absoluteUrl(image) : defaultImage ? absoluteUrl(defaultImage) : undefined;
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription },
  ];
  if (shareImage) {
    meta.push({ property: "og:image", content: shareImage }, { name: "twitter:image", content: shareImage });
  }
  if (noindex) meta.push({ name: "robots", content: follow ? "noindex, follow" : "noindex, nofollow" });
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: [
      ...(!noindex ? [{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      }] : []),
      ...jsonLd,
    ].map((j) => ({ type: "application/ld+json", children: JSON.stringify(j) })),
  };
}

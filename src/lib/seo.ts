export const SITE_NAME = "LogoColorStudio";

type HeadOpts = {
  title: string;
  description: string;
  path: string;
  type?: string;
  image?: string;
  noindex?: boolean;
  jsonLd?: object[];
};

export function pageHead({ title, description, path, type = "website", image, noindex, jsonLd = [] }: HeadOpts) {
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: path },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image && /^https?:\/\//.test(image)) {
    meta.push({ property: "og:image", content: image }, { name: "twitter:image", content: image });
  }
  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return {
    meta,
    links: noindex ? [] : [{ rel: "canonical", href: path }],
    scripts: jsonLd.map((j) => ({ type: "application/ld+json", children: JSON.stringify(j) })),
  };
}

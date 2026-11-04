// Shared byline and studio identity used across blog posts and the About page.
// The site publishes under its brand and studio name; a personal name, photo or
// bio can be supplied by the owner later and simply replaces these values.
export const EDITORIAL_AUTHOR = {
  name: "LogoColorStudio Team",
  bio: "The LogoColorStudio team at APWEB Ventures builds the free color and website tools on this site and writes practical guides to color systems, accessibility and website research.",
  photo: "",
};
export const TEAM = { name: "APWEB Ventures", role: "The studio behind LogoColorStudio", photo: "" };

const TEAM_ALIASES = new Set([
  "",
  "logocolorstudioteam",
  "logocolorstudio",
  "logocolorstudioteam",
  "logo color studio team",
  "apwebventures",
  "team",
]);

/** Maps stored author values to the published byline; keeps any real personal name intact. */
export function editorialAuthorName(raw?: string | null) {
  const value = (raw ?? "").trim();
  if (TEAM_ALIASES.has(value.toLowerCase().replace(/[^a-z0-9]/g, ""))) return EDITORIAL_AUTHOR.name;
  return value;
}

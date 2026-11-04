// Shared byline and owner identity used across blog posts and the About page.
// The site is owned and run by Ali Raza (APWEB Ventures); these values are the
// single source for every published byline, so changing them here updates the
// whole site.
export const OWNER = { name: "Ali Raza", studio: "APWEB Ventures", email: "apwebventures01@gmail.com" };
export const EDITORIAL_AUTHOR = {
  name: OWNER.name,
  bio: "Ali Raza builds and maintains LogoColorStudio, the free color and website tools on this site, and writes the practical guides to color systems, accessibility and website research.",
  photo: "",
};
export const TEAM = { name: OWNER.name, role: `Founder of LogoColorStudio · ${OWNER.studio}`, photo: "" };

const TEAM_ALIASES = new Set([
  "",
  "logocolorstudioteam",
  "logocolorstudio",
  "logo color studio team",
  "logo color studio",
  "apwebventures",
  "apweb ventures",
  "team",
]);

/** Maps stored team bylines to the owner's published name; keeps any other real author name intact. */
export function editorialAuthorName(raw?: string | null) {
  const value = (raw ?? "").trim();
  if (TEAM_ALIASES.has(value.toLowerCase().replace(/[^a-z0-9]/g, ""))) return EDITORIAL_AUTHOR.name;
  return value;
}

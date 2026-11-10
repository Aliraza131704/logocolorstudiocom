import { createFileRoute, Link } from "@tanstack/react-router";
import { TEAM } from "@/lib/editorial-config";
import { getPage } from "@/lib/content.functions";
import { CmsPage } from "@/components/site/CmsPage";
import { pageHead } from "@/lib/seo";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/about")({
  loader: () => getPage({ data: { slug: "about" } }),
  head: () => pageHead({ ...PAGE_META["/about"], path: "/about" }),
  component: () => {
    const p = Route.useLoaderData();
    return <CmsPage title={p?.title ?? "About LogoColorStudio"} html={p?.content ?? ""}><article className="prose-content mt-8"><h2>Our mission</h2><p>Ali Raza built LogoColorStudio under APWEB Ventures to make useful color workflows accessible without a paid design subscription. A logo, a website and a few good decisions should be enough to start a consistent visual identity.</p><h2>From source to color system</h2><p>Logo extraction reads pixels locally on your device. Palette generation applies color harmony rules; contrast checks calculate relative luminance using the WCAG method. Exports translate your chosen colors into reusable values rather than changing their appearance.</p><p>Website tools read publicly accessible pages and look for colors, fonts and recognizable platform signals. These signals are clues, not proof: a hidden theme name, a custom build or a blocked request can limit the result. We do not retain the returned analysis results.</p><h2>Behind LogoColorStudio</h2>{TEAM.photo && <img src={TEAM.photo} alt={TEAM.name} width={160} height={160} />}<p><strong>{TEAM.name}</strong><br />{TEAM.role}</p><p>Have feedback, a partnership question or a correction? <Link to="/contact">Contact Ali Raza</Link>.</p></article></CmsPage>;
  },
});

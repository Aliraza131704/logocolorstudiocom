import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider, THEME_SCRIPT } from "@/lib/theme";
import { ConsentProvider } from "@/components/site/consent";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AdSlot, GlobalScripts } from "@/components/site/AdSlot";
import { Toaster } from "@/components/ui/sonner";
import { logEvent } from "@/lib/site-data";
import { PromoPopup } from "@/components/site/PromoPopup";
import { absoluteUrl } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-hero px-4">
      <div className="max-w-md text-center">
        <p className="text-gradient font-display text-8xl font-extrabold">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="inline-flex h-11 items-center rounded-full bg-primary px-6 font-medium text-primary-foreground">Go home</Link>
          <Link to="/tools" className="inline-flex h-11 items-center rounded-full border px-6 font-medium">Browse tools</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end. You can try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground">Go home</a>
        </div>
      </div>
    </div>
  );
}

const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${absoluteUrl("/")}#organization`,
  name: "LogoColorStudio",
  legalName: "APWEB Ventures",
  founder: { "@type": "Person", name: "Ali Raza" },
  url: absoluteUrl("/"),
  logo: absoluteUrl("/apple-touch-icon.png"),
  email: "apwebventures01@gmail.com",
  sameAs: ["https://www.pinterest.com/logocolorstudio/"],
};
const SITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${absoluteUrl("/")}#website`,
  name: "LogoColorStudio",
  url: absoluteUrl("/"),
  publisher: { "@id": `${absoluteUrl("/")}#organization` },
  potentialAction: { "@type": "SearchAction", target: `${absoluteUrl("/palettes")}?q={search_term_string}`, "query-input": "required name=search_term_string" },
};

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LogoColorStudio — Brand Color Tools" },
      { name: "description", content: "Extract, generate and ship brand colors in seconds with free color tools." },
      { property: "og:site_name", content: "LogoColorStudio" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0F1B3D" },
      { name: "yandex-verification", content: "b25213e4f1866e23" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", type: "image/png", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" },
    ],
    scripts: [
      { children: THEME_SCRIPT },
      { type: "application/ld+json", children: JSON.stringify(ORG_LD) },
      { type: "application/ld+json", children: JSON.stringify(SITE_LD) },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/admin") || pathname.startsWith("/login");
  useEffect(() => { if (!bare) logEvent("visit", pathname); }, [pathname, bare]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConsentProvider>
          {bare ? (
            <Outlet />
          ) : (
            <div className="flex min-h-screen flex-col">
              <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[70] focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Skip to content</a>
              <SiteHeader />
              <div className="mx-auto w-full max-w-7xl px-4"><AdSlot position="header" className="my-3" /></div>
              <main id="main" className="flex-1">
                <Outlet />
              </main>
              <SiteFooter />
              <div className="fixed inset-x-0 bottom-0 z-40 bg-background/95 md:hidden"><AdSlot position="mobile_sticky" className="my-1" /></div>
              <PromoPopup />
            </div>
          )}
          <GlobalScripts />
          <Toaster richColors position="top-center" />
        </ConsentProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

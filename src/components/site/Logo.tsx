import { Link } from "@tanstack/react-router";
import dark from "@/assets/logo-dark.webp.asset.json";
import light from "@/assets/logo-light.webp.asset.json";
import { cn } from "@/lib/utils";

/** Dark-text logo shows in light mode, white-text logo in dark mode (CSS-driven, no flash). */
export function LogoImage({ className }: { className?: string }) {
  return (
    <>
      <img src={dark.url} alt="LogoColorStudio" width={480} height={180} className={cn("h-9 w-auto dark:hidden", className)} />
      <img src={light.url} alt="LogoColorStudio" width={480} height={180} className={cn("hidden h-9 w-auto dark:block", className)} />
    </>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" aria-label="LogoColorStudio home" className="inline-flex shrink-0 items-center">
      <LogoImage className={className} />
    </Link>
  );
}

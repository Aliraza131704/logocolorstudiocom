import { useState } from "react";
import { brandLogoUrl, type Brand } from "@/lib/brands";
import { cn } from "@/lib/utils";

/** Brand logo from Logo.dev with a monogram fallback when the key or image is unavailable. */
export function BrandLogo({ brand, size = 256, className }: { brand: Brand; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  const url = brandLogoUrl(brand.domain, size);
  if (!url || failed) {
    return (
      <span
        role="img"
        aria-label={`${brand.name} logo`}
        className={cn("flex items-center justify-center rounded-xl text-2xl font-bold", className)}
        style={{ backgroundColor: brand.colors[0].hex, color: brand.colors.length > 1 ? brand.colors[1].hex : "#FFFFFF" }}
      >
        {brand.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={`${brand.name} logo`}
      loading="lazy"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cn("object-contain", className)}
    />
  );
}

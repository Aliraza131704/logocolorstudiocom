import type { ReactNode } from "react";
import { Breadcrumbs } from "./ui-bits";

export function CmsPage({ title, html, children }: { title: string; html?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
      {html && <article className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: html }} />}
      {children}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Check, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES, TRANSLATED_CODES, getLanguage, suggestLanguage, type LangCode } from "@/lib/languages";

/*
 * Whole-site automatic translation. English pages stay the original (and what
 * search engines index); a visitor who picks another language gets the page
 * translated in their browser by Google's website translator, which is only
 * loaded after they opt in.
 */

const CHOICE_KEY = "lcs-language";
const COOKIE = "googtrans";

function readCookieLang(): LangCode {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  const code = m ? decodeURIComponent(m[1]).split("/").pop() : "";
  return getLanguage(code)?.code ?? "en";
}

function clearCookie() {
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", host, `.${host}`, parts.length > 1 ? `.${parts.slice(-2).join(".")}` : ""];
  for (const d of domains) {
    document.cookie = `${COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
  }
}

export function applyLanguage(code: LangCode) {
  try { localStorage.setItem(CHOICE_KEY, code); } catch { /* storage blocked */ }
  clearCookie();
  if (code !== "en") document.cookie = `${COOKIE}=/en/${code}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}

/** Translation swaps text nodes React still owns; keep React from crashing when it removes or moves them. */
function guardDomForTranslation() {
  const w = window as unknown as { __lcsDomGuard?: boolean };
  if (w.__lcsDomGuard || typeof Node !== "function") return;
  w.__lcsDomGuard = true;
  const remove = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child;
    return remove.call(this, child) as T;
  };
  const insert = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node;
    return insert.call(this, node, ref) as T;
  };
}

function loadTranslator() {
  if (document.getElementById("lcs-translate-script")) return;
  const w = window as unknown as {
    googleTranslateElementInit?: () => void;
    google?: { translate?: { TranslateElement: new (opts: object, id: string) => unknown } };
  };
  w.googleTranslateElementInit = () => {
    const TE = w.google?.translate?.TranslateElement;
    if (TE) new TE({ pageLanguage: "en", includedLanguages: TRANSLATED_CODES.join(","), autoDisplay: false }, "google_translate_element");
  };
  const s = document.createElement("script");
  s.id = "lcs-translate-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}

function useCurrentLang() {
  const [lang, setLang] = useState<LangCode>("en");
  useEffect(() => { setLang(readCookieLang()); }, []);
  return lang;
}

/** Loads the translator only for visitors who chose a language other than English. */
export function TranslateLoader() {
  useEffect(() => {
    if (readCookieLang() === "en") return;
    guardDomForTranslation();
    loadTranslator();
  }, []);
  return <div id="google_translate_element" className="hidden" aria-hidden="true" />;
}

export function LanguageSwitcher() {
  const lang = useCurrentLang();
  const current = getLanguage(lang) ?? LANGUAGES[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 px-2 notranslate" translate="no" aria-label={`Language: ${current.english}. Change language`}>
          <Globe />
          <span className="text-xs font-semibold uppercase">{current.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 notranslate" translate="no">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {LANGUAGES.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => { if (l.code !== lang) applyLanguage(l.code); }} className="justify-between">
            <span>
              <span dir={l.rtl ? "rtl" : undefined}>{l.native}</span>
              {l.native !== l.english && <span className="ml-2 text-xs text-muted-foreground">{l.english}</span>}
            </span>
            {l.code === lang && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Asks visitors from a matching region whether they want the site in their language. */
export function LanguagePrompt() {
  const [offer, setOffer] = useState<LangCode | null>(null);

  useEffect(() => {
    let chosen: string | null = null;
    try { chosen = localStorage.getItem(CHOICE_KEY); } catch { /* storage blocked */ }
    if (chosen || readCookieLang() !== "en") return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const suggestion = suggestLanguage(navigator.languages?.length ? navigator.languages : [navigator.language], tz);
    if (!suggestion) return;
    const t = window.setTimeout(() => setOffer(suggestion), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const lang = getLanguage(offer);
  if (!lang) return null;

  const keepEnglish = () => {
    try { localStorage.setItem(CHOICE_KEY, "en"); } catch { /* storage blocked */ }
    setOffer(null);
  };

  return (
    <div
      role="dialog"
      aria-label="Choose language"
      translate="no"
      className="notranslate fixed right-3 top-20 z-[55] w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border glass p-4 shadow-soft sm:right-6"
    >
      <button type="button" onClick={keepEnglish} aria-label="Close" className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Globe className="size-5" /></span>
        <div className="min-w-0">
          <p className="font-semibold leading-snug" dir={lang.rtl ? "rtl" : undefined} lang={lang.code}>{lang.prompt}</p>
          <p className="mt-1 text-xs text-muted-foreground">View this website in {lang.english}?</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="hero" onClick={() => applyLanguage(lang.code)}>
          <span dir={lang.rtl ? "rtl" : undefined} lang={lang.code}>{lang.yes}</span>
        </Button>
        <Button size="sm" variant="outline" onClick={keepEnglish}>No, keep English</Button>
      </div>
    </div>
  );
}

/**
 * Site languages and region-based suggestion rules.
 * English is the original site language; every other language is an automatic
 * whole-page translation that a visitor opts into.
 */
export type LangCode = "en" | "ur" | "es" | "fr" | "de" | "it" | "pt" | "nl" | "pl";

export type SiteLanguage = {
  code: LangCode;
  /** Name written in the language itself. */
  native: string;
  english: string;
  /** Question shown to a visitor whose region matches this language. */
  prompt: string;
  yes: string;
  rtl?: boolean;
};

export const LANGUAGES: SiteLanguage[] = [
  { code: "en", native: "English", english: "English", prompt: "View this website in English?", yes: "Yes, English" },
  { code: "ur", native: "اردو", english: "Urdu", prompt: "کیا آپ یہ ویب سائٹ اردو میں دیکھنا چاہتے ہیں؟", yes: "ہاں، اردو میں دکھائیں", rtl: true },
  { code: "es", native: "Español", english: "Spanish", prompt: "¿Quieres ver este sitio web en español?", yes: "Sí, en español" },
  { code: "fr", native: "Français", english: "French", prompt: "Voulez-vous voir ce site en français ?", yes: "Oui, en français" },
  { code: "de", native: "Deutsch", english: "German", prompt: "Möchten Sie diese Website auf Deutsch sehen?", yes: "Ja, auf Deutsch" },
  { code: "it", native: "Italiano", english: "Italian", prompt: "Vuoi vedere questo sito in italiano?", yes: "Sì, in italiano" },
  { code: "pt", native: "Português", english: "Portuguese", prompt: "Quer ver este site em português?", yes: "Sim, em português" },
  { code: "nl", native: "Nederlands", english: "Dutch", prompt: "Wilt u deze website in het Nederlands bekijken?", yes: "Ja, in het Nederlands" },
  { code: "pl", native: "Polski", english: "Polish", prompt: "Czy chcesz zobaczyć tę stronę po polsku?", yes: "Tak, po polsku" },
];

export const TRANSLATED_CODES = LANGUAGES.filter((l) => l.code !== "en").map((l) => l.code);

export function getLanguage(code: string | null | undefined): SiteLanguage | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

/** Time zones that tell us the visitor's region when the browser language is English. */
const TIMEZONE_LANGUAGE: Record<string, LangCode> = {
  "Asia/Karachi": "ur",
  "Europe/Madrid": "es",
  "Atlantic/Canary": "es",
  "Africa/Ceuta": "es",
  "Europe/Paris": "fr",
  "Europe/Monaco": "fr",
  "Europe/Luxembourg": "fr",
  "Europe/Berlin": "de",
  "Europe/Busingen": "de",
  "Europe/Vienna": "de",
  "Europe/Zurich": "de",
  "Europe/Vaduz": "de",
  "Europe/Rome": "it",
  "Europe/San_Marino": "it",
  "Europe/Vatican": "it",
  "Europe/Lisbon": "pt",
  "Atlantic/Madeira": "pt",
  "Atlantic/Azores": "pt",
  "Europe/Amsterdam": "nl",
  "Europe/Brussels": "nl",
  "Europe/Warsaw": "pl",
};

/**
 * Which language to offer a visitor, or null when English fits (USA, UK and
 * everyone else whose browser and region are English or unsupported).
 * The browser's preferred non-English language wins; otherwise the region
 * (time zone) decides, so an English browser in Pakistan is offered Urdu.
 */
export function suggestLanguage(browserLanguages: readonly string[], timeZone: string | undefined): LangCode | null {
  const first = browserLanguages[0]?.toLowerCase().split("-")[0];
  if (first && first !== "en") {
    const match = TRANSLATED_CODES.find((c) => c === first);
    if (match) return match;
  }
  const byRegion = timeZone ? TIMEZONE_LANGUAGE[timeZone] : undefined;
  return byRegion ?? null;
}

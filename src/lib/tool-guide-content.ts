import type { Faq } from "@/components/site/ui-bits";

export type ToolGuideContent = { title: string; intro: string[]; steps: string[]; features: string[]; sections: { title: string; paragraphs: string[] }[]; faqs: Faq[]; images: string[]; related: string[] };

export const TOOL_GUIDES: Record<string, ToolGuideContent> = {
  "website-extractor": {
    "title": "Free Website Color Extractor – Find Colors, Fonts & Logo",
    "intro": [
      "A website’s visual identity is spread across backgrounds, buttons, headings, borders and small details. The Website Color Extractor brings publicly visible style information together so you can start a brand review with concrete color values rather than guesses from a screenshot. Enter a public address to inspect the colors, font-family names and available logo signals in its page and stylesheets.",
      "The result is a starting inventory, not a complete design specification. It describes the source files that were retrieved, rather than the finished browser rendering. A frequently repeated gray may rank above the main brand accent; a distinctive color inside a photograph may not appear at all. Combining these results with a visual review gives you a more useful picture of the site’s identity."
    ],
    "steps": [
      "Choose a representative public page, such as the homepage or a product page, and copy its address.",
      "Paste the address into the field above and select Extract. If access is blocked, use another public page rather than a private login URL.",
      "Review the returned title, address and available logo or favicon to confirm you inspected the intended site.",
      "Compare the color swatches and occurrence counts with what you see on the original page. Separate accents from neutral backgrounds and borders.",
      "Review the detected font-family names, then choose the colors you actually need instead of assuming every returned value is a brand token.",
      "Copy or export the selected values, and use the Contrast Checker before putting them into text, buttons or a new interface."
    ],
    "features": [
      "Public URL input without uploading a screenshot.",
      "Server-side retrieval rather than cross-site browser requests.",
      "Inspection of page HTML and inline style content.",
      "Reading of up to five linked stylesheets.",
      "HEX and RGB color recognition.",
      "Color values normalized into HEX swatches.",
      "Occurrence counts for detected colors.",
      "Copyable HEX, RGB and HSL representations.",
      "Detected font-family names.",
      "Logo or favicon signals when available.",
      "Theme-color metadata when supplied by the page.",
      "CSS, SCSS, Tailwind and JSON export of the leading colors."
    ],
    "sections": [
      {
        "title": "What a color occurrence count actually means",
        "paragraphs": [
          "The number beside a swatch counts recognized color expressions in the inspected style text. It does not measure how many pixels use that color, how many visitors see it, or how important it is to the brand. A border shade repeated in many component rules can have a higher count than the single accent used for the main purchase button.",
          "For example, an ecommerce homepage might repeat a light gray in dozens of separators and declare its green purchase-button color once. Keep both observations: the neutral helps recreate the interface’s structure, while the green conveys the action hierarchy. Avoid rebuilding a brand palette by simply choosing the first five results without reviewing their roles."
        ]
      },
      {
        "title": "Fonts, logos and missing information",
        "paragraphs": [
          "Font results are names found in style declarations, not downloadable font files or proof that a typeface finished loading in a visitor’s browser. A font stack can contain a custom family, a fallback family and a generic category such as sans-serif. Check the page visually and confirm the appropriate font licence before using a named typeface in another project.",
          "Likewise, a logo or favicon is a public identification signal rather than a guarantee that the asset is the primary wordmark. A site may use several logos, choose a different one in dark mode, or render its identity using scripts or vector markup. The extractor may return a small favicon when a full logo is not discoverable."
        ]
      },
      {
        "title": "Practical workflows for designers and developers",
        "paragraphs": [
          "Designers can use the initial inventory to prepare a redesign discussion: preserve the recognized accent, simplify inconsistent neutrals and document which values belong to text or surfaces. Developers can compare a proposed implementation with public styles, then map raw values to semantic names such as primary, surface and border. The export provides values; it does not automatically decide those roles.",
          "Marketers can check a partner’s visual identity before creating a joint campaign and flag mismatched colors before production. SEO professionals can pair the style review with the Website Auditor for a separate assessment of inspectable page signals. Neither workflow should mistake a color inventory for an accessibility certification or a technical site audit."
        ]
      },
      {
        "title": "CSS variables and rendered-style limitations",
        "paragraphs": [
          "Modern sites often use CSS custom properties, imported stylesheets, component-scoped rules and JavaScript-generated styling. A token may be defined in one file and referenced in another. This bounded scan does not resolve every cascade, conditional rule or runtime value, so colors or fonts can be missing even when they are obvious on screen.",
          "For a precise implementation review, inspect the relevant element’s computed styles in browser developer tools. Compare its actual foreground and background with the extracted values. This is especially important for gradients, transparent layers, hover states and dark mode, where the final appearance depends on more than a single literal color expression."
        ]
      },
      {
        "title": "Responsible brand research and reuse",
        "paragraphs": [
          "Public availability does not grant ownership of a logo, font or other design asset. Use extracted values for research, approved client work or a fresh design system, and confirm permissions before reproducing another organization’s identity. The tool retrieves permitted public pages; it cannot enter accounts, complete challenges or read content behind a sign-in.",
          "If a scan returns little information, check the address and whether the site loads normally without authentication. An access block or script-heavy page is a limitation of this inspection method, not proof that the website lacks a design system. Record what was found and what remains uncertain rather than filling the gaps with invented values."
        ]
      }
    ],
    "faqs": [
      {
        "q": "Is the Website Color Extractor free?",
        "a": "Yes. You can inspect a public website without creating an account; fair-use request limits apply."
      },
      {
        "q": "Where do the colors come from?",
        "a": "The tool reads the page HTML and up to five linked stylesheets, recognizes HEX and RGB values, and ranks normalized colors by occurrence."
      },
      {
        "q": "Do counts measure visible screen area?",
        "a": "No. Counts describe occurrences in the retrieved styles, not rendered pixels or brand importance."
      },
      {
        "q": "Does it detect every CSS variable?",
        "a": "No. It does not fully resolve the CSS cascade, nested imports, conditional rules or JavaScript-generated styles."
      },
      {
        "q": "Can it extract colors from images?",
        "a": "Not in this URL scan. Use the Logo Extractor with an image to sample image colors."
      },
      {
        "q": "Why is a gray ranked above the brand color?",
        "a": "Neutral colors are often repeated across many style rules. Select brand accents by reviewing their actual visual role."
      },
      {
        "q": "Are font files included?",
        "a": "No. The result lists detected family names. It does not download fonts or grant a font licence."
      },
      {
        "q": "Why does the logo look like a small icon?",
        "a": "A favicon may be the only discoverable identity asset. Script-rendered or alternate logos may not be found."
      },
      {
        "q": "Can it inspect a site behind a login?",
        "a": "No. It only reads publicly accessible pages and cannot sign into another website."
      },
      {
        "q": "What can I export?",
        "a": "The leading colors can be exported as CSS variables, SCSS, Tailwind configuration or JSON."
      },
      {
        "q": "How do I check extracted color accessibility?",
        "a": "Test each actual text/background pair in the Contrast Checker. A palette by itself has no single contrast score."
      },
      {
        "q": "Why does a scan fail?",
        "a": "An invalid address, unavailable page, access restriction or automated-request block can prevent retrieval. Try a representative public page."
      }
    ],
    "images": [
      "guide-website-extract.jpg",
      "guide-web-palette.jpg"
    ],
    "related": [
      "logo-extractor",
      "contrast-checker",
      "theme-generator",
      "export-center"
    ]
  },
  "contrast-checker": {
    "title": "Free Color Contrast Checker – WCAG 2.2 Accessibility Test",
    "intro": [
      "A beautiful palette is only useful when people can read the content it carries. The Color Contrast Checker compares a foreground color with a background color using relative luminance, then shows the ratio alongside WCAG AA and AAA text results. The live preview makes it easier to judge headings, body copy and small labels in context.",
      "Contrast is one part of accessibility, not a complete accessibility verdict. A passing pair cannot confirm that a page has meaningful headings, keyboard access, readable focus indicators or accessible forms. Use the result as evidence for a specific color combination, and review the complete interface with its real text sizes, backgrounds and interaction states."
    ],
    "steps": [
      "Identify the foreground and background of the exact element you want to test, not just two colors from a general palette.",
      "Enter the HEX values or select colors using the text and background pickers.",
      "Read the ratio and the separate AA and AAA results for normal and large text.",
      "Compare the live preview with the intended font size and weight. Small captions need the normal-text threshold.",
      "If the pair fails AA normal text, try the suggested foreground or choose a different text/background pairing while retaining the original brand colors elsewhere.",
      "Retest the real element’s default, focus, hover and disabled states, especially when images, transparency or overlays change the background."
    ],
    "features": [
      "Text color HEX input.",
      "Background color HEX input.",
      "Visual color pickers.",
      "Instant relative-luminance calculation.",
      "Contrast ratios from 1:1 to 21:1.",
      "AA normal-text result.",
      "AA large-text result.",
      "AAA normal-text result.",
      "AAA large-text result.",
      "Foreground/background swap.",
      "Live heading, body and caption preview.",
      "Suggested foreground adjustment for failing AA normal-text pairs."
    ],
    "sections": [
      {
        "title": "WCAG AA, AAA and large text",
        "paragraphs": [
          "WCAG 2.2 keeps the familiar contrast requirements from WCAG 2.1. Success Criterion 1.4.3 requires at least 4.5:1 for normal text at level AA and 3:1 for large text. Success Criterion 1.4.6 raises the thresholds to 7:1 and 4.5:1 at level AAA. A pair that passes large-text AA can still fail for the smaller text beside it.",
          "Large text means at least 18 points regular or 14 points bold, commonly equivalent to 24 CSS pixels regular or about 18.67 CSS pixels bold. Do not treat a visually prominent label as large merely because it is uppercase. Check the actual computed size and weight, and remember that thin fonts can remain difficult to read even when the calculated ratio passes."
        ]
      },
      {
        "title": "Non-text contrast and interface states",
        "paragraphs": [
          "Success Criterion 1.4.11 covers visual information needed to identify user-interface components and meaningful graphics, with a 3:1 threshold against adjacent colors where the criterion applies. The four badges above describe text criteria; they do not automatically inspect icons, chart boundaries or the full structure of a control.",
          "Test meaningful icon strokes and component boundaries against their actual neighboring surfaces. A keyboard focus indicator must also be evaluated in context, including whether it is visible and obscured. Disabled controls and decorative graphics have specific exceptions, but exceptions should not become a reason to make important information unnecessarily hard to perceive."
        ]
      },
      {
        "title": "Keeping brand colors without sacrificing readability",
        "paragraphs": [
          "Bright accents often work better as filled surfaces with a dark foreground than as small text on white. Preserve an orange or green brand value for a banner, marker or decorative detail, then select a readable text color for the information it carries. Changing the role of a color is often more appropriate than changing the approved brand palette.",
          "Consider a product button using a bright accent: first compare dark text on the accent and light text on the same accent. Choose the pairing that satisfies the intended text criterion, then verify the outline, neighboring background and focus state separately. Never communicate errors or status only by changing red to green; include a label or meaningful symbol."
        ]
      },
      {
        "title": "How the ratio is calculated",
        "paragraphs": [
          "The calculation converts sRGB color channels into linear-light values, combines them into relative luminance, and divides the lighter luminance plus 0.05 by the darker luminance plus 0.05. Equal colors produce 1:1; black and white produce 21:1. The ratio expresses luminance contrast rather than how different the hues look.",
          "The screen displays a rounded ratio, but threshold decisions use the underlying value. A number that rounds to 4.50 may still sit just below 4.5. This checker uses opaque color inputs. It does not combine transparent text with images or simulate every pixel beneath a gradient, so calculate the effective pair or test the least-contrasting region yourself."
        ]
      },
      {
        "title": "Who benefits from a contrast review?",
        "paragraphs": [
          "Designers can validate palette roles before handing off a style guide, and developers can check the values used by actual components rather than relying on a screenshot. Marketers should test small text in promotion graphics and landing pages, while content teams should check links, captions and information shown on colored banners.",
          "For SEO and quality reviews, record the affected element, its two colors, text size and result instead of giving an entire website a blanket pass. Pair the color test with keyboard checks, screen-reader review and real-device reading. Outdoor glare, low-quality displays and reduced vision make strong contrast useful far beyond formal compliance."
        ]
      }
    ],
    "faqs": [
      {
        "q": "What ratio does AA normal text need?",
        "a": "At least 4.5:1 under WCAG 1.4.3."
      },
      {
        "q": "What ratio does AA large text need?",
        "a": "At least 3:1, with large text defined by its actual size and weight."
      },
      {
        "q": "What ratio does AAA need?",
        "a": "7:1 for normal text and 4.5:1 for large text under WCAG 1.4.6."
      },
      {
        "q": "What counts as large text?",
        "a": "At least 24 CSS pixels regular or about 18.67 CSS pixels bold, equivalent to 18pt or 14pt bold."
      },
      {
        "q": "Did WCAG 2.2 change the text thresholds?",
        "a": "No. These text-contrast thresholds are the same as in WCAG 2.1."
      },
      {
        "q": "Do icons need contrast checks?",
        "a": "Meaningful graphics and the information needed to identify controls generally need 3:1 against adjacent colors under WCAG 1.4.11, with exceptions."
      },
      {
        "q": "Can I keep my brand colors?",
        "a": "Yes. Keep the approved values and choose readable foregrounds or different roles instead of assuming every brand color works as body text."
      },
      {
        "q": "Does passing contrast prove accessibility?",
        "a": "No. Contrast is only one requirement; keyboard access, labels, structure and interaction also need review."
      },
      {
        "q": "Are transparent colors supported?",
        "a": "The inputs represent opaque colors. Determine the final composited foreground and background before testing transparent designs."
      },
      {
        "q": "Can a rounded 4.50 ratio still fail?",
        "a": "Yes. Threshold decisions use the unrounded value; a slightly lower value may round to 4.50."
      },
      {
        "q": "Is the suggested fix the mathematically closest color?",
        "a": "No. It is an iterative lightness adjustment toward a more contrasting foreground, not an exhaustive nearest-color search."
      },
      {
        "q": "Should I test dark mode separately?",
        "a": "Yes. Every mode and meaningful state can have different foreground/background pairs."
      }
    ],
    "images": [
      "guide-contrast-check.jpg",
      "guide-accessibility.jpg"
    ],
    "related": [
      "theme-generator",
      "palette-generator",
      "logo-extractor",
      "website-auditor"
    ]
  },
  "theme-generator": {
    "title": "Free UI Theme Generator – Light & Dark Themes From Brand Colors",
    "intro": [
      "A brand palette is not yet an interface theme. A usable interface also needs backgrounds, surfaces, readable text, muted content, borders and foregrounds for action colors. The Theme Generator creates a practical starting set from a primary color and an accent, with separate light and dark values and a preview of common interface elements.",
      "The generated values are proposals for a design system, not a promise that every possible component meets accessibility requirements. Review the displayed ratios, copy the variables, and test the actual combinations used in your product. Approved brand colors remain your reference; derived surface and foreground roles help apply them coherently."
    ],
    "steps": [
      "Start with the palette saved by another color tool in this browser, or choose a primary color and an accent manually.",
      "Review the token list to distinguish background, surface, foreground, muted, border and action roles.",
      "Select Light to inspect the lighter surfaces, text, buttons and card examples.",
      "Select Dark and compare how the same identity behaves on darker surfaces.",
      "Read the displayed text-on-background and button ratios, then test additional pairs in the Contrast Checker.",
      "Copy the CSS variables and adapt their usage to your project’s theme conventions before applying them to production components."
    ],
    "features": [
      "Primary brand-color picker.",
      "Independent accent-color picker.",
      "Previously saved browser palette as a starting point.",
      "Separate light-theme values.",
      "Separate dark-theme values.",
      "Hue-tinted page backgrounds.",
      "Surface and foreground tokens.",
      "Muted-text and border tokens.",
      "Primary and primary-foreground pairing.",
      "Accent and accent-foreground pairing.",
      "Live navigation, heading, button and card preview.",
      "Copyable CSS for both :root and .dark."
    ],
    "sections": [
      {
        "title": "Raw palette colors versus semantic design tokens",
        "paragraphs": [
          "A raw token names a value, such as brand-blue. A semantic token names its purpose, such as primary or foreground. Components should usually depend on the purpose: a button can use primary and primary-foreground without knowing whether the current brand is blue, green or red. This separation makes it easier to maintain several visual themes without rewriting every component.",
          "The generator supplies a compact semantic starting set. It does not create every token a complex product needs, such as success, warning, destructive, selected states, charts or focus rings. Add those roles deliberately and document which foreground accompanies each surface. Avoid using one accent for every unrelated meaning simply because it is available."
        ]
      },
      {
        "title": "How the light and dark values are derived",
        "paragraphs": [
          "Background and text colors use the primary hue with adjusted HSL saturation and lightness. The light version combines a pale tinted page background with a white surface, while the dark version uses deeper tinted backgrounds and surfaces. Muted text and borders have their own values rather than inheriting the action color.",
          "A sufficiently dark primary color is lightened for the dark-theme proposal so that it remains visible against deep surfaces. Button and accent foregrounds are selected separately using contrast. These derived values belong to the proposed theme; they do not replace the source brand palette or imply that a published logo should be recolored."
        ]
      },
      {
        "title": "Dark mode is more than inverting white and black",
        "paragraphs": [
          "A straight inversion can make photographs unnatural, destroy visual hierarchy and create harsh bright areas. Instead, compare the difference between the page background and raised surfaces, keep primary text comfortably readable, and use muted text for genuinely secondary content. Important instructions should not become low-contrast merely because they are less prominent.",
          "Test logos, illustrations, shadows, dividers and controls in both modes. A transparent logo designed for a pale background may need its approved light-text variant on a dark surface. Consider the system color preference and the user’s choice when implementing a mode switch, but keep that behavior separate from the exported color values."
        ]
      },
      {
        "title": "Integrating with CSS, Tailwind and component systems",
        "paragraphs": [
          "The exported :root block holds light values; the .dark block holds dark values. Those selectors define variables but do not add a switch or automatically connect them to every component. A declaration can reference a token with var(--background), provided the token name and expected value format match the surrounding stylesheet.",
          "Tailwind and shadcn-based projects differ in how they map theme variables. Some expect full color values, others expect HSL channels, OKLCH values or named aliases. This export uses HEX values. Inspect your existing conventions and adapt the mapping rather than pasting values into an incompatible format. Use the Export Center when you need a raw palette in another file format."
        ]
      },
      {
        "title": "A practical handoff and validation checklist",
        "paragraphs": [
          "Designers should attach the generated theme to examples of real content, not only empty boxes. Developers should check long labels, disabled controls, selected states and focus indicators. Marketers can compare campaign pages in both modes, while SEO and content teams should verify that important links and explanatory text remain legible on each surface.",
          "Only two pair ratios are summarized in this preview. Muted text, borders, accent text, controls and any additional states still need their own checks. Record decisions as semantic roles and test against representative screens. The result is strongest when used as a repeatable starting point followed by an explicit accessibility review."
        ]
      }
    ],
    "faqs": [
      {
        "q": "What does the Theme Generator create?",
        "a": "A starting set of background, surface, foreground, muted, border, primary, accent and paired foreground variables for light and dark modes."
      },
      {
        "q": "Where do the starting colors come from?",
        "a": "The latest saved palette in this browser can provide the primary and accent; you can edit both with the pickers."
      },
      {
        "q": "Does it change my original brand palette?",
        "a": "No. It proposes derived theme values; the approved source colors remain your reference."
      },
      {
        "q": "Why can the dark-mode primary be lighter?",
        "a": "A dark primary is lightened in the generated dark theme to help distinguish it from deep surfaces."
      },
      {
        "q": "Are all generated combinations guaranteed to pass AA?",
        "a": "No. Review the shown ratios and test every actual pair, including muted text, accents and additional states."
      },
      {
        "q": "Does the preview check borders and focus indicators?",
        "a": "No. The displayed ratios summarize text on background and the primary button pair."
      },
      {
        "q": "How do I switch preview modes?",
        "a": "Select Light or Dark above the token list."
      },
      {
        "q": "Does copying CSS add a dark-mode toggle?",
        "a": "No. The CSS defines values for :root and .dark; your application must handle mode selection separately."
      },
      {
        "q": "Can I use the export with Tailwind?",
        "a": "Yes, after mapping the HEX variables to the color conventions used by your Tailwind setup."
      },
      {
        "q": "Can I paste the values directly into every shadcn theme?",
        "a": "Not always. Some themes expect HSL channels or OKLCH values; adapt the export to the expected format."
      },
      {
        "q": "Are success and error tokens generated?",
        "a": "No. Add those semantic roles separately and validate their foreground/background pairs."
      },
      {
        "q": "How do I validate a custom pair?",
        "a": "Use the Contrast Checker with the exact foreground and background values from your implementation."
      }
    ],
    "images": [
      "guide-theme-generate.jpg",
      "guide-dark-mode.jpg"
    ],
    "related": [
      "contrast-checker",
      "export-center",
      "palette-generator",
      "logo-extractor"
    ]
  },
  "shopify-theme-detector": {
    "title": "Free Shopify Theme Detector – Find a Store’s Theme & Apps",
    "intro": [
      "A storefront can offer useful clues about its theme without revealing the merchant’s private administration area. The Shopify Theme Detector inspects public storefront information to identify Shopify signals, visible theme metadata and recognized integrations. It is useful when researching a design, planning a migration or checking the starting point for an approved client project.",
      "Results describe what the storefront exposes. Merchants can rename themes, customize templates, remove metadata or use a headless front end. A recognizable theme name does not mean that installing the same theme will reproduce every page, app feature or custom section. Treat the report as a research lead and confirm it before choosing a theme or purchasing a licence."
    ],
    "steps": [
      "Copy a public storefront address rather than a merchant-admin or checkout account URL.",
      "Enter it above and select Detect theme. Let the tool inspect the returned page.",
      "Confirm whether Shopify signals were found before interpreting the theme fields.",
      "Compare the displayed theme name with Based on, version and Theme Store ID when available.",
      "Review the detected integrations as visible examples, not a complete list of installed apps.",
      "Use the available Theme Store search link as a research lead, confirm the exact product, and review its official demo and licensing terms."
    ],
    "features": [
      "Public storefront URL input.",
      "Shopify platform signals.",
      "Visible theme-name detection.",
      "Theme identifier when exposed.",
      "Theme Store identifier when exposed.",
      "Schema-name metadata when available.",
      "Schema-version metadata when available.",
      "Theme role when supplied.",
      "Headless and architecture clues.",
      "Available shop, locale and currency details.",
      "Recognized storefront app integrations.",
      "Theme Store search reference when theme metadata is available."
    ],
    "sections": [
      {
        "title": "Theme name, theme ID and Theme Store ID",
        "paragraphs": [
          "The merchant-facing theme name may be customized, so it can say something like Summer Launch rather than the original product name. The theme ID identifies an instance in a store; it is not a universal marketplace identifier. A Theme Store ID, when present, points to the theme product rather than a particular merchant’s customized copy.",
          "Based on and version fields rely on exposed metadata. A missing field means that the scanner did not retrieve a dependable value, not that the store has no underlying theme. Do not turn a theme ID into a marketplace guess or assume that a name matching a popular theme proves it is an unmodified official copy."
        ]
      },
      {
        "title": "Manual inspection of Shopify storefront signals",
        "paragraphs": [
          "In a browser, open the public page source and search for Shopify.theme or Shopify-related asset paths. The theme object can contain a name, role, ID or Theme Store ID. Other storefront metadata may expose a schema name and version. Compare the evidence with the detector rather than searching for a theme name purely by appearance.",
          "Public source inspection is not the same as opening the merchant’s editor. It cannot reveal private settings, draft theme changes or every custom section. If you own or manage the store, your theme library and supplier records are more authoritative than third-party fingerprints. Use public detection mainly when those direct records are unavailable."
        ]
      },
      {
        "title": "App detection and its boundaries",
        "paragraphs": [
          "The app list recognizes public script or asset signatures associated with known integrations. Examples include email marketing, reviews, subscriptions and other storefront services. A signature suggests that the integration appears in the inspected page, not that every feature is active or that a specific billing plan is installed.",
          "Apps that run only in the merchant admin, checkout extensions, server-side automation or pages outside the scanned URL can be invisible. Conversely, a script left behind after an app was removed may still appear. Review functionality on the actual store and ask the owner for the installed-app inventory when planning an integration or migration."
        ]
      },
      {
        "title": "Online Store 2.0 and headless storefronts",
        "paragraphs": [
          "Online Store 2.0 supports a flexible theme architecture, but version and architecture labels derived from public source are clues rather than a complete compatibility audit. A merchant can customize a theme heavily, and the visible homepage alone does not describe all template or section capabilities.",
          "Headless storefronts separate the commerce service from the customer-facing implementation. A Hydrogen or other custom front end may use Shopify for products and checkout without a traditional storefront theme to identify. In that situation, a Shopify platform signal and an unknown theme can both be correct. Use the CMS Detector to investigate additional public technology clues."
        ]
      },
      {
        "title": "Choosing a theme responsibly",
        "paragraphs": [
          "Designers can use a report to shortlist layouts and then compare official demos for typography, navigation and product presentation. Developers should check the exact features, customization effort, accessibility and app compatibility before estimating work. Marketers can research public campaign patterns without assuming that the detected apps explain a store’s performance.",
          "A theme lookup does not provide the theme files, a purchase entitlement or permission to copy another store’s branding. Buy or obtain a licence from the legitimate supplier when required. SEO professionals should assess actual titles, content, links and crawlability separately: a recognizable theme name alone says little about search visibility or site quality."
        ]
      }
    ],
    "faqs": [
      {
        "q": "Is the Shopify Theme Detector free?",
        "a": "Yes. Public storefront checks do not require an account; fair-use request limits apply."
      },
      {
        "q": "How is the theme identified?",
        "a": "The tool reads public Shopify signals and exposed theme metadata, including Shopify.theme when available."
      },
      {
        "q": "Why is the name customized?",
        "a": "Merchants can rename the theme instance. Based-on metadata may help identify the original theme if exposed."
      },
      {
        "q": "Is a theme ID the same as a Theme Store ID?",
        "a": "No. A theme ID identifies a store’s theme instance; a Theme Store ID identifies a marketplace theme."
      },
      {
        "q": "Why is the version missing?",
        "a": "The store may not expose dependable version metadata in the retrieved public page."
      },
      {
        "q": "Does a missing Theme Store ID prove the theme is custom?",
        "a": "No. Missing metadata alone cannot establish the theme’s origin."
      },
      {
        "q": "Can I get the same theme?",
        "a": "Use the Theme Store search reference, then confirm the exact product or supplier with the merchant. The link is not a verified product listing, and detection does not grant a licence."
      },
      {
        "q": "Are all apps detected?",
        "a": "No. Only recognized public storefront signatures can be found; private, backend-only or other-page integrations can be missed."
      },
      {
        "q": "Can a removed app still appear?",
        "a": "Yes. Leftover public scripts can remain after an integration is no longer actively used."
      },
      {
        "q": "Can a headless Shopify store have no detectable theme?",
        "a": "Yes. A headless front end may not use a traditional Shopify storefront theme."
      },
      {
        "q": "Does it access the merchant admin?",
        "a": "No. It reads public pages and does not sign into a Shopify account."
      },
      {
        "q": "Does matching a theme recreate the store?",
        "a": "No. Custom code, content, assets and integrations can make the implementation substantially different from the original theme."
      }
    ],
    "images": [
      "guide-shopify-detect.jpg",
      "guide-shopify-apps.jpg"
    ],
    "related": [
      "cms-detector",
      "website-extractor",
      "wordpress-theme-detector",
      "website-auditor"
    ]
  },
  "wordpress-theme-detector": {
    "title": "Free WordPress Theme Detector – Find Themes & Plugins",
    "intro": [
      "The WordPress Theme Detector investigates the public files and metadata that reveal how a WordPress website is presented. It can report visible theme folders, readable theme headers, parent-theme information and plugin assets. This helps you begin design research or a client handover with evidence instead of trying to recognize a template from its appearance alone.",
      "WordPress sites can hide, rename or combine their assets, so no public detector can promise a complete inventory. A theme record may be partial and a plugin list may omit tools that only run in the dashboard. Read missing fields as unknowns, then confirm important details with the site owner or original developer when the work depends on them."
    ],
    "steps": [
      "Copy a representative public website address and enter it into the detector.",
      "Select Detect theme and check whether WordPress was identified from the returned page.",
      "Review each discovered theme folder and the available name, author, version and theme URI.",
      "Look for a parent-theme value to understand whether a child theme is involved.",
      "Review visible plugins, page-builder clues and other available site information without treating the list as exhaustive.",
      "Follow supplier or directory references, confirm the intended product and licence, and verify details with the owner before implementing changes."
    ],
    "features": [
      "Public URL scanning.",
      "WordPress platform signals.",
      "Visible theme-folder extraction.",
      "Readable style.css header parsing.",
      "Theme name when exposed.",
      "Theme version when exposed.",
      "Author and author-link metadata.",
      "Theme homepage metadata.",
      "Parent-template metadata.",
      "Available licence and required-version fields.",
      "Public plugin and page-builder signatures.",
      "WordPress directory lookup references."
    ],
    "sections": [
      {
        "title": "Reading a WordPress theme manually",
        "paragraphs": [
          "Public pages often reference assets under /wp-content/themes/theme-folder/. Search the source for that path to identify a folder, then inspect a publicly accessible style.css file where appropriate. A theme header can include Theme Name, Theme URI, Author, Version, License and Template. Those fields are supplied by the theme’s author or modifier.",
          "A folder name is useful evidence but not a guaranteed product name. An agency may rename it, and optimization can move assets into combined files or CDN paths. A readable header improves identification, but even that metadata can be edited. If you manage the site, the installed theme library and deployment records are better sources of truth."
        ]
      },
      {
        "title": "Parent themes and child themes",
        "paragraphs": [
          "A child theme inherits from a parent while providing its own styles, templates or functions. The Template field in its stylesheet names the parent directory. This arrangement can preserve custom work during parent-theme updates, but it does not automatically make every modification safe or compatible with a new release.",
          "Multiple theme paths may appear because a child theme loads parent assets. Their presence alone does not prove which templates produced every element on the page. Review the parent relationship rather than assuming that the first discovered folder is the sole active theme. A missing Template field or unreadable stylesheet should be treated cautiously."
        ]
      },
      {
        "title": "Themes, plugins and page builders do different jobs",
        "paragraphs": [
          "Themes control presentation, plugins add features, and page builders provide editing or layout systems that may work across several themes. A store could combine a lightweight theme, WooCommerce and a visual builder. Finding only the theme would not explain its checkout behavior, review widgets or custom content structure.",
          "Plugin detection uses public file paths and known page signals. Backend-only tools, optimization settings, private integrations and plugins used on other pages may leave no visible signature in the scanned page. Version-like query strings can describe an asset cache value instead of a trustworthy installed software version; verify before making maintenance or security decisions."
        ]
      },
      {
        "title": "Directory references and premium products",
        "paragraphs": [
          "A directory link can help look up a recognizable slug on WordPress.org, but not every theme or plugin is distributed there. Premium products, private agency work and renamed folders may have no matching entry. Use the theme’s author or homepage metadata as another research lead, and confirm that a destination represents the exact product before acting.",
          "Detection does not distribute theme files or grant a premium licence. Nor does it prove that a site’s copy receives updates or support. Obtain products from their legitimate supplier and preserve any required licence notices. If you are rebuilding a design, use original assets and approved branding rather than copying the inspected site wholesale."
        ]
      },
      {
        "title": "Research workflows and practical limitations",
        "paragraphs": [
          "Designers can compare a theme’s official demo with a reference site to separate standard features from custom styling. Developers can use visible folders and builder clues to ask more focused handover questions. Marketers can investigate public integration patterns, while SEO professionals should audit page content and crawl signals independently from the detected theme.",
          "Security plugins, caching, renamed content paths, headless front ends and blocked requests can all reduce visibility. A failure to detect a theme does not mean WordPress is absent or that the site is unsafe. Record the available evidence, check another representative public page if needed, and avoid inferring vulnerabilities from a missing or uncertain version field."
        ]
      }
    ],
    "faqs": [
      {
        "q": "How does WordPress theme detection work?",
        "a": "The tool finds public theme paths and, where accessible, reads style.css header metadata."
      },
      {
        "q": "What is a child theme?",
        "a": "A child theme inherits from a parent; its Template header can identify the parent folder."
      },
      {
        "q": "Why can several themes appear?",
        "a": "Child and parent assets or other referenced theme files may both appear in the scanned page."
      },
      {
        "q": "Why is the theme name just a folder?",
        "a": "The stylesheet may be blocked, metadata may be hidden, or the folder may have been renamed."
      },
      {
        "q": "Can it identify all plugins?",
        "a": "No. Only plugins with recognizable public signals can be found; dashboard-only tools are usually invisible."
      },
      {
        "q": "Is a plugin version always reliable?",
        "a": "No. Public asset query strings or metadata may be incomplete, stale or unrelated to the installed version."
      },
      {
        "q": "What is the difference between a theme and a builder?",
        "a": "A theme supplies presentation; a builder supplies layout/editing features and may operate within many themes."
      },
      {
        "q": "Does every directory link identify a real listing?",
        "a": "No. It is a lookup reference; premium or custom products may not have a matching WordPress.org entry."
      },
      {
        "q": "Can it read the WordPress dashboard?",
        "a": "No. It only inspects public pages and accessible files."
      },
      {
        "q": "Does detection prove a vulnerability?",
        "a": "No. Software identification is not a vulnerability assessment; verify versions and security advisories separately."
      },
      {
        "q": "Can I download a premium theme from a result?",
        "a": "No. A result does not include files or licensing rights. Use the legitimate supplier."
      },
      {
        "q": "Why is WordPress not detected?",
        "a": "A headless setup, hidden paths, blocked request or limited public evidence can prevent a match."
      }
    ],
    "images": [
      "guide-wordpress-detect.jpg",
      "guide-wp-plugins.jpg"
    ],
    "related": [
      "cms-detector",
      "shopify-theme-detector",
      "website-extractor",
      "website-auditor"
    ]
  },
  "export-center": {
    "title": "Free Color Palette Exporter – CSS, Tailwind, SCSS & JSON",
    "intro": [
      "A palette should travel from a design conversation into implementation without being retyped by hand. The Export Center converts a set of colors into CSS variables, SCSS variables, a Tailwind configuration snippet, structured JSON or a labeled PNG. You can begin with the latest palette saved in this browser, then edit the values and choose a token prefix.",
      "The export is a portable set of raw color values rather than a complete component theme. It does not decide which shade belongs to an error message or guarantee accessible combinations. Establish semantic roles separately and check text/background pairs before using the exported values in an interface."
    ],
    "steps": [
      "Load the latest saved palette or edit the color values directly in the list.",
      "Add or remove swatches until the palette contains the colors you intend to distribute.",
      "Set a short token prefix that will be meaningful to your project and team.",
      "Choose CSS, SCSS, Tailwind or JSON in the export area and inspect the generated output.",
      "Copy the code or download the relevant file, then adapt its naming and integration to your project.",
      "Download the PNG for a visual handoff, and include usage notes or contrast checks separately when presenting a brand guide."
    ],
    "features": [
      "Latest browser palette loading.",
      "Editable color pickers.",
      "Editable HEX values.",
      "Add-color control.",
      "Remove-color control.",
      "One to ten swatches.",
      "Configurable token prefix.",
      "Live palette strip.",
      "CSS custom-property export.",
      "SCSS and Tailwind configuration export.",
      "JSON with HEX, RGB and HSL values.",
      "Labeled PNG for visual sharing."
    ],
    "sections": [
      {
        "title": "Choosing the right export format",
        "paragraphs": [
          "CSS custom properties work in modern browser stylesheets and can be referenced through var(). SCSS variables are resolved during Sass compilation and suit projects with that build pipeline. JSON provides data for scripts or token-processing workflows; the receiving application still needs to define how it uses that structure.",
          "The Tailwind export is a JavaScript configuration-style snippet. It is useful where the project accepts that configuration format, but it is not a universal setup for every Tailwind release. Tailwind v4 commonly uses CSS-first configuration; map the exported values into the conventions already used by your project rather than assuming the snippet alone completes integration."
        ]
      },
      {
        "title": "Raw values and semantic naming",
        "paragraphs": [
          "A numerical scale identifies swatches consistently, but it does not automatically order them by lightness or give them design meaning. Review the palette order and use names that help your team distinguish brand values from interface roles. A prefix such as brand can identify the source set; semantic roles such as primary, surface and foreground can reference those raw values.",
          "For example, a product button can depend on a primary token while the approved blue remains stored as a raw brand value. If the button’s usage changes, update the mapping instead of replacing the color everywhere. Do not label arbitrary swatches as warning or success unless you have checked the meaning and associated foregrounds in context."
        ]
      },
      {
        "title": "HEX, RGB and HSL in a development workflow",
        "paragraphs": [
          "HEX is compact and common in brand guides. RGB makes the red, green and blue channels explicit, while HSL expresses hue, saturation and lightness. These are representations of the same sRGB color, not different color themes. JSON includes converted values so a downstream tool can choose the representation it expects.",
          "HSL can be useful for exploratory adjustments, but equal steps in HSL lightness are not guaranteed to look equally bright. Exporting a color also does not convert it into a print-ready CMYK specification or predict how it appears on every monitor. Keep print approvals and calibrated color-management decisions separate from these screen-oriented values."
        ]
      },
      {
        "title": "Sharing a palette with another team",
        "paragraphs": [
          "Designers can attach the PNG to a presentation so recipients see the swatches and HEX labels without opening a configuration file. Developers can use the text exports to avoid manual transcription. Marketers can align campaign colors with an approved reference, while content and SEO teams should focus on readable headings, links and captions rather than treating a palette as a ranking factor.",
          "A complete handoff should name the palette, identify its approved source and describe intended roles. Add examples of foreground/background pairings and include any font or asset permissions separately. The PNG carries the visible palette; it does not embed a complete set of design-system rules, accessibility findings or print-production instructions."
        ]
      },
      {
        "title": "Validation before integration",
        "paragraphs": [
          "Inspect exported names and values before replacing an existing stylesheet. The prefix field accepts a restricted set of characters, but the output still needs to fit your naming scheme and build setup. Check for collisions with variables already in use and keep source values versioned alongside the project when a repeatable implementation matters.",
          "Test the receiving application after integration. A correct color file can still be used incorrectly: muted text may be too faint, a chart may rely on hue alone, or a button’s label may be unreadable. Use the Theme Generator for semantic light/dark proposals and the Contrast Checker to validate actual pairs. Browser-local palette persistence is convenient, but exported files are a better record for durable handoffs."
        ]
      }
    ],
    "faqs": [
      {
        "q": "Which formats are supported?",
        "a": "CSS variables, SCSS variables, a Tailwind configuration snippet, JSON with color representations, and a labeled PNG."
      },
      {
        "q": "Where does my initial palette come from?",
        "a": "The latest palette saved by these tools in this browser loads automatically; you can edit it here."
      },
      {
        "q": "How many colors can I export?",
        "a": "The editor supports one to ten colors."
      },
      {
        "q": "Can I rename the prefix?",
        "a": "Yes. Changing the token prefix updates the code exports."
      },
      {
        "q": "Are numbered tokens automatically sorted by lightness?",
        "a": "No. They follow the supplied palette order; review that order before creating a scale."
      },
      {
        "q": "Does the export assign semantic roles?",
        "a": "No. Map raw swatches to roles such as primary, surface or foreground in your own design system."
      },
      {
        "q": "Is the Tailwind snippet universal?",
        "a": "No. It uses a configuration-style export; adapt it for the version and conventions in your project, including CSS-first setups."
      },
      {
        "q": "What is included in JSON?",
        "a": "The exported palette includes HEX, RGB and HSL representations of the colors."
      },
      {
        "q": "Can I export CMYK print colors?",
        "a": "No. These are screen-oriented color formats. Confirm print values with a suitable color-managed print workflow."
      },
      {
        "q": "Does a PNG include usage rules?",
        "a": "No. It shows labeled swatches; include semantic roles and accessibility notes separately."
      },
      {
        "q": "Are exported pairs automatically accessible?",
        "a": "No. Test the actual foreground and background combinations in the Contrast Checker."
      },
      {
        "q": "Is the saved palette account-backed?",
        "a": "No. Palette persistence is local to this browser; export a file for a durable copy."
      }
    ],
    "images": [
      "guide-export-code.jpg",
      "guide-design-tokens.jpg"
    ],
    "related": [
      "palette-generator",
      "theme-generator",
      "contrast-checker",
      "logo-extractor"
    ]
  },
  "palette-generator": {
    "title": "Free Color Palette Generator – Build Harmonies From Your Logo",
    "intro": [
      "A strong palette balances recognizable brand colors with supporting shades that work in real layouts. The Palette Generator offers color-harmony starting points and a custom workspace for selecting swatches, choosing a rule, locking values and exploring alternatives. If you previously extracted a logo palette in this browser, those saved colors can provide the starting point.",
      "Harmony is a creative framework, not a quality guarantee. A pleasing combination can still have unreadable text, weak visual hierarchy or too many competing accents. Compare the palette in its brand preview, assign a practical role to each shade and validate the actual color pairs before treating the result as a finished interface theme."
    ],
    "steps": [
      "Extract a logo palette first if you want to begin with your own identity, or explore the sample-color harmonies.",
      "Compare the generated harmony examples, then move to the custom generator for a palette you can adjust.",
      "Choose a harmony rule and edit the individual swatches to keep the colors that fit your project.",
      "Lock the base swatches you want to retain, shuffle unlocked colors, and reorder the palette where appropriate.",
      "Adjust brightness or saturation for exploration and compare the resulting colors with the original brand reference.",
      "Save a browser-local favorite, share a color link, or export a PNG, CSS, JSON or Tailwind snippet; validate intended text pairs separately."
    ],
    "features": [
      "Logo-derived or sample-color starting harmonies.",
      "Complementary color examples.",
      "Analogous color examples.",
      "Triadic and other harmony options.",
      "Custom one-to-five-color palette.",
      "Individual color editing.",
      "Locking of base swatches during shuffle.",
      "Shuffle control.",
      "Drag-to-reorder swatches.",
      "Brightness and saturation adjustment.",
      "Browser-local favorites and share links.",
      "PNG, CSS, JSON and Tailwind exports."
    ],
    "sections": [
      {
        "title": "Choosing a harmony rule",
        "paragraphs": [
          "Complementary colors sit on opposite sides of the hue wheel and can create strong accent contrast. Analogous palettes group neighboring hues for a more unified appearance. Triadic palettes spread three hue families around the wheel; they can be energetic, but usually benefit from one dominant color and restrained use of the others.",
          "Monochromatic palettes vary a single hue through different lightness and saturation values. Other multi-hue rules provide additional starting points. These relationships describe hue geometry, not accessible text contrast or a ready-made brand strategy. Try the options with representative content, then refine the palette according to the product’s audience and existing identity."
        ]
      },
      {
        "title": "Locks, shuffle and global adjustments",
        "paragraphs": [
          "A locked swatch preserves its underlying color when shuffle generates replacements for unlocked positions. It does not freeze the displayed result against the global brightness and saturation adjustments. If exact approved HEX values must remain visible, keep those adjustments neutral and compare the displayed codes before exporting.",
          "Changing harmony rules can generate new unlocked colors, while shuffle explores further alternatives. The generator is not a constrained optimizer that proves every unlocked result harmonizes with every locked color. Treat locks as a way to preserve selected base values, then judge the whole palette visually and check actual contrast pairs."
        ]
      },
      {
        "title": "From swatches to practical color roles",
        "paragraphs": [
          "Start with a primary brand color, a supporting accent and enough neutrals to carry content without distraction. A palette containing five highly saturated shades may look exciting in a strip but compete for attention across navigation, cards and forms. Use the brand preview as an early impression rather than a substitute for full screens.",
          "Designers can document which swatch belongs to action, emphasis or background. Developers can map the values to semantic tokens so components use roles instead of position numbers. Marketers can compare a campaign palette with approved brand references, while SEO and content teams should ensure that links and explanatory text remain readable in the resulting layout."
        ]
      },
      {
        "title": "Accessibility and color meaning",
        "paragraphs": [
          "Check text against the exact surface behind it. Two palette colors can look different in hue while remaining close in luminance, so a bright combination is not necessarily readable. Large headings and body text have different WCAG thresholds; a palette cannot receive one universal accessibility pass independently of how it is used.",
          "Pair status colors with labels, shapes or other meaningful indicators rather than relying on red versus green alone. Consider color-vision differences when designing charts or maps, and test adjacent boundaries where they communicate information. The Contrast Checker measures specific pairs, while the Theme Generator offers light/dark semantic starting points for further review."
        ]
      },
      {
        "title": "Saving, sharing and exporting your work",
        "paragraphs": [
          "Favorites are stored in this browser rather than synchronized to an account. A shared link includes the displayed color codes so another person can open the combination, but it does not encode every workspace setting or design decision. Export the values and keep usage notes if you need a durable record or a formal team handoff.",
          "The PNG provides a visual reference; CSS and JSON help transfer color values into development. The Tailwind configuration export must be adapted to the project’s version and conventions. The separate palette gallery remains available for browsing ready-made inspiration, while this page is the interactive workspace. Neither choosing a harmony nor exporting a file establishes ownership of a third-party logo or brand identity."
        ]
      }
    ],
    "faqs": [
      {
        "q": "How do I start from logo colors?",
        "a": "Use the Logo Extractor first. The latest palette saved in this browser can become the generator’s starting point."
      },
      {
        "q": "Which harmony rules are available?",
        "a": "The workspace offers the listed hue relationships, including complementary, analogous, triadic and monochromatic, plus random generation."
      },
      {
        "q": "How many custom colors can I use?",
        "a": "The custom workspace supports one to five swatches."
      },
      {
        "q": "What does locking preserve?",
        "a": "A lock preserves a swatch’s base value during shuffle; global brightness and saturation still affect its displayed color."
      },
      {
        "q": "Does shuffle optimize all locked colors together?",
        "a": "No. It generates alternatives while retaining locked base swatches; review the resulting combination yourself."
      },
      {
        "q": "Can I reorder the colors?",
        "a": "Yes. Drag swatches to change their order in the custom palette."
      },
      {
        "q": "Are harmonious palettes automatically accessible?",
        "a": "No. Harmony concerns color relationships; test the actual text/background pairs separately."
      },
      {
        "q": "Where are favorites saved?",
        "a": "In local storage in this browser, with up to 30 saved favorites; they are not account-synced."
      },
      {
        "q": "What does a share link contain?",
        "a": "The displayed HEX colors. It does not include all lock, adjustment or workspace settings."
      },
      {
        "q": "Which export options are available?",
        "a": "PNG, CSS, JSON and a Tailwind configuration snippet; the Export Center also provides SCSS."
      },
      {
        "q": "Is the gallery still separate?",
        "a": "Yes. Browse /palettes for the gallery and use this page for custom generation."
      },
      {
        "q": "Does the tool replace my approved brand colors?",
        "a": "No. Keep an original reference and verify the displayed values when using global adjustments or generated alternatives."
      }
    ],
    "images": [
      "guide-palette-generate.jpg",
      "guide-harmony-rules.jpg"
    ],
    "related": [
      "logo-extractor",
      "contrast-checker",
      "theme-generator",
      "export-center"
    ]
  }
};

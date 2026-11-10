INSERT INTO public.blog_posts (slug, title, excerpt, content, cover_image, category, tags, author, status, published_at, updated_at, seo_title, meta_description, canonical, og_image)
SELECT 'how-to-check-what-cms-a-website-uses', 'How to Check What CMS a Website Uses (5 Free Methods)',
'Five free ways to check what CMS a website uses: an online CMS checker, page source clues, response headers, known public paths and browser extensions.',
$article$<p>You find a fast, polished website and wonder: <strong>what CMS is this website using?</strong> Knowing the platform behind a site helps you compare options for your own project, research competitors and find the themes or plugins that make a site work. Websites leave public clues every time they load, and this guide shows five free ways to read them, plus the honest limits of each.</p>
<p><img src="/images/blog/how-cms-detection-works.webp" alt="Diagram of how CMS detection works: enter a URL, send an HTTP request, analyse headers and HTML, and show detection results" width="1376" height="768"></p>
<h2>The 5 methods at a glance</h2>
<table><thead><tr><th>Method</th><th>Speed</th><th>Effort</th><th>Best for</th></tr></thead><tbody>
<tr><td>Online CMS checker</td><td>Seconds</td><td>Paste a URL</td><td>Quick answers with evidence, nothing to install</td></tr>
<tr><td>View Page Source</td><td>Under a minute</td><td>Low</td><td>Spotting generator tags and asset paths by hand</td></tr>
<tr><td>Response headers (DevTools)</td><td>1–2 minutes</td><td>Moderate</td><td>Server and cookie clues when HTML hides the platform</td></tr>
<tr><td>Known public paths</td><td>About a minute</td><td>Low</td><td>Confirming WordPress, Shopify, Ghost or Drupal</td></tr>
<tr><td>Browser extensions</td><td>Instant while browsing</td><td>Install once</td><td>Researchers who check many sites every day</td></tr>
</tbody></table>
<h2>Method 1: Use an online CMS checker</h2>
<p>The fastest option is a dedicated <a href="/tools/cms-detector">CMS Detector</a>. Paste the address and press Detect. The tool fetches the public page and compares it with fingerprints for more than 30 CMS, site builder and ecommerce platforms, including WordPress, Shopify, Wix, Squarespace, Webflow, Drupal, Joomla, Magento, Ghost and BigCommerce. It also recognises 40+ supporting technologies.</p>
<p>Instead of only naming a platform, it shows a <strong>confidence score</strong> and the <strong>evidence</strong> behind each match, such as a generator tag, an asset folder or a server header. That lets you judge the result yourself. It is free, needs no sign-up and does not store the sites you check.</p>
<p>Once you know the platform, go deeper:</p>
<ul>
<li>Find the theme and plugins with the <a href="/tools/wordpress-theme-detector">WordPress Theme Detector</a>.</li>
<li>Identify a store's theme with the <a href="/tools/shopify-theme-detector">Shopify Theme Detector</a>.</li>
<li>Review technical SEO and accessibility with the <a href="/tools/website-auditor">Website Auditor</a>.</li>
<li>Pull the site's brand colors with the <a href="/tools/website-extractor">Website Color Extractor</a>.</li>
</ul>
<blockquote><p><strong>Want the answer now?</strong> <a href="/tools/cms-detector">Check any website with the free CMS checker</a>.</p></blockquote>
<h2>Method 2: View the page source</h2>
<p>Open the site, right-click an empty area and choose <strong>View Page Source</strong> (Ctrl+U on Windows, Cmd+Option+U on Mac). Then search the code with Ctrl+F or Cmd+F.</p>
<h3>The generator meta tag</h3>
<p>Many platforms announce themselves near the top of the page with a tag like <code>&lt;meta name="generator" content="WordPress 6.7"&gt;</code>. Ghost, Joomla, Drupal and several builders add similar tags. Site owners can remove it, so its absence proves nothing.</p>
<h3>Platform file paths</h3>
<ul>
<li><strong>WordPress:</strong> <code>/wp-content/themes/</code>, <code>/wp-content/plugins/</code> or <code>/wp-includes/</code>.</li>
<li><strong>Shopify:</strong> <code>/cdn/shop/</code>, <code>cdn.shopify.com</code> or <code>Shopify.theme</code>.</li>
<li><strong>Wix:</strong> <code>static.parastorage.com</code> or <code>wixstatic.com</code>.</li>
<li><strong>Squarespace:</strong> <code>static1.squarespace.com</code>.</li>
<li><strong>Webflow:</strong> <code>data-wf-page</code> and <code>data-wf-site</code> attributes.</li>
<li><strong>Drupal:</strong> <code>/sites/default/files/</code> or <code>drupalSettings</code>.</li>
</ul>
<h2>Method 3: Check response headers in DevTools</h2>
<p>When the HTML is clean, the server may still give the platform away. Press F12 to open Developer Tools, choose the <strong>Network</strong> tab and reload the page. Click the first request (the main document) and read the <strong>Response Headers</strong>.</p>
<ul>
<li><strong>x-powered-by</strong> can show a runtime or platform, for example PHP or Next.js.</li>
<li><strong>server</strong> and platform-specific headers can point to a host or service; Shopify stores often send headers that mention Shopify.</li>
<li><strong>set-cookie</strong> names such as <code>wp-settings-</code>, <code>_shopify_y</code> or <code>PHPSESSID</code> are strong hints.</li>
</ul>
<p>Headers are often hidden behind a CDN, so treat them as supporting evidence rather than proof.</p>
<h2>Method 4: Try known public paths</h2>
<p>Most platforms have default addresses. Add these to the domain in your address bar:</p>
<ul>
<li><strong>WordPress:</strong> <code>/wp-json/</code> usually returns public data about the site; <code>/wp-login.php</code> often shows the login screen.</li>
<li><strong>Shopify:</strong> <code>/collections/all</code> and <code>/products.json</code> are standard store paths.</li>
<li><strong>Ghost:</strong> <code>/ghost/</code> opens the admin sign-in.</li>
<li><strong>Drupal:</strong> <code>/user/login</code> is the default login form.</li>
</ul>
<p>Only visit public pages, and never try to sign in. Security plugins often rename login paths, so a missing page does not rule a platform out.</p>
<h2>Method 5: Use a browser extension</h2>
<p>If you research sites all day, an extension such as Wappalyzer shows detected technologies as you browse. The trade-off is that it needs browser permissions and runs on the pages you visit. For occasional checks, a web-based <a href="/tools/cms-detector">CMS checker</a> is simpler and works on any device, including phones.</p>
<h2>The honest limits: custom and headless sites</h2>
<p>No method can identify every site. Expect unclear results when:</p>
<ul>
<li><strong>The site is headless.</strong> Content may live in a CMS such as Contentful or Sanity, while visitors see a front end built with a framework like Next.js. The public page may only reveal the framework.</li>
<li><strong>The site is static or custom-built.</strong> Generators like Hugo or Eleventy output plain HTML, and custom applications have no standard fingerprints.</li>
<li><strong>Signals are hidden on purpose.</strong> Removed generator tags, renamed paths and stripped headers make detection harder.</li>
<li><strong>Automated visits are blocked.</strong> Some firewalls refuse server-side requests, so online tools cannot read the page.</li>
</ul>
<p>That is why evidence matters: a result that shows <em>why</em> it matched is far easier to trust than a bare name.</p>
<h2>Frequently asked questions</h2>
<h3>Is it legal to check what CMS a website uses?</h3>
<p>Yes. These methods only read the public HTML, files and headers that the site sends to every visitor's browser.</p>
<h3>Which method is the most accurate?</h3>
<p>Combining several signals is most reliable. An online CMS checker does this automatically by matching tags, paths, scripts and headers together.</p>
<h3>Can a website hide its CMS?</h3>
<p>Partly. Owners can remove tags and rename paths, but themes, plugins and scripts often still leave clues.</p>
<h3>How do I find the theme after finding the CMS?</h3>
<p>Use the <a href="/tools/wordpress-theme-detector">WordPress Theme Detector</a> or the <a href="/tools/shopify-theme-detector">Shopify Theme Detector</a> to see the theme behind the site.</p>
$article$,
'/images/blog/how-cms-detection-works.webp', 'Tutorials', ARRAY['cms checker','cms detector','wordpress','shopify'], 'Ali Raza', 'published', '2026-11-10 16:45:00+00'::timestamptz, '2026-11-10 16:45:00+00'::timestamptz,
'How to Check What CMS a Website Uses (5 Free Methods)',
'Learn 5 free ways to check what CMS a website uses: a CMS checker, page source, headers, public paths and extensions. Try the free CMS Detector.',
'', '/images/blog/how-cms-detection-works.webp'
WHERE NOT EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = 'how-to-check-what-cms-a-website-uses');
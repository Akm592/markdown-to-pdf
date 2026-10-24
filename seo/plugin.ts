import fs from 'node:fs';
import path from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import {
  AUTHOR_NAME,
  GITHUB_PROFILE,
  GITHUB_REPO,
  PAGES,
  SITE_NAME,
  type SeoPage,
} from './pages.ts';

/*
 * index.html carries two markers. In dev they are filled per request URL, so
 * /mermaid-to-pdf previews its own page. At build time index.html is filled
 * with the home page, then copied once per landing page with both blocks
 * swapped. Each copy keeps Vite's hashed script and CSS tags.
 */
const HEAD_MARK = '<!--seo:head-->';
const BODY_MARK = '<!--seo:body-->';
const HEAD_RE = /<!--seo:head-->[\s\S]*?<!--\/seo:head-->/;
const BODY_RE = /<!--seo:body-->[\s\S]*?<!--\/seo:body-->/;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// JSON inside <script> must not be able to close the tag.
const jsonLd = (data: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const pageUrl = (site: string, page: SeoPage) => (page.path === '/' ? `${site}/` : `${site}${page.path}`);

function structuredData(site: string, page: SeoPage) {
  const home = `${site}/`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${home}#website`,
      url: home,
      name: SITE_NAME,
      alternateName: 'Markdown to PDF',
      inLanguage: 'en',
    },
    {
      '@type': 'Person',
      '@id': `${home}#author`,
      name: AUTHOR_NAME,
      url: GITHUB_PROFILE,
      sameAs: [GITHUB_PROFILE],
    },
    {
      '@type': 'WebApplication',
      '@id': `${home}#app`,
      name: SITE_NAME,
      url: home,
      description: PAGES[0].description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (runs in a web browser)',
      browserRequirements: 'Requires JavaScript and a modern browser.',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Markdown to PDF',
        'Markdown to Word (DOCX)',
        'Live A4 preview',
        'Mermaid diagrams',
        'LaTeX math with KaTeX',
        'Syntax highlighting',
        'GitHub Flavored Markdown',
        'Runs fully in the browser; no uploads',
      ],
      screenshot: `${site}/og-image.png`,
      image: `${site}/og-image.png`,
      author: { '@id': `${home}#author` },
      sameAs: [GITHUB_REPO],
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl(site, page)}#webpage`,
      url: pageUrl(site, page),
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${home}#website` },
      about: { '@id': `${home}#app` },
      primaryImageOfPage: `${site}/og-image.png`,
      inLanguage: 'en',
    },
  ];

  if (page.faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl(site, page)}#faq`,
      mainEntity: page.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  if (page.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: home },
        { '@type': 'ListItem', position: 2, name: page.navLabel, item: pageUrl(site, page) },
      ],
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

function renderHead(site: string, page: SeoPage) {
  const url = pageUrl(site, page);
  const image = `${site}/og-image.png`;
  const imageAlt = 'Markdown2PDF: a Markdown editor with a live A4 preview and PDF, Word and Markdown export';
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}" />`,
    jsonLd(structuredData(site, page)),
  ].join('\n    ');
}

function renderBody(page: SeoPage) {
  const crumbs =
    page.path === '/'
      ? ''
      : `<nav class="seo__crumbs" aria-label="Breadcrumb"><a href="/">${SITE_NAME}</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(page.navLabel)}</span></nav>`;

  const sections = page.sections
    .map((s) => `<section><h2>${esc(s.heading)}</h2>${s.html}</section>`)
    .join('\n');

  const faqs = page.faqs.length
    ? `<section class="seo__faq"><h2>Frequently asked questions</h2>${page.faqs
        .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
        .join('')}</section>`
    : '';

  const links = PAGES.filter((p) => p.path !== page.path)
    .map((p) => `<li><a href="${p.path}">${esc(p.navLabel)}</a></li>`)
    .join('');

  return `<article class="seo" id="guide" aria-labelledby="seo-title">
      <div class="seo__inner">
        ${crumbs}
        <h1 id="seo-title">${esc(page.h1)}</h1>
        <p class="seo__lead">${esc(page.intro)}</p>
        ${sections}
        ${faqs}
        <nav class="seo__tools" aria-label="More tools"><h2>More free Markdown tools</h2><ul>${links}</ul></nav>
        <footer class="seo__footer">
          <p>${SITE_NAME} is free and <a href="${GITHUB_REPO}" rel="noopener">open source on GitHub</a>. Built by <a href="${GITHUB_PROFILE}" rel="author noopener">${AUTHOR_NAME}</a>.</p>
        </footer>
      </div>
    </article>`;
}

function fill(html: string, site: string, page: SeoPage, markers: 'placeholder' | 'filled') {
  const head = `${HEAD_MARK}\n    ${renderHead(site, page)}\n    <!--/seo:head-->`;
  const body = `${BODY_MARK}\n    ${renderBody(page)}\n    <!--/seo:body-->`;
  // Replacer functions, not strings: the copy contains `$$` (math examples),
  // which String#replace would otherwise read as a substitution pattern.
  if (markers === 'placeholder') {
    return html.replace(HEAD_MARK, () => head).replace(BODY_MARK, () => body);
  }
  return html.replace(HEAD_RE, () => head).replace(BODY_RE, () => body);
}

const sitemap = (site: string, lastmod: string) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map((p) => `  <url>\n    <loc>${pageUrl(site, p)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`).join('\n')}
</urlset>
`;

const robots = (site: string) => `User-agent: *
Allow: /

Sitemap: ${site}/sitemap.xml
`;

// https://llmstxt.org -- a plain summary for AI assistants and answer engines.
const llms = (site: string) => `# ${SITE_NAME}

> ${PAGES[0].description}

${SITE_NAME} is a free, open-source Markdown editor that runs entirely in the browser. It converts Markdown to PDF (A4, via the print dialog or as an exact-layout image PDF), to Word (.docx) and back to .md. It supports GitHub Flavored Markdown, syntax highlighting, Mermaid diagrams, LaTeX math (KaTeX), callout boxes and emoji. Documents are never uploaded; they are saved only in the browser's local storage.

## Pages

${PAGES.map((p) => `- [${p.navLabel}](${pageUrl(site, p)}): ${p.description}`).join('\n')}

## Source

- [GitHub repository](${GITHUB_REPO})
`;

const notFound = (site: string) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex" />
<title>Page not found | ${SITE_NAME}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<style>
  :root { color-scheme: light dark; --bg: #f3f4f6; --fg: #111827; --muted: #4b5563; --link: #2563eb; }
  @media (prefers-color-scheme: dark) { :root { --bg: #111827; --fg: #f9fafb; --muted: #9ca3af; --link: #60a5fa; } }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: var(--bg); color: var(--fg);
         font: 16px/1.6 system-ui, -apple-system, sans-serif; padding: 16px; box-sizing: border-box; }
  main { max-width: 32rem; } h1 { margin: 0 0 .5rem; font-size: 1.75rem; } p { color: var(--muted); }
  a { color: var(--link); } ul { padding-left: 1.25rem; }
</style>
</head>
<body>
<main>
  <h1>Page not found</h1>
  <p>That page doesn't exist. Try one of these instead:</p>
  <ul>
    ${PAGES.map((p) => `<li><a href="${p.path}">${esc(p.navLabel)}</a></li>`).join('\n    ')}
  </ul>
  <p><a href="${site}/">Open the Markdown to PDF converter →</a></p>
</main>
</body>
</html>
`;

export default function seoPages(siteUrl: string): Plugin {
  const site = siteUrl.replace(/\/+$/, '');
  let config: ResolvedConfig;

  return {
    name: 'seo-pages',
    configResolved(resolved) {
      config = resolved;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        // Dev: serve each landing page's content at its own URL.
        const url = (ctx.originalUrl ?? '/').split(/[?#]/)[0].replace(/\.html$/, '').replace(/\/+$/, '') || '/';
        const page = (ctx.server && PAGES.find((p) => p.path === url)) || PAGES[0];
        return fill(html.replace(/%SITE_URL%/g, site), site, page, 'placeholder');
      },
    },
    closeBundle() {
      if (config.command !== 'build') return;
      const outDir = path.resolve(config.root, config.build.outDir);
      const indexPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexPath)) return;
      const index = fs.readFileSync(indexPath, 'utf8');

      for (const page of PAGES.slice(1)) {
        fs.writeFileSync(path.join(outDir, page.file), fill(index, site, page, 'filled'));
      }
      const today = new Date().toISOString().slice(0, 10);
      fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap(site, today));
      fs.writeFileSync(path.join(outDir, 'robots.txt'), robots(site));
      fs.writeFileSync(path.join(outDir, 'llms.txt'), llms(site));
      fs.writeFileSync(path.join(outDir, '404.html'), notFound(site));
    },
  };
}

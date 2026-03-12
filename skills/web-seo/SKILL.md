---
name: web-seo
description: "SEO meta tags, structured data, and search optimization. Trigger: When adding meta tags, sitemaps, improving search ranking, or auditing SEO."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
  skills:
    - web-performance
---

# Web SEO

Meta tags, structured data, sitemaps, and on-page SEO patterns for web applications.

## When to Use

- Adding `<title>`, description, Open Graph, or Twitter Card meta tags
- Implementing structured data (JSON-LD)
- Generating sitemaps or configuring robots.txt
- Auditing search ranking factors or Lighthouse SEO score
- Handling canonical URLs in SPAs or multi-language sites

Don't use for:

- Web performance optimization (use `web-performance`)
- Accessibility compliance (use `a11y`)
- Next.js Metadata API implementation details (use `next`)
- Astro SEO integrations (use `astro`)

---

## Critical Patterns

### ✅ REQUIRED: Title and Description

```html
<!-- ✅ CORRECT: Unique per page, concise, keyword-rich -->
<title>Running Shoes — Free Shipping | ShopName</title>
<meta name="description" content="Shop 200+ running shoes with free shipping on orders over $50. Expert reviews and size guides." />

<!-- ❌ WRONG: Generic title, missing description -->
<title>Page</title>
<!-- no meta description -->
```

Rules:

- Title: 50–60 characters, unique per page, brand at end
- Description: 120–160 characters, action-oriented, unique per page
- Both must exist on every page

### ✅ REQUIRED: Open Graph — Social Sharing

```html
<!-- ✅ Minimum required OG tags for all pages -->
<meta property="og:title" content="Running Shoes — ShopName" />
<meta property="og:description" content="Shop 200+ running shoes with free shipping." />
<meta property="og:image" content="https://example.com/og/running-shoes.jpg" />
<meta property="og:url" content="https://example.com/running-shoes/" />
<meta property="og:type" content="website" />

<!-- Twitter Card (falls back to OG if absent) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Running Shoes — ShopName" />
<meta name="twitter:image" content="https://example.com/og/running-shoes.jpg" />
```

OG image requirements: 1200×630px minimum, < 8MB, JPG or PNG. Use a dedicated `/og/` directory for social images.

### ✅ REQUIRED: Canonical URL

```html
<!-- ✅ Self-referencing canonical on every page -->
<link rel="canonical" href="https://example.com/running-shoes/" />

<!-- ✅ Canonicalize to preferred URL when same content is at multiple URLs -->
<!-- Both /shoes?sort=price and /shoes point to: -->
<link rel="canonical" href="https://example.com/shoes/" />
```

Rules: Always use absolute URLs. Trailing slash must be consistent with `robots.txt` and sitemap. Missing canonicals on paginated pages lead to duplicate content issues.

### ✅ REQUIRED: Structured Data (JSON-LD)

```html
<!-- ✅ Article structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Choose Running Shoes",
  "author": { "@type": "Person", "name": "Jane Doe" },
  "datePublished": "2026-01-15",
  "image": "https://example.com/images/running-shoes.jpg",
  "publisher": {
    "@type": "Organization",
    "name": "ShopName",
    "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
  }
}
</script>

<!-- ✅ Product structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Nike Air Zoom Pegasus 40",
  "image": "https://example.com/shoes/pegasus.jpg",
  "offers": {
    "@type": "Offer",
    "price": "129.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "127"
  }
}
</script>
```

Validate at: [Google Rich Results Test](https://search.google.com/test/rich-results), [Schema.org Validator](https://validator.schema.org/).

### ✅ REQUIRED: robots.txt and Sitemap

```
# robots.txt — at domain root
User-agent: *
Disallow: /admin/
Disallow: /private/
Allow: /

Sitemap: https://example.com/sitemap.xml
```

```xml
<!-- sitemap.xml — standard format -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/running-shoes/</loc>
    <lastmod>2026-01-10</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

Submit sitemap to Google Search Console and Bing Webmaster Tools after deployment.

---

## Decision Tree

```
Adding meta tags to a new page?
  → Add title (50-60 chars), description (120-160 chars), canonical URL
  → Add Open Graph: og:title, og:description, og:image (1200×630), og:url, og:type

Social sharing cards (Twitter/LinkedIn/Slack previews)?
  → Add og:image + og:title + og:description (minimum)
  → Add twitter:card="summary_large_image" for large image previews
  → Test with Twitter Card Validator, LinkedIn Post Inspector

Structured data needed?
  → Article/blog post → Article schema
  → Product page → Product + Offer schema
  → FAQ content → FAQPage schema
  → Local business → LocalBusiness schema
  → Breadcrumbs → BreadcrumbList schema
  → Validate with Google Rich Results Test

SPA / dynamic routes (React, Next.js, Vue)?
  → Update title and canonical on every route change
  → Use framework meta management: next/head, React Helmet, Vue Meta
  → Ensure meta tags are present in SSR/SSG HTML, not injected after hydration

Sitemap?
  → Static site: generate sitemap.xml at build time
  → Dynamic site (CMS): auto-generate from content API
  → Submit to Google Search Console

Multi-language site?
  → Add hreflang tags pointing to all language variants
  → Each language page should have a self-referencing hreflang

Canonical URL issues (pagination, filters, parameters)?
  → Paginated pages: canonical to self (NOT to page 1)
  → Filter/sort URLs (?sort=price): canonical to base URL /products/
  → Trailing slash: consistent across all pages and canonical
```

---

## Example

Complete SEO implementation for a blog post page.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Core SEO -->
  <title>How to Choose Running Shoes in 2026 | RunnerHub</title>
  <meta name="description"
        content="Expert guide to choosing running shoes by terrain, gait, and distance. Updated for 2026 models." />
  <link rel="canonical" href="https://runnerhub.com/guides/choose-running-shoes/" />

  <!-- Open Graph -->
  <meta property="og:title" content="How to Choose Running Shoes in 2026" />
  <meta property="og:description"
        content="Expert guide to choosing running shoes by terrain, gait, and distance." />
  <meta property="og:image"
        content="https://runnerhub.com/og/choose-running-shoes.jpg" />
  <meta property="og:url"
        content="https://runnerhub.com/guides/choose-running-shoes/" />
  <meta property="og:type" content="article" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />

  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Choose Running Shoes in 2026",
    "author": { "@type": "Person", "name": "Alex Kim" },
    "datePublished": "2026-01-15",
    "dateModified": "2026-02-01",
    "image": "https://runnerhub.com/og/choose-running-shoes.jpg",
    "publisher": {
      "@type": "Organization",
      "name": "RunnerHub",
      "logo": { "@type": "ImageObject", "url": "https://runnerhub.com/logo.png" }
    }
  }
  </script>
</head>
```

---

## Edge Cases

**SPA meta tags not visible to crawlers:** Server-side rendering or prerendering is required for search engines to index dynamic meta tags. Client-side-only updates via `document.title` may not be indexed. Use Next.js Metadata API, Nuxt `useHead`, or Astro's `<head>` slot for SSR-rendered meta.

**Duplicate content from trailing slashes:** `/about` and `/about/` are treated as different URLs. Pick one and redirect the other. Set canonical consistently.

**hreflang for multi-language:**

```html
<!-- On /en/about/ -->
<link rel="alternate" hreflang="en" href="https://example.com/en/about/" />
<link rel="alternate" hreflang="es" href="https://example.com/es/acerca/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/about/" />
```

`x-default` is the fallback for unmatched locales. Every language version must include all hreflang tags pointing to all other versions.

**Paginated content:**

```html
<!-- Page 2 of a product listing — canonical to self, not page 1 -->
<link rel="canonical" href="https://example.com/shoes/?page=2" />
```

Google deprecated `rel="next"/"prev"` — canonical is sufficient.

**robots meta for no-index pages:**

```html
<!-- Prevent indexing of thin or duplicate pages -->
<meta name="robots" content="noindex, nofollow" />
```

Apply to: admin pages, thank-you pages, duplicate filter URLs, staging environments.

---

## Resources

- [Google Search Central Documentation](https://developers.google.com/search/docs)
- [Schema.org Type Reference](https://schema.org/docs/full.html)
- [Open Graph Protocol](https://ogp.me/)
- [web-performance](../web-performance/SKILL.md) — Core Web Vitals as ranking signals
- [next](../next/SKILL.md) — Next.js Metadata API for dynamic meta tags
- [astro](../astro/SKILL.md) — Astro SEO integration patterns

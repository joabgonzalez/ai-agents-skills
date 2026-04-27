---
name: astro-best-practices
description: "Astro quality patterns: island philosophy, SEO by page type, and Core Web Vitals. Trigger: When reviewing Astro site quality or hydration decisions."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
---

# Astro Best Practices

Quality patterns for Astro island architecture, SEO strategy, and Core Web Vitals. Complements the `astro` skill (which covers syntax and directives) — this skill covers architecture decisions.

## When to Use

- Reviewing an Astro site for quality or hydration decisions
- Deciding page-type SEO strategy
- Evaluating whether an island is justified
- Auditing Core Web Vitals or JS bundle size

Don't use for:

- Client directive syntax (use astro)
- SEO meta tag implementation details (use web-seo)
- Performance tooling and measurement (use web-performance)

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Zero JS Is the Default

Hydration is a cost, not a feature. Ask "why does this need browser JS?" before every directive.

```astro
<!-- ❌ WRONG — client:load as default "just in case" -->
<Nav client:load />
<Footer client:load />
<Sidebar client:load />

<!-- ✅ CORRECT — only hydrate what requires interactivity -->
<SearchBox client:load />
<Nav />
<Footer />
```

### ✅ REQUIRED: Hydration Directive Ladder

Choose the least aggressive directive that meets the requirement.

```
client:load   → above-fold, requires immediate interaction (search, nav toggle)
client:visible → below-fold interactive (comment section, map)
client:idle   → non-critical enhancement (analytics widget, lazy chat)
client:media  → viewport-conditional (mobile-only menu)
```

```astro
<!-- ❌ WRONG — client:load on below-fold, non-critical component -->
<NewsletterForm client:load />

<!-- ✅ CORRECT — defer until visible -->
<NewsletterForm client:visible />
```

### ✅ REQUIRED: SEO Per Page Type

Each page type needs a distinct SEO strategy. Never use the same meta description across pages.

```astro
<!-- ✅ Blog post: Article schema + unique description -->
<title>{post.title} | Blog</title>
<meta name="description" content={post.excerpt} />
<meta property="og:type" content="article" />
<script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

<!-- ✅ Paginated list: canonical + rel="next/prev" -->
<link rel="canonical" href={canonicalUrl} />
{page.url.next && <link rel="next" href={page.url.next} />}
```

### ✅ REQUIRED: Content Collection Typing

Every collection needs a Zod schema in `src/content/config.ts`.

```ts
// ❌ WRONG — untyped frontmatter, runtime errors on missing fields
const posts = await getCollection('blog');

// ✅ CORRECT — schema validated at build time
const blogSchema = z.object({
  title: z.string(),
  pubDate: z.date(),
  description: z.string().max(160),
  image: z.string().optional(),
});
```

### ❌ NEVER: SSR Without Purpose

`prerender: false` only when the page uses `Astro.locals`, request cookies, or personalization. Never SSR a page that could be static.

```ts
// ❌ WRONG — SSR on a page that never uses request data
export const prerender = false; // on /about page

// ✅ CORRECT — SSR only for pages that need it
export const prerender = false; // on /dashboard (uses Astro.locals.user)
```

### ❌ NEVER: React for Static Content

Static logo, nav links, footers, and text blocks ship zero JS as `.astro` components.

```astro
<!-- ❌ WRONG — 15kb React runtime for a static header -->
<Header client:load />

<!-- ✅ CORRECT — .astro component ships zero JS -->
<Header />
```

### ✅ REQUIRED: Core Web Vitals Discipline

LCP, CLS, and INP each have specific patterns.

```astro
<!-- ✅ LCP: hero image loads immediately with highest priority -->
<img src={hero.src} alt={hero.alt} loading="eager" fetchpriority="high"
     width={hero.width} height={hero.height} />

<!-- ✅ CLS: explicit dimensions on all media prevent layout shift -->
<img src={avatar} alt="User" width="48" height="48" />
```

### Symptom → Solution

| Symptom | Cause | Fix |
|---------|-------|-----|
| JS bundle > 50kb on static page | client:load on non-interactive component | Remove directive; use .astro |
| LCP > 2.5s | Hero image missing priority hints | Add `fetchpriority="high"` + `loading="eager"` |
| CLS on hydration | Island changes size when hydrated | Set explicit width/height on island wrapper |
| Missing OG image on social share | og:image not in Layout | Add og:image to base Layout component |
| Build fails on SSR page | Missing adapter | Add SSR adapter in astro.config.mjs |
| Duplicate content on paginated pages | Missing canonical/rel links | Add canonical + rel="next/prev" per page |

---

## Decision Tree

```
Should this component be hydrated?
  → Does it need event listeners or browser APIs?
  → No → Use .astro component (zero JS)
  → Yes → Choose directive from ladder

Which directive?
  → Above-fold, immediate interaction → client:load
  → Below-fold interactive → client:visible
  → Non-critical enhancement → client:idle
  → Viewport-conditional → client:media

SEO for static blog post?
  → Unique title + description + JSON-LD Article schema

SEO for product page?
  → JSON-LD Product schema + canonical on paginated variants

SEO for paginated list?
  → Canonical on each page + rel="next/prev"

Content collection with 5+ entries?
  → Define Zod schema in src/content/config.ts

Page needs user session or request data?
  → SSR (prerender: false) + adapter
  → Otherwise keep as static

Astro vs full SPA decision?
  → Mostly static with islands → Astro
  → Constant mutation + WebSockets + shared client state → SPA framework
```

---

## Example

Blog post layout with correct SEO, one justified island, and LCP-optimized hero.

```astro
---
// src/layouts/BlogPost.astro
const { post } = Astro.props;
const articleSchema = { "@type": "Article", headline: post.title };
---
<html lang="en">
  <head>
    <title>{post.title} | Blog</title>
    <meta name="description" content={post.description} />
    <meta property="og:type" content="article" />
    <script type="application/ld+json" set:html={JSON.stringify(articleSchema)} />
  </head>
  <body>
    <!-- LCP: hero image gets highest fetch priority -->
    <img src={post.hero} alt={post.heroAlt}
         loading="eager" fetchpriority="high"
         width="1200" height="630" />

    <slot />

    <!-- Island justified: requires scroll position + IntersectionObserver -->
    <TableOfContents client:visible headings={post.headings} />
  </body>
</html>
```

---

## Edge Cases

**Third-party React components:** If a library only ships React components, use `client:visible` at minimum — never `client:load` unless the component is above-fold and interactive on page load.

**Dynamic routes with SSR:** `getStaticPaths` cannot be used with `prerender: false`. If you need both dynamic routes and SSR, use path params via `Astro.params` in SSR mode.

**Content collections vs Markdown imports:** Collections are the correct pattern for 5+ content files. Direct imports are fine for 1–3 standalone documents (changelog, about page).

**og:image sizing:** Minimum 1200×630px for Twitter/Facebook. Generate with `@astrojs/og` or a static pre-generated image — never a hot-resize URL that adds latency.

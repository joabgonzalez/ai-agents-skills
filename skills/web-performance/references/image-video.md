# Image & Video Optimization

> Modern formats, responsive images, lazy loading, and video delivery

## Core Patterns

- Modern Image Formats
- Responsive Images
- Lazy Loading and Priority
- Video Optimization

---

## Modern Image Formats

### Format Selection

| Format | Best For | Browser Support |
| ------ | -------- | --------------- |
| WebP   | Photos, illustrations | 95%+ |
| AVIF   | Photos (smaller than WebP) | 90%+ |
| SVG    | Icons, logos, illustrations | Universal |
| PNG    | Screenshots with text, transparency | Universal |
| JPEG   | Fallback for photos | Universal |

**Size comparison (same quality):** AVIF < WebP < JPEG < PNG

### Serve Modern Format with Fallback

```html
<!-- ✅ picture element: browser picks first supported format -->
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero image" width="1200" height="600" />
</picture>
```

### Conversion

```bash
# Sharp (Node.js — most common)
npx sharp-cli --input photo.jpg --output photo.webp --format webp --quality 80
npx sharp-cli --input photo.jpg --output photo.avif --format avif --quality 65

# cwebp (Google command-line)
cwebp -q 80 photo.jpg -o photo.webp

# ImageMagick
convert photo.jpg -quality 80 photo.webp
```

---

## Responsive Images

### srcset + sizes for Responsive Images

```html
<!-- ✅ Browser chooses correct size based on viewport + screen density -->
<img
  srcset="
    product-400.webp  400w,
    product-800.webp  800w,
    product-1200.webp 1200w
  "
  sizes="
    (max-width: 600px)  400px,
    (max-width: 1200px) 800px,
    1200px
  "
  src="product-800.webp"
  alt="Running shoes"
  width="800" height="600"
/>
```

`sizes` tells the browser how large the image will be displayed at each breakpoint (CSS px, not device px). Without `sizes`, browser assumes 100vw and may download too-large images.

### Art Direction with picture

```html
<!-- Different crop/composition at different viewports -->
<picture>
  <source
    media="(max-width: 600px)"
    srcset="hero-mobile.webp 600w"
  />
  <source
    media="(min-width: 601px)"
    srcset="hero-desktop.webp 1200w"
  />
  <img src="hero-desktop.webp" alt="Hero" width="1200" height="500" />
</picture>
```

### Explicit Dimensions — Prevent CLS

```html
<!-- ✅ REQUIRED: width + height reserve space before image loads -->
<img src="photo.webp" width="800" height="600" alt="..." />

<!-- ✅ Also valid: aspect-ratio CSS when responsive width is needed -->
<style>
  .card-img { width: 100%; aspect-ratio: 4/3; object-fit: cover; }
</style>
<img class="card-img" src="photo.webp" alt="..." />

<!-- ❌ WRONG: no dimensions → layout shift when image loads -->
<img src="photo.webp" alt="..." />
```

---

## Lazy Loading and Priority

### Default: Lazy Load Below-Fold Images

```html
<!-- ✅ Browser defers loading until image is near viewport -->
<img src="below-fold.webp" loading="lazy"
     width="400" height="300" alt="..." />

<!-- ❌ Don't apply lazy to above-fold images — delays LCP -->
<img src="hero.webp" loading="lazy" alt="..." />  <!-- WRONG for hero -->
```

### fetchpriority for LCP Image

```html
<!-- ✅ Only ONE image per page should have fetchpriority="high" -->
<img src="hero.webp" fetchpriority="high"
     width="1200" height="600" alt="Hero" />

<!-- ✅ Deprioritize thumbnails to save bandwidth -->
<img src="thumbnail.webp" fetchpriority="low"
     loading="lazy" width="200" height="150" alt="..." />
```

### Preload LCP Image in `<head>`

```html
<!-- For background images or dynamically loaded LCP images -->
<link rel="preload" as="image" href="hero.webp"
      imagesrcset="hero-400.webp 400w, hero-800.webp 800w"
      imagesizes="100vw" />
```

### decoding="async"

```html
<!-- Decode image off main thread; prevents jank during scroll -->
<img src="photo.webp" loading="lazy" decoding="async"
     width="400" height="300" alt="..." />
```

---

## Video Optimization

### Autoplay Ambient Video (Replace GIF)

```html
<!-- ✅ Replaces animated GIF: no audio, preload metadata only -->
<video autoplay loop muted playsinline preload="metadata"
       width="600" height="400">
  <source src="animation.webm" type="video/webm" />
  <source src="animation.mp4" type="video/mp4" />
</video>
```

`preload="metadata"` downloads only duration/dimensions, not full video. `muted` is required for autoplay in most browsers.

### User-Initiated Video

```html
<!-- ✅ preload="none" for content not immediately visible -->
<video controls preload="none" poster="thumbnail.webp"
       width="1280" height="720">
  <source src="talk.webm" type="video/webm" />
  <source src="talk.mp4" type="video/mp4" />
</video>
```

`poster` shows a static image before play — critical to prevent layout shift and provide visual placeholder.

### Lazy Load Video

```html
<video data-src="heavy-video.mp4" preload="none" poster="thumb.webp">
</video>

<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      observer.unobserve(video);
    }
  });
});
document.querySelectorAll('video[data-src]').forEach(v => observer.observe(v));
</script>
```

---

## Common Pitfalls

**Applying `loading="lazy"` to LCP image:** Delays the most important image. The LCP image should always load eagerly (default) with `fetchpriority="high"`.

**Missing `sizes` attribute with `srcset`:** Without `sizes`, the browser assumes the image fills 100vw and may download a 1200px image for a 300px slot.

**Not setting image dimensions on CMS images:** CMS-served images often lack explicit dimensions. Use CSS `aspect-ratio` as a fallback to prevent CLS.

**Converting PNG screenshots to WebP/AVIF lossy:** Text/screenshots need lossless encoding. Use `--lossless` flag or keep as PNG.

**Using GIFs:** GIFs have poor compression and no hardware decoding. Replace with `<video autoplay loop muted>` (WebM format).

---

## Related Topics

- [core-web-vitals.md](core-web-vitals.md) — LCP and CLS metrics affected by images
- [resource-optimization.md](resource-optimization.md) — Total page weight budgets
- [font-loading.md](font-loading.md) — Font loading patterns for CLS

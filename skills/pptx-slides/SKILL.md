---
name: pptx-slides
description: "Slide deck generation for PowerPoint and Google Slides using PptxGenJS. Trigger: When creating, editing, or planning presentation slides."
license: "Apache 2.0"
metadata:
  version: "1.0"
  type: domain
  skills:
    - interface-design
    - a11y
---

# Slides

Design and build slide decks that communicate clearly — one idea per slide, visuals over text, content adapted to audience and context.

## When to Use

- Creating a new slide deck from scratch
- Editing or restructuring an existing deck
- Choosing between Google Slides, PowerPoint, or Marp
- Planning slide content before building

Don't use for:

- Generating PowerPoint files programmatically (use PptxGenJS directly)
- Visual brand design from scratch (use `interface-design`)
- Accessibility audit of existing slides (use `a11y`)

---

## Critical Patterns

### ✅ REQUIRED: Content-First Workflow

Before building any slide, produce a deck outline. Never start in the slide tool.

```markdown
## Deck Outline: Q3 Product Roadmap

Audience: Engineering leads + product stakeholders
Goal: Align on 3 priorities for Q3 before sprint planning

1. Context — Market shift driving reprioritization
2. Priority 1 — Ship mobile checkout (revenue risk)
3. Priority 2 — Auth overhaul (compliance deadline)
4. Priority 3 — Deferred: search redesign → Q4
5. Ask — Approve resource reallocation by EOW
```

Outline fields:

- **Audience**: who is this for, what do they need to leave knowing?
- **Goal**: one sentence — what decision or action should this deck produce?
- **Slide list**: title + one-sentence key message per slide

Build slides only after the outline is confirmed.

### ✅ REQUIRED: One Idea Per Slide

Each slide carries exactly one message.

```markdown
# ❌ WRONG: Topic label title + information overload
## Q3 Roadmap

- We are considering mobile checkout because of revenue concerns
- The auth system needs to be overhauled due to compliance
- Search redesign was originally planned but is now deferred to Q4
- Resource reallocation is needed across all three areas

# ✅ CORRECT: Conclusion title + max 3 tight bullets
## Mobile checkout is the highest-revenue risk this quarter

- $2M ARR at risk if not shipped by Aug 1
- Team capacity: 3 engineers, 6-week window
- Dependency: Auth overhaul unblocks this
```

Rules:

- Slide title = the **conclusion**, not the topic
- Max 3-5 bullets per slide; each bullet ≤ 7 words
- If more than 5 bullets are needed, split into two slides
- Detail, caveats, and data go in presenter notes — not on the slide

### ✅ REQUIRED: Visual on Every Slide

Every slide must contain at least one visual element:

| Content type | Visual |
|---|---|
| Data or comparison | Chart, graph, or table |
| Process or flow | Diagram or arrow sequence |
| Concept or idea | Icon + short label pair |
| Product or UI | Screenshot with callouts |
| No clear data | Large bold typography as the visual |

Never use: generic stock photos, clip art, or decorative images with no informational purpose.

### ✅ REQUIRED: Text Density Rules

```markdown
# ❌ WRONG: Full-sentence bullet
- The system processes incoming requests by first validating the payload
  against the schema, then routing to the appropriate service handler,
  which returns a response or error code as appropriate.

# ✅ CORRECT: Short label bullets + notes for details
Validation gates every request

- Schema check → service router → response
- Failures return 400 immediately

[Presenter notes: See API spec §3.2 for full error code list]
```

Hard limits:

- Max **5 bullets** per slide
- Max **7 words** per bullet
- Max **2 typefaces** per deck (heading + body)
- No full sentences as bullets — fragments and labels only

### ✅ REQUIRED: Color System

```
Dominant color (60-70% visual weight) → backgrounds, large shapes, headers
Supporting tones (1-2 colors)         → section backgrounds, dividers, secondary text
Sharp accent (1 color)                → CTAs, key data points, emphasis only

❌ Never more than 4 colors total
❌ Never use accent for more than 10% of slide area
```

Always adapt to the project's existing brand palette. If none exists, derive a 2-tone palette from the project's domain (e.g., fintech → dark navy + gold accent; dev tooling → near-black + green).

### ✅ REQUIRED: Typography System

Font pairings and sizes for consistent, readable decks:

Use only Google Slides-safe fonts (available in both Google Slides and PowerPoint):

| Pairing | Heading | Body |
|---|---|---|
| Professional | Georgia | Arial |
| Bold & Modern | Arial Black | Arial |
| Classic | Oswald | Georgia |

Size scale:

```
Slide titles      → 36–44pt bold
Section headers   → 20–24pt bold
Body text         → 14–16pt regular
Captions / labels → 10–12pt regular
```

Rules:

- Max 2 typefaces per deck (heading + body)
- Never mix more than one pairing in a deck
- Set fonts explicitly — never rely on theme defaults

### ✅ REQUIRED: Spacing System

```
Slide margins      → 0.5" minimum on all sides
Content block gaps → 0.3–0.5" between elements
```

Rules:

- Maintain consistent gaps across all slides — random spacing signals AI generation
- Leave breathing room around visuals; never pack edge to edge
- Align all elements to an invisible grid (title zone / content zone / footer zone)

### ✅ REQUIRED: Format Selection

**Default output: PptxGenJS generates a `.pptx` file that works in both PowerPoint and Google Slides.** No installation needed — the AI produces runnable JavaScript that the user executes locally.

| Delivery target | Workflow |
|---|---|
| PowerPoint | Generate `.pptx` with PptxGenJS → open directly |
| Google Slides | Generate `.pptx` with PptxGenJS → File → Open → upload `.pptx` |
| Technical/code content, version control | Marp (Markdown) — not covered by this skill |

Use Google Slides-safe fonts whenever the deck may be imported into Google Slides (see Typography System).

### ✅ REQUIRED: PptxGenJS Technical Standards

When building `.pptx` files programmatically:

```javascript
// ✅ CORRECT: Set fonts explicitly — never rely on theme defaults
slide.addText("Title text", {
  fontFace: "Arial Black",
  fontSize: 40,
  bold: true,
  x: 0.5, y: 0.5, w: "90%", h: 1.2
});

// ❌ WRONG: Using fit/autoFit — causes inconsistent sizing
slide.addText("Title text", { autoFit: true });
```

Rules:

- Always set `fontFace` and `fontSize` explicitly on every text box
- Use helper functions for text sizing — never `fit` or `autoFit`
- Use PptxGenJS native bullet formatting — never literal `•` characters
- Implement overlap and bounds checking before delivery
- Deliverables: both the compiled `.pptx` file and editable source `.js`
- Slide dimensions: default 16:9 (13.33" × 7.5") unless source specifies otherwise
- Keep text as text and charts as native charts — preserve editability
- Use Google Slides-safe fonts only (Georgia, Arial, Arial Black, Oswald) — Calibri and Cambria are Office-only and will be substituted on import

**Delivering to Google Slides:**

```
1. Generate output.pptx with PptxGenJS
2. Go to Google Slides → File → Open → Upload → select output.pptx
3. Google Slides converts and preserves layout, fonts, and charts
```

For editing existing decks: extract text with `python -m markitdown file.pptx`, inspect raw XML with `unzip -d unpacked file.pptx`, manipulate, then repack.

### ✅ REQUIRED: Quality Assurance

After building any deck, run this validation loop before delivery:

```
Step 1 — Content check
  python -m markitdown output.pptx
  grep -i "xxxx\|lorem\|ipsum\|placeholder" extracted.md
  → Fix any placeholder text found

Step 2 — Visual check
  Convert slides to images (LibreOffice → PDF → PNG)
  Inspect each slide for: overlapping elements, text overflow,
  misalignment, low contrast, inconsistent spacing

Step 3 — Verify and repeat
  Fix issues → re-render → re-inspect until no new issues appear
```

Tools:

- `python -m markitdown` — extract all text from `.pptx`
- LibreOffice — convert `.pptx` to PDF for rendering
- Poppler (`pdftoppm`) — convert PDF to per-slide images

### ❌ NEVER: Slide Anti-Patterns

```
❌ Full sentences as bullets — forces audience to read, not listen
❌ More than 5 bullets per slide — information overload
❌ Title as a topic label — "Q3 Results" says nothing; use the conclusion
❌ Inconsistent fonts across slides — use 2 typefaces max
❌ Low-contrast text on busy backgrounds — maintain 4.5:1 ratio for text
❌ Animations on every element — use motion sparingly (slide transitions only)
❌ Generic "Thank you" closing slide — replace with the ask or key takeaway
❌ Starting slides before the outline is confirmed
❌ Accent lines under slide titles — hallmark of AI-generated slides; use whitespace or background color instead
❌ Centering body text — use left alignment for all body content
❌ Repeating the same layout on every slide — vary between two-column, icon+text, full visual, and stat callout layouts
```

---

## Decision Tree

```
Creating a new deck?
  → Define audience + goal → Build outline (1 idea per slide) → Then build slides

Editing an existing deck?
  → Audit text density (>5 bullets or full sentences = fix)
  → Add missing visuals → Sharpen titles to conclusions

Choosing format?
  → PowerPoint delivery → PptxGenJS → generate .pptx → open directly
  → Google Slides delivery → PptxGenJS → generate .pptx → upload to Google Slides
  → Technical or code content → Marp

Building any deck programmatically?
  → Use PptxGenJS → Google Slides-safe fonts only → Deliver .pptx + source .js
  → Run QA loop before delivery

Editing an existing .pptx file?
  → Extract text with markitdown → Inspect raw XML via unzip → Edit → Repack

Choosing a visual for a slide?
  → Data or comparison → chart or table
  → Process or flow → diagram or arrow sequence
  → Concept or idea → icon + short label
  → Product or UI → screenshot with callouts
  → No obvious type → large bold typography layout

Text too dense?
  → Apply 5-bullet max → Move details to presenter notes → Split slide if needed

Adapting to a project?
  → Use project color palette → Use project terminology → Match existing brand voice

Closing slide?
  → Replace "Thank you" with the ask or the single key takeaway

Ready to deliver?
  → Run markitdown → grep for placeholder text → visual QA on slide images → fix and repeat
```

---

## Example

Deck outline and two slides for a technical engineering kickoff.

```markdown
## Deck Outline: Auth Overhaul — Engineering Kickoff

Audience: Engineering team (10 devs)
Goal: Align on approach and unblock sprint 1 planning

1. Why now — Compliance deadline forces migration by Aug 1
2. What changes — Session tokens → short-lived JWTs
3. Migration path — 3 phases, backward compatible
4. Risks — Token refresh race condition; mitigation ready
5. Ask — Review RFC and approve by Friday

---

Slide 1: "Compliance deadline: migrate by Aug 1 or face audit"

Visual: Timeline (today → deadline, 8 weeks)
Bullets (3):
- Legal flagged current session storage as non-compliant
- Aug 1 hard deadline — no extension possible
- Scope: auth middleware only, no product surface changes

Presenter notes: Full legal memo in Confluence [link]

---

Slide 2: "Short-lived JWTs replace persistent session tokens"

Visual: Before/After diagram (session token flow vs JWT flow)
Bullets (2):
- Access token: 15 min TTL; refresh token: 7 days
- No DB session table — stateless verification

Presenter notes: RFC draft at github.com/org/repo/pull/42
```

---

## Edge Cases

**No existing brand palette:** Derive a 2-tone palette from the project domain and document it in the outline for consistency across slides.

**Data-heavy content:** Split into two slides — (1) insight slide with one chart (the conclusion), (2) detail slide with the full table (for reference). Never combine both.

**Presenter vs. standalone deck:** Standalone decks (emailed, no presenter) need slightly more text density and no presenter-only slides. Note this in the outline and adjust bullet depth accordingly.

**Code on slides:** Use a dark background code block, syntax-highlighted, max 10-15 visible lines. For longer code: link to the repo instead of scrolling.

**Mixed audience (technical + non-technical):** Lead each topic with the business conclusion slide, follow with the technical detail slide (clearly marked as optional depth). Never mix both on one slide.

---

## Checklist

- [ ] Deck outline produced before any slides are built
- [ ] Audience and goal defined in one sentence each
- [ ] Each slide title states the conclusion, not the topic
- [ ] Max 5 bullets per slide, each ≤ 7 words
- [ ] Every slide has at least one visual element
- [ ] Layouts varied across slides (not the same pattern on every slide)
- [ ] Color system: 1 dominant + 1-2 supporting + 1 accent (≤ 4 total)
- [ ] Typography: 2 typefaces max, sizes set explicitly (titles 36–44pt, body 14–16pt)
- [ ] Spacing: 0.5" margins, 0.3–0.5" gaps between content blocks
- [ ] Format chosen based on delivery context (Google Slides / PowerPoint)
- [ ] Detail and caveats in presenter notes, not on the slide
- [ ] No anti-patterns: no full sentences, no topic-label titles, no accent lines under titles, no generic closing
- [ ] (Programmatic) Fonts set explicitly — no fit/autoFit, native bullets, both .pptx + .js delivered
- [ ] (Programmatic) QA loop run: markitdown check + visual inspection + fix cycle complete

---

## Resources

- [interface-design](../interface-design/SKILL.md) — Visual hierarchy, color systems, typography
- [a11y](../a11y/SKILL.md) — Contrast ratios and accessible color choices

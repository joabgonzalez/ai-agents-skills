---
name: stagehand
description: "Browser automation and test orchestration. Trigger: When automating browser flows or test setup with Stagehand."
license: "Apache 2.0"
metadata:
  version: "1.1"
  type: tooling
  skills:
    - playwright
    - e2e-testing
  dependencies:
    stagehand: ">=1.0.0 <2.0.0"
---

# Stagehand

AI browser automation with natural language for interaction/extraction. Extends Playwright's `Page` object — key concepts: `page.goto(url)` navigates, `page.locator()` finds elements, `expect(locator).toBeVisible()` asserts. Stagehand adds `page.act()` (natural language actions) and `page.extract()` (structured data extraction) on top.

## When to Use

- Automating browser flows where selectors are fragile or unknown
- Extracting structured data from web pages
- Discovering page elements before writing precise selectors
- Don't use for: deterministic tests (playwright), static scraping, non-browser

---

## Critical Patterns

### ✅ REQUIRED: page.act() for AI-Driven Actions

Natural language instructions, Stagehand finds element and acts.

```typescript
// CORRECT: descriptive, single action
await page.act('Click the "Sign in" button');
await page.act('Type "user@example.com" into the email field');
// WRONG: vague or compound instruction
await page.act("Do the login thing");
await page.act("Fill the form and submit it");
```

### ✅ REQUIRED: page.extract() for Structured Data

Zod schema extracts typed data from page.

```typescript
import { z } from "zod";
const product = await page.extract({
  instruction: "Extract the product details from this page",
  schema: z.object({
    name: z.string(),
    price: z.number(),
    inStock: z.boolean(),
  }),
});
// WRONG: no schema (unstructured text)
const raw = await page.extract({ instruction: "Get product info" });
```

### ✅ REQUIRED: page.observe() for Element Discovery

Inspect AI view before act/extract calls.

```typescript
const actions = await page.observe("What actions are available?");
console.log(actions); // [{ description: "Sign in button", selector: "..." }]
await page.act("Click the sign in button");
```

### ✅ REQUIRED: Precise Prompting

One action per `act()`, specific nouns, quoted literals.

```typescript
// CORRECT: specific, single-step instructions
await page.act('Click the "Add to cart" button for "Wireless Mouse"');
// WRONG: ambiguous references
await page.act("Click the button");
```

### ✅ REQUIRED: Error Handling with Retries

Retry logic for AI actions on dynamic pages.

```typescript
async function actWithRetry(page: Page, instruction: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.act(instruction);
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### ✅ REQUIRED: Combining with Playwright for Hybrid Approach

Use Stagehand for discovery, then Playwright for stable execution.

```typescript
// Phase 1: Use Stagehand to discover elements
const actions = await page.observe("What buttons are on this page?");
console.log(actions); // [{ description: "Submit button", selector: "button[type=submit]" }]

// Phase 2: Use Playwright with discovered selectors for fast, stable tests
import { test as playwrightTest } from "@playwright/test";
playwrightTest("submit form", async ({ page }) => {
  await page.goto("/form");
  await page.locator("button[type=submit]").click(); // Fast, no LLM call
});

// WRONG: Using Stagehand in every test run (slow, costly, flaky)
test("submit form", async () => {
  await page.act("Click the submit button"); // LLM call on every run
});
```

### ✅ REQUIRED: Batch Extraction for Performance

Extract multiple data points in one call to reduce LLM requests.

```typescript
// CORRECT: Single extract call with comprehensive schema
const pageData = await page.extract({
  instruction: "Extract all product information from this page",
  schema: z.object({
    product: z.object({
      name: z.string(),
      price: z.number(),
      inStock: z.boolean(),
      reviews: z.array(
        z.object({
          author: z.string(),
          rating: z.number(),
          text: z.string(),
        }),
      ),
    }),
  }),
});

// WRONG: Multiple extracts (slow, 4 LLM requests)
const name = await page.extract({
  instruction: "Get product name",
  schema: z.object({ name: z.string() }),
});
const price = await page.extract({
  instruction: "Get price",
  schema: z.object({ price: z.number() }),
});
const inStock = await page.extract({
  instruction: "Check if in stock",
  schema: z.object({ inStock: z.boolean() }),
});
const reviews = await page.extract({
  instruction: "Get reviews",
  schema: z.object({ reviews: z.array(z.any()) }),
});
```

---

## Decision Tree

```
Known, stable selectors?
  → Use playwright directly instead

Selectors unknown or fragile?
  → Use page.observe() then page.act()

Need structured data?
  → Use page.extract() with a Zod schema

Action keeps failing?
  → Make the instruction more specific, add retries

Exploring unfamiliar page?
  → Start with page.observe() to map elements

Building deterministic tests?
  → Prototype with Stagehand, convert to Playwright
```

---

## Example

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

const stagehand = new Stagehand({ env: "LOCAL" });
await stagehand.init();
const page = stagehand.page;
await page.goto("https://news.ycombinator.com");
const stories = await page.extract({
  instruction: "Extract the top 5 story titles and their URLs",
  schema: z.object({
    stories: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
        }),
      )
      .max(5),
  }),
});
console.log(stories);
await stagehand.close();
```

---

## Edge Cases

- **Dynamic SPAs**: Call `page.observe()` after navigation or state changes to re-index the DOM. Stagehand doesn't automatically detect SPA route changes.

- **Ambiguous elements**: Add context like "the first", "in the header", or quote exact visible text: `await page.act('Click the "Sign in" link in the navigation bar')`.

- **Rate limiting**: Stagehand makes LLM calls per `act()` and `extract()`. Batch multiple data points into one `extract()` call with a comprehensive schema to reduce API calls.

- **Long pages**: Scroll first with `page.act('Scroll down to the pricing section')` before extracting off-screen content. Stagehand's vision is limited to viewport.

- **Iframes/popups**: Stagehand operates on the main frame by default. Use Playwright's `page.frame()` or `page.context().pages()` to switch context manually for iframes or popups.

- **Non-English pages**: Include the language in instructions: `await page.act('Click the button labeled "Enviar" (Spanish for Submit)')`. LLM models handle multilingual content well when prompted.

- **Authentication flows**: For multi-step auth (2FA, CAPTCHA), combine Stagehand for initial steps with Playwright's `storageState` to save auth tokens and skip login in subsequent runs.

- **Cost optimization**: Each `act()` and `extract()` call costs LLM tokens. Prototype with Stagehand, then convert stable flows to Playwright selectors using `page.observe()` to discover selectors.

- **Stale element detection**: If page updates after `observe()`, re-run `observe()` before `act()`. Stagehand doesn't track DOM mutations automatically.

- **Complex multi-step forms**: Break into discrete `act()` calls with verification between steps: `await page.act('Fill email field with "user@example.com"')`, then `await page.act('Fill password field with "pass123"')`, not `await page.act('Fill and submit the form')`.

---

## Checklist

- [ ] Each `act()` call contains a single, specific instruction
- [ ] All `extract()` calls include a Zod schema for type safety
- [ ] Retry logic wraps actions on dynamic pages
- [ ] `observe()` is used first when exploring unfamiliar pages
- [ ] Literal text values are quoted in instructions
- [ ] Stable flows use Playwright directly -- Stagehand is for AI flexibility

---

## Resources

- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Stagehand GitHub Repository](https://github.com/browserbase/stagehand)
- [Zod Schema Library](https://zod.dev/)

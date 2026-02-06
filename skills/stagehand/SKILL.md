---
name: stagehand
description: "Browser automation and test orchestration. Trigger: When automating browser flows or test setup with Stagehand."
license: "Apache 2.0"
metadata:
  version: "1.0"
  skills:
    - conventions
    - typescript
    - javascript
    - playwright
  dependencies:
    stagehand: ">=1.0.0 <2.0.0"
---
# Stagehand Skill
AI-powered browser automation that uses natural language instructions to interact with and extract data from web pages.
## When to Use
- Automating browser flows where selectors are fragile or unknown
- Extracting structured data from web pages
- Discovering page elements before writing precise selectors
- Don't use for: deterministic test suites (use playwright), static API scraping, non-browser automation
## Critical Patterns
### page.act() for AI-Driven Actions
Describe what you want in natural language -- Stagehand finds the element and performs the action.
```typescript
// CORRECT: descriptive instruction, single clear action
await page.act('Click the "Sign in" button');
await page.act('Type "user@example.com" into the email field');
// WRONG: vague or compound instruction
await page.act('Do the login thing');
await page.act('Fill the form and submit it');
```
### page.extract() for Structured Data
Define a Zod schema and let Stagehand pull typed data from the page.
```typescript
import { z } from 'zod';
const product = await page.extract({
  instruction: 'Extract the product details from this page',
  schema: z.object({
    name: z.string(), price: z.number(), inStock: z.boolean(),
  }),
});
// WRONG: no schema -- returns unstructured text you must parse
const raw = await page.extract({ instruction: 'Get product info' });
```
### page.observe() for Element Discovery
Inspect what the AI sees on the page before writing act or extract calls.
```typescript
const actions = await page.observe('What actions are available?');
console.log(actions); // [{ description: "Sign in button", selector: "..." }]
await page.act('Click the sign in button');
```
### Precise Prompting
One action per `act()`, specific nouns, and quoted literal values produce reliable results.
```typescript
// CORRECT: specific, single-step instructions
await page.act('Click the "Add to cart" button for "Wireless Mouse"');
// WRONG: ambiguous references
await page.act('Click the button');
```
### Error Handling with Retries
Wrap actions in retry logic -- AI-driven actions can fail on dynamic pages.
```typescript
async function actWithRetry(page: Page, instruction: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { await page.act(instruction); return; }
    catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```
## Decision Tree
- Known, stable selectors? -> Use **playwright** directly instead
- Selectors unknown or fragile? -> Use `page.observe()` then `page.act()`
- Need structured data? -> Use `page.extract()` with a Zod schema
- Action keeps failing? -> Make the instruction more specific, add retries
- Exploring unfamiliar page? -> Start with `page.observe()` to map elements
- Building deterministic tests? -> Prototype with Stagehand, convert to Playwright
## Example
```typescript
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

const stagehand = new Stagehand({ env: 'LOCAL' });
await stagehand.init();
const page = stagehand.page;
await page.goto('https://news.ycombinator.com');
const stories = await page.extract({
  instruction: 'Extract the top 5 story titles and their URLs',
  schema: z.object({
    stories: z.array(z.object({
      title: z.string(), url: z.string(),
    })).max(5),
  }),
});
console.log(stories);
await stagehand.close();
```
## Edge Cases
- **Dynamic SPAs**: Call `page.observe()` after navigation to re-index the DOM.
- **Ambiguous elements**: Add context like "the first" or quote exact visible text.
- **Rate limiting**: Stagehand makes LLM calls per action -- batch reads into one `extract()`.
- **Long pages**: Scroll first with `page.act('Scroll down to the pricing section')`.
- **Iframes/popups**: Stagehand operates on the main frame; switch context manually.
- **Non-English pages**: Include the language, e.g., "Click the button labeled 'Enviar'".
## Checklist
- [ ] Each `act()` call contains a single, specific instruction
- [ ] All `extract()` calls include a Zod schema for type safety
- [ ] Retry logic wraps actions on dynamic pages
- [ ] `observe()` is used first when exploring unfamiliar pages
- [ ] Literal text values are quoted in instructions
- [ ] Stable flows use Playwright directly -- Stagehand is for AI flexibility
## Resources
- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Stagehand GitHub Repository](https://github.com/browserbase/stagehand)
- [Zod Schema Library](https://zod.dev/)

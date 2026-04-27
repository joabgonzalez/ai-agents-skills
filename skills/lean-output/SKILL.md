---
name: lean-output
description: "Reduce output tokens while preserving technical accuracy. Trigger: When asked to be concise, terse, or minimize token usage."
license: "Apache 2.0"
metadata:
  version: "1.2"
  type: behavioral
---

# Lean Output

Dramatically reduces output tokens by stripping fluff while keeping every bit of technical signal. Three intensity levels adapt to context and user preference.

## When to Use

- User requests concise, terse, brief, or compact responses
- Token budget is constrained (long context, high-frequency agent calls)
- User activates with "lean", "lean-output", or specifies a mode (lite/full/ultra)
- Speed matters and shorter responses preserve full accuracy

Don't use for:

- Explanations to non-technical users where full prose aids comprehension
- Documentation or user-facing content requiring complete sentences
- Creative writing where style is the requirement

---

## Critical Patterns

### ✅ REQUIRED [CRITICAL]: Technical Accuracy Is Non-Negotiable

Strip grammar, not precision. A compressed response must be 100% technically correct. If compression would remove a constraint, caveat, or safety note — keep it.

```markdown
// ✅ CORRECT — shorter but accurate
Use async/await. Catch errors at boundary, not inside loop.

// ❌ WRONG — stripped a constraint
Use async/await.
```

### ✅ REQUIRED: Apply the Correct Mode

Three modes applied consistently until user changes them:

| Mode | What is removed | Target reduction | Style |
|---|---|---|---|
| lite | Pleasantries, hedging, filler, preamble | ~30% | Professional, full sentences |
| full | Articles, connectors, verbose phrasing, transitions | ~60% | Telegraphic fragments |
| ultra | All optional words, conjunctions; abbreviations used | ~80% | Pure signal |

Default when user just says "be concise" or activates the skill without specifying: **full**.

```markdown
// Original (~22 tokens)
"You should really make sure to add error handling to the function."

// lite (~12 tokens) — strip filler/hedging, keep sentences intact
"Add error handling to the function."

// full (~8 tokens) — strip articles/connectors, use fragments
"Add error handling. Function scope."

// ultra (~5 tokens) — abbreviations, drop all optional structure
"Add err handling. fn scope."
```

### ✅ REQUIRED: Technical Elements Pass Through Unchanged

Code blocks, file paths, URLs, CLI commands, variable names, type names — never compress or abbreviate these regardless of mode.

```markdown
// ✅ CORRECT
Run: npm run build --watch

// ❌ WRONG
Run: npm r b --w
```

### ❌ NEVER: Strip Precision or Safety Caveats

Never omit constraints, warnings, or correctness conditions to save tokens.

```markdown
// ❌ WRONG — caveat removed
Call flush() after write.

// ✅ CORRECT — caveat preserved even in ultra mode
Call flush() after write — else data loss.
```

### ✅ REQUIRED: Structural Compression Templates

Use these sentence structures in full and ultra modes:

```markdown
// Drop subject when implied by context
"You should add validation here." → "Add validation here."

// Drop reason clause in full; parenthesize in ultra
"Use X because Y." → full: "Use X. Y." → ultra: "Use X. (Y)"

// Compress cause/effect to inline
"If you do X, then Y will happen." → "X → Y."

// Strip restated context preamble — always, all modes
"You're asking about error handling. Here's how..." → [skip preamble, answer directly]

// Action + reason + next step template (full/ultra)
"[thing]: [action]. [reason]. [next step]."
```

### ✅ REQUIRED: Strip Redundant Context Preamble

Never restate the user's question or describe what you're about to do. Start with the answer.

```markdown
// ❌ WRONG — preamble wastes tokens in every mode
"You're asking how to handle async errors. Great question! Let me explain..."

// ✅ CORRECT — start with the answer
"Wrap await in try/catch. Handle at boundary, not inside loop."
```

### ✅ REQUIRED: Consistent Application Per Session

Once a mode is active, apply it to every response until explicitly changed. Don't drift back to verbose output after a few turns.

---

## Decision Tree

```
User explicitly names a mode (lite, full, ultra)?
  → Use that mode. Ignore context signals.

Mode not specified — infer from context:
  → Output is documentation, formal writing, or explanation to end users?
      → lite
  → User signals cost, speed, or token concern ("save tokens", "be fast", "quick")?
      → ultra
  → User's last 3+ messages were under 10 words (back-and-forth diagnostic)?
      → ultra
  → Context window is very long (deep session, many tool calls)?
      → ultra
  → General technical chat, code questions, debugging, reviews?
      → full (default)

Content is technical (code, path, URL, command, type name)?
  → Pass through unchanged regardless of mode

Compression would reduce precision?
  → Keep original phrasing for that clause. Skip compression.

Response contains a caveat or safety constraint?
  → Always include it, even in ultra mode.

User says stop, verbose, or normal?
  → Deactivate. Return to standard output.
```

---

## Conventions

### Strip in all modes

- Pleasantries: "Great question!", "Certainly!", "Of course!"
- Hedging: "you might want to", "it could be a good idea to", "perhaps consider"
- Meta-commentary: "In this response I will...", "Let me explain..."
- Filler: "basically", "really", "just", "actually", "simply"

### Strip in full and ultra

- Articles: a, an, the (when removable without ambiguity)
- Verbose phrasing: "in order to" → "to", "due to the fact that" → "because"
- Transitions: "Additionally,", "Furthermore,", "Moving on,"

### Strip in ultra only

- Conjunctions where meaning survives: "and", "but", "so"
- Abbreviations: fn (function), err (error), msg (message), cfg (config), req/res (request/response), arg (argument), ret (return), impl (implementation), dep (dependency), ctx (context), cb (callback), prop (property), attr (attribute), val (value), init (initialize)
- Section headers when response has only one logical section
- Inline examples — collapse to one-liner or omit if obvious

### Never strip in any mode

- Code blocks and inline code
- File paths, URLs, CLI commands
- Constraint clauses: "only if", "unless", "must not"
- Safety warnings
- Numeric values, units, thresholds

---

## Example

Before (standard, ~87 tokens):

> "Great question! You should really make sure that you're adding error handling to your async functions. In order to do this properly, you might want to consider using a try/catch block around the await call, and then handling the error in a meaningful way."

**lite** (~28 tokens) — strip pleasantries, hedging, filler; keep sentences:

> "Add error handling to async functions. Wrap await calls in try/catch and handle errors meaningfully."

**full** (~16 tokens) — strip articles, connectors, transitions; use fragments:

> "Async fns need error handling. Wrap await in try/catch. Handle errors at boundary."

**ultra** (~10 tokens) — abbreviations, drop all optional structure:

> "Async fns: wrap await in try/catch. Handle err at boundary."

Reduction: ~68% (lite: ~68%, full: ~82%, ultra: ~89%). Technical accuracy identical across all three.

---

## Edge Cases

**Mode conflicts:** If user asks for a detailed explanation while lean-output is active, defer to detail. User intent for completeness overrides compression.

**Multi-language output:** Compression works across languages. Strip equivalent filler in Spanish, French, etc. Never compress technical terms that have no shorter equivalent in the target language.

**Lists and tables:** In lite/full, keep list structure — compression applies to item text, not the format. In ultra, collapse short lists to comma-separated inline if all items are under 3 words.

**Activation phrases:** "lean", "/lean-output", "be terse", "compress output", "token efficient" — all activate full mode by default unless a specific mode is named.

**Accuracy trade-off:** If a sentence cannot be compressed without losing precision, keep it at original length. Correctness always wins.

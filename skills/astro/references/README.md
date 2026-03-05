# Astro Skill References

> Detailed guides for SSG, SSR, Hybrid strategies, client directives, content collections, and actions

## Overview

This directory contains detailed guides for specific aspects of Astro development. Main [SKILL.md](../SKILL.md) provides critical patterns and decision tree. These references offer deep-dives into rendering strategies, content management, and interactivity patterns.

---

## Quick Navigation

### Rendering Strategies

| Reference                                    | Purpose                                                 | Read When                                               |
| -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| [ssg-patterns.md](ssg-patterns.md)           | Static Site Generation, getStaticPaths, build-time data | Building static sites, blogs, documentation             |
| [ssr-patterns.md](ssr-patterns.md)           | Server-Side Rendering, Astro.locals, server endpoints   | Building dynamic pages, authentication, personalization |
| [hybrid-strategies.md](hybrid-strategies.md) | Mixing SSG + SSR, migration paths                       | Combining static and dynamic pages                      |

### Interactivity & Content

| Reference                                        | Purpose                                        | Read When                                           |
| ------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------- |
| [client-directives.md](client-directives.md)     | client:load/visible/idle/only patterns         | Adding interactivity with minimal JavaScript        |
| [content-collections.md](content-collections.md) | Content layer, Markdown/MDX, type-safe content | Managing blog posts, documentation, or CMS content  |
| [actions.md](actions.md)                         | Server actions, form handling, validation      | Implementing form submissions and server-side logic |
| [composition.md](composition.md)                 | Named slots, fallback content, slot conditions | Building reusable layout components with slots      |

### Performance & Advanced Features

| Reference                                            | Purpose                                                          | Read When                                                         |
| ---------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| [client-navigation.md](client-navigation.md)         | Prefetching strategies, page transitions, combined navigation    | Optimizing perceived performance and implementing smooth nav      |
| [middleware.md](middleware.md)                       | Authentication, logging, request interception                    | Adding auth, logging, or modifying requests/responses             |
| [env-variables.md](env-variables.md)                 | Secrets management, .env files, type-safe config                 | Managing API keys, configuration across environments              |

---

## Reading Strategy

### For Static Sites (SSG-only)

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [ssg-patterns.md](ssg-patterns.md) for getStaticPaths and dynamic routes
3. CHECK: [content-collections.md](content-collections.md) if managing content
4. CHECK: [client-directives.md](client-directives.md) for minimal interactivity

### For Dynamic Sites (SSR)

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [ssr-patterns.md](ssr-patterns.md) for server context and endpoints
3. CHECK: [actions.md](actions.md) for form handling
4. CHECK: [hybrid-strategies.md](hybrid-strategies.md) for mixing with static pages

### For Hybrid Applications

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [hybrid-strategies.md](hybrid-strategies.md) for SSG + SSR decision making
3. **MUST read**: [ssg-patterns.md](ssg-patterns.md) AND [ssr-patterns.md](ssr-patterns.md)
4. CHECK: [content-collections.md](content-collections.md) and [actions.md](actions.md)

### For Content-Heavy Sites

1. Read main [SKILL.md](../SKILL.md)
2. **MUST read**: [content-collections.md](content-collections.md) for type-safe content
3. CHECK: [ssg-patterns.md](ssg-patterns.md) for content rendering
4. CHECK: [client-directives.md](client-directives.md) for search/filters

---

## File Descriptions

### [ssg-patterns.md](ssg-patterns.md)

**Static Site Generation patterns and best practices**

- getStaticPaths for dynamic routes
- Build-time data fetching
- Static API generation
- Pagination strategies
- Incremental regeneration patterns

### [ssr-patterns.md](ssr-patterns.md)

**Server-Side Rendering with adapters**

- Astro.locals for server context
- Server endpoints (GET/POST/PUT/DELETE)
- Authentication and sessions
- Database queries on request
- Caching strategies

### [hybrid-strategies.md](hybrid-strategies.md)

**Combining SSG and SSR effectively**

- When to use SSG vs SSR
- Migration from SSG to Hybrid
- Per-page rendering decisions
- Performance considerations
- Edge cases and gotchas

### [client-directives.md](client-directives.md)

**Client-side hydration strategies**

- client:load (immediate)
- client:visible (lazy load)
- client:idle (low priority)
- client:only (CSR only)
- client:media (responsive)
- Performance comparisons

### [content-collections.md](content-collections.md)

**Type-safe content management**

- Defining content schemas
- Markdown and MDX frontmatter
- Querying collections
- Content relationships
- Dynamic routing with content

### [actions.md](actions.md)

**Server actions and form handling**

- Defining actions
- Form validation
- Error handling
- File uploads
- Progressive enhancement

### [composition.md](composition.md)

**Slot-based component composition**

- Default and named `<slot>` elements
- Fallback content when slot is empty
- Conditional slot rendering with `Astro.slots.has()`
- Layout components with multiple slot regions

### [client-navigation.md](client-navigation.md)

**Prefetching and View Transitions for optimized navigation**

- Prefetch strategies (hover, tap, viewport, load)
- Global prefetch configuration and performance optimization
- View Transitions setup with `<ViewTransitions />`
- Transition directives (persist, animate, name)
- Custom animations and lifecycle events
- Combined prefetch + View Transitions patterns
- Accessibility and Save Data mode considerations

### [middleware.md](middleware.md)

**Request/response interception**

- Authentication and authorization
- Request logging and analytics
- Redirects and rewrites
- Headers and cookies management
- Middleware chains with sequence()

### [env-variables.md](env-variables.md)

**Environment variables and secrets management**

- .env file configuration
- PUBLIC\_ prefix for client-side variables
- Environment-specific files
- TypeScript type-safety
- Validation with Zod
- Security best practices

---

## Cross-Reference Map

- [ssg-patterns.md](ssg-patterns.md) → Provides in-depth static generation patterns referenced in the SKILL.md decision tree's "Static output" branch
- [ssr-patterns.md](ssr-patterns.md) → Provides in-depth server rendering patterns referenced in the SKILL.md decision tree's "Server output" branch
- [hybrid-strategies.md](hybrid-strategies.md) → Bridges ssg-patterns.md and ssr-patterns.md; referenced when SKILL.md recommends hybrid rendering
- [client-directives.md](client-directives.md) → Extends SKILL.md's "Islands Architecture" critical pattern with full directive options
- [content-collections.md](content-collections.md) → Extends SKILL.md content guidance; pairs with ssg-patterns.md for content-driven static sites
- [actions.md](actions.md) → Extends SKILL.md's form handling patterns; pairs with ssr-patterns.md for server-side logic
- [composition.md](composition.md) → Extends SKILL.md's component composition patterns with slot-based techniques
- [client-navigation.md](client-navigation.md) → Extends SKILL.md's navigation patterns; combines prefetching and View Transitions for optimized UX
- [middleware.md](middleware.md) → Extends SKILL.md's server patterns; pairs with ssr-patterns.md for auth and request handling
- [env-variables.md](env-variables.md) → Applies to all rendering strategies; covers secrets management referenced in SKILL.md
- Related skills: [react](../../react/SKILL.md), [tailwindcss](../../tailwindcss/SKILL.md), [typescript](../../typescript/SKILL.md)

# State Machines Pattern — References

Supporting implementation references for the state-machines-pattern skill.

## Quick Navigation

| File | Purpose |
|------|---------|
| [xstate-patterns.md](./xstate-patterns.md) | XState v5 machine definition, actor model, model-based testing, parallel states |
| [react-state-machines.md](./react-state-machines.md) | useReducer machines, form wizard, async fetch machine, useMachine hook |

---

## Reading Strategy

Start with **xstate-patterns.md** if you are reaching for a library. Start with **react-state-machines.md** if you are in a React project and want minimal-dependency solutions first.

Recommended sequence for library adoption:

1. `react-state-machines.md` — understand the patterns without a library
2. `xstate-patterns.md` — adopt XState v5 when library features are justified

Recommended sequence for XState users:

1. `xstate-patterns.md` — machine definition, actors, guards, parallel states
2. `react-state-machines.md` — `useMachine` integration in React components

---

## File Descriptions

**xstate-patterns.md** — XState v5 TypeScript patterns. Covers `createMachine` with typed context and events, the `createActor()` actor model (XState v5 API), model-based testing with `@xstate/test`, parallel states for concurrent workflows, and strongly typed guards and actions.

**react-state-machines.md** — React-specific state machine implementations. Covers `useReducer` as a minimal state machine (no library), a multi-step form wizard using FILLING/VALIDATING/SUBMITTING states, an async data fetching machine with IDLE/LOADING/SUCCESS/ERROR, and the `useMachine` hook from `@xstate/react` for library integration.

---

## Cross-Reference Map

```
xstate-patterns.md
  └── XState v5 docs          → https://stately.ai/docs
  └── @xstate/test            → model-based testing
  └── parallel states         → see also circuit-breaker-pattern (3-state machine)

react-state-machines.md
  └── useReducer              → React built-in; no extra dependencies
  └── useMachine              → requires @xstate/react
  └── form wizard pattern     → pairs with form validation libraries (zod, yup)
  └── async fetch machine     → see also result-pattern skill for error handling
```

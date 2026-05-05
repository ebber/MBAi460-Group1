---
name: Inspect before writing — always
description: Before authoring any artifact (spec, config, doc, code), inspect the existing surface it will reference or extend. Read first. Then write. Never write from memory then verify after.
type: feedback
---

**Rule:** Before authoring any new artifact — test spec, config, doc, code — inspect the existing surface it will reference or extend. Read first. Then write. Always. Do not write from memory then verify after.

**Why:** Erik named the principle 2026-05-04 during a Playwright E2E workstream phase boundary. The motivating context: an agent had completed Phase B by inspecting LoginScreen / AssetCard / AssetDetail / App.tsx / photoappApi.ts before writing the specs. Erik's instruction generalizes that posture into a discipline: do this every time, not just when uncertain.

The deeper reason: writing-from-memory creates two risks. (1) The memory might be wrong — a reasonable-sounding selector or assertion or path can pass cargo-cult correctness checks while diverging from reality. (2) Even if the memory is right today, the surface might shift tomorrow; inspecting at write time reads ground truth instead of stale recall.

This was demonstrated as load-bearing later the same session when the agent shipped a `playwright show-report` instruction in run-docs without first inspecting whether the Playwright config had the HTML reporter enabled (it didn't). The instruction failed; the principle exists exactly to suppress that pattern.

**How to apply:**

- **Tests:** before writing a spec, grep the components / endpoints / fixtures it targets. Confirm selector existence, prop shapes, return types, route handlers.
- **Configs:** before authoring a YAML / JSON / TOML config that extends an existing system, read the system's config consumer (which keys it reads, what defaults).
- **Docs:** before adding to a tracker / plan / journal / memory, read recent existing entries to absorb format conventions.
- **Code:** before adding a function / module that will be called by existing code, read the call site contract first.
- **Cross-checkout migrations:** before copying / cp'ing / referencing artifacts from another checkout, inspect both endpoints (source has what's expected; destination is the right path).
- **Run-instructions:** before writing "run command X to see output Y", verify the config that produces Y is actually configured. Don't ship run-docs that haven't been verified end-to-end at least once.

**Anti-patterns to suppress:**

- "I remember the selector is `data-testid='asset-card'` from the plan" → grep first; the existing pattern was `asset-card-${assetid}`.
- "The auth store probably exposes `useUIStore` on window" → read the store first; confirms it doesn't.
- "Most React projects have `getByRole('button')` work for submit buttons" → read the actual JSX first; could be a `<div role="button">` or a Tailwind shim.
- "I'll write the doc to match Style X then verify after" → read existing siblings first; the format is in the conventions.
- "`show-report` should work because it's a default Playwright command" → check the config first; HTML reporter must be enabled to write the report directory.

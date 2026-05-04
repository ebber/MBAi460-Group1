---
name: Inspect before writing — always
description: Before authoring any artifact (spec, config, doc, code), inspect the existing surface it will reference or extend. Never write from memory then verify after.
type: feedback
status: PROPOSED — under consideration; promote to MetaFiles/Offered_Memories/ at Phase F if it earns its place via Aggregate Memory Check
originSession: 2026-05-04 Playwright E2E Phase B close-out (B↔B-sidecar boundary)
---

**Rule:** Before authoring any new artifact — test spec, config, doc, code — inspect the existing surface it will reference or extend. Read first. Then write. Always. Do not write from memory then verify after.

**Why:** Erik named the principle 2026-05-04 at the B↔B-sidecar boundary review. The motivating context: I had just completed Phase B by inspecting `LoginScreen.tsx` (form structure, store exposure), `AssetCard.tsx` (existing testids, data-kind), `AssetDetail.tsx` (label rendering, image element), `App.tsx` (routes), and `photoappApi.ts` (URL helper) **before** writing the specs — exactly the right pattern. Erik's instruction generalizes that posture into a discipline: do this every time, not just when uncertain.

The deeper reason: writing-from-memory creates two risks. (1) The memory might be wrong — a reasonable-sounding selector or assertion or path can pass cargo-cult correctness checks while diverging from reality. (2) Even if the memory is right today, the surface might shift tomorrow; inspecting at write time reads ground truth instead of stale recall.

**How to apply:**

- **Tests:** before writing a spec, grep the components / endpoints / fixtures it targets. Confirm selector existence, prop shapes, return types, route handlers.
- **Configs:** before authoring a YAML / JSON / TOML config that extends an existing system, read the system's config consumer (which keys it reads, what defaults).
- **Docs:** before adding to a tracker / plan / journal / memory, read recent existing entries to absorb format conventions.
- **Code:** before adding a function / module that will be called by existing code, read the call site contract first.
- **Cross-checkout migrations:** before copying / cp'ing / referencing artifacts from another checkout, inspect both endpoints (source has what's expected; destination is the right path).

**Anti-patterns to suppress:**

- "I remember the selector is `data-testid="asset-card"` from the plan" → grep first; the existing pattern was `asset-card-${assetid}`.
- "The auth store probably exposes `useUIStore` on window" → read the store first; confirms it doesn't.
- "Most React projects have `getByRole('button')` work for submit buttons" → read the actual JSX first; could be a `<div role="button">` or a Tailwind shim.
- "I'll write the doc to match Style X then verify after" → read existing siblings first; the format is in the conventions.

**Cluster relationship to existing memos:**

- `feedback_read_before_locking.md` (in claude-workspace, scoped to Class Project sphere): "when authoring tests/docs that pin literal SQL/shapes/paths/versions, read source first." This memo is broader — applies to ALL artifact authoring, not just literal pins. Could compress with read_before_locking into one principle ("Read before writing — both literal-pinning and structural authorship") if both pass Aggregate Memory Check.

**Aggregate Memory Check status (pending Phase F):**

- Cluster Test: distinct from `feedback_root_grounded_cross_refs` (path style); related to `feedback_read_before_locking` (broader generalization candidate).
- Retrieval Test: would I know to load this when starting any creative artifact authoring? Yes if the description names the trigger clearly.
- Compression Test: candidate for compression with `feedback_read_before_locking` into a single read-before-writing principle. Decision deferred to Aggregate Memory Check.
- Load Test: foundational — applies to most session activity. Worth carrying.
- Tension Test: no obvious conflict with other memos. Reinforces Adversarial Phase 2 stance from `feedback_refresh_ritual` (don't trust memory; verify against ground truth).

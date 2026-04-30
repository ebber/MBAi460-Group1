---
name: Stay strictly within owned scope during cleanup/verification
description: When the user has named an owned scope (e.g., a tempDir clone), do not cross out — even for read-only verification
type: feedback
originSessionId: 1e15db51-7353-4e14-aeea-749705958a24
---
When operating under a named owned scope (e.g., "this is a local simulation in tempDir/", "we own this clone only"), keep ALL actions — including read-only verification probes — strictly within that scope. Do NOT reach out to sibling clones, primary working trees, or broad filesystem sweeps to "verify nothing leaked," even when motivated by scope-safety reasoning.

**Why:** Erik corrected this 2026-04-30 during a sim spin-down. His stance: if traces accidentally landed outside scope earlier in the session, those are now Out Of Scope / out of our purview and assumed to have already been noticed by whoever owns that scope. Re-touching them — even read-only — re-engages the agent with territory that isn't ours, which is itself a scope violation.

**How to apply:**
- During verification/cleanup phases, list checks that are in-scope-only first; if a check requires reaching outside scope, surface it as a question ("would you like me to also verify X?") rather than executing.
- "Read-only" is not a sufficient justification for crossing scope boundaries. The boundary is the boundary regardless of operation type.
- When the user names their scope explicitly (path, clone, directory), treat it as a hard wall.
- Earlier in-session probes of out-of-scope locations don't justify re-probing them later — they're spilled milk; clean substrate matters going forward.

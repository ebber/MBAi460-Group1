---
name: Inner-function naming for retry-wrappable units — clarity-via-naming for retry boundaries
description: Name every retry-wrappable inner unit explicitly (validate_user, insert_with_transaction, try_get_labels), then wrap with retry; the function name acts as a docstring at the retry boundary
type: feedback
---

When wrapping a code block with retry logic (e.g., `pRetry`, `tenacity`, custom retry decorators), **extract the block as a named inner function** rather than retrying an anonymous lambda or an entire request handler.

**Why:** Clarity-via-naming for *where retry happens*. A reader sees `pRetry(() => validate_user())` and knows the retry scope is *just user validation*, not the entire request handler. The inner function name acts as a docstring at the retry boundary, encoding the operational scope without requiring a separate comment. Without naming, retry scope is implicit — reviewers must trace the lambda body to understand what's being retried + when.

**Pattern source:** `feat/p02-gradescope-mvp` branch (andrew-apple, 2026-05-04). Handler files name every retry-wrappable unit explicitly: `validate_user()`, `insert_with_transaction()`, `clear_db()`, `try_get_labels()`, `try_search()`, `try_get_images()`. Each is then wrapped with `pRetry(() => fn(), {retries: 2})`. The naming convention (`try_<noun>` for read-side retries; verb_noun for state-changing operations) is consistent across files.

**How to apply:**
- Before wrapping anything with retry logic, ask: "what's the operational unit being retried?" Name it accordingly (`fetch_user`, `record_payment_attempt`, `query_label_index`)
- Pull the block into a named inner function — even if it's only used once, the name carries information
- Naming convention suggestions: `try_<noun>` for idempotent reads; `verb_noun` for state-changing operations
- For Python: same shape with `tenacity` (`@retry` decorator on a named function, not a lambda)
- The pattern composes well with `feedback_spec_citation_pattern.md` — comment at the retry boundary citing why retry is appropriate (e.g., "// PDF: 'rekognition may return 503 under burst'")

**Adjacent memories:**
- `feedback_spec_citation_pattern.md` — citing spec at decision points (retry boundaries are decision points)

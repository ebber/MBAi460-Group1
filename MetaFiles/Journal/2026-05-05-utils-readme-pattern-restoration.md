# 2026-05-05 — utils/ README pattern restoration

## What landed

`MBAi460-Group1/utils/` now has a `README.md` (commit `9c80dac`). The 21 operational scripts (Docker lifecycle, AWS scanning, DB tooling, security/rotation, Phase 0 validation, helpers) are inventoried by category with purpose, when-to-use, auth, and notes. Linked from the Structure table in `MBAi460-Group1/README.md`.

This restores the pattern already in use elsewhere in the repo: `infra/`, `lib/photoapp-server/`, `visualizations/`, `MetaFiles/`, and `MetaFiles/Offered_Memories/` all carry their own README. `utils/` was the outlier; now it's not.

## Why this matters for collaborators

Walking into `MBAi460-Group1/utils/` previously meant 21 unannotated scripts. The leading comment headers are good (96% coverage, 50% comprehensive — a self-doc audit ran during this session), but a reader had to either `head` each file or grep `MetaFiles/QUICKSTART.md` for breadcrumbs. The new README is the canonical index.

## Two follow-ups queued

Both surfaced by the self-doc audit:

- **Fix `Erik-AWS-Scan` leading comment header** — the only util with no leading comment block. ~5 min edit.
- **`--help` flag harmonization across utils** — currently 0/26 utils support `--help`. Two design options sketched in the queue entry; either takes 0/26 to 26/26 in one PR.

Both live at the bottom of `MetaFiles/TODO.md` § Active (commit `95a306c`).

## Bundled prior work

The same commit (`95a306c`) also captured two pre-existing pending edits to `MetaFiles/TODO.md`:

- `[Test/DB] validate-db assets-empty drift` closed (Phase 2.10 Step 13 rebuild-db side effect; 27/27 PASS)
- `[Project02/Security] Full credential rotation post-grading` queued (Phase 2.10 Step 12 closeout)

Bundling was deliberate and authorized — the commit message documents the scope.

## What didn't change

No script-side changes. No Project02 spaces touched. The READMEs describe what already exists; they don't add functionality.

# Class Project MetaFiles

Coordination layer for the MBAi 460 Class Project (MBAi460-Group1/).
Contains governing philosophy, durable design docs, and the active TODO queue.

## Contents

| File | Purpose |
|------|---------|
| `Manifesto-AWS-Lab-Sanctum.md` | Governing principles for the AWS Lab — what intentionally insecure means and why |
| `Future-State-Ideal-Lab.md` | Long-term design target for the Lab — security, observability, IaC maturity |
| `TODO.md` | Active ActionQueue for Class Project level items |

## What belongs here

- Decisions and principles that span multiple labs or projects
- Items that require design or architectural discussion before execution
- Cross-cutting concerns (VCS strategy, multi-agent coordination, shared infra policy)

## What does NOT belong here

- Assignment-specific notes → live in the lab or project folder
- Agent memory → `claude-workspace/memory/`
- Lab-root concerns → `MetaFiles/` at repo root

## MetaFiles Convention

MetaFiles exist for **active conceptual scopes** — folders that carry design decisions, coordination, or open work beyond their file contents. Their presence signals that a scope is conceptually alive.

Lightweight structural containers (`labs/`, `projects/`) do not get MetaFiles. They are groupings, not scopes.

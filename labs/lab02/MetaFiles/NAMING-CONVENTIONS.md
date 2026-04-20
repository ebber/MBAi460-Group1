# Naming Conventions — Lab / Project Shared Standard

> Cross-agent reference. Update this file when a new naming decision is made so all agents stay consistent.
> Maintained in `labs/lab02/MetaFiles/` as the established home for cross-lab meta docs.

---

## MySQL Users

**Pattern:** `{service}-{role}` — lowercase, hyphen-separated

| User | Service | Role | Permissions |
|------|---------|------|-------------|
| `photoapp-read-only` | photoapp | read-only | SELECT, SHOW VIEW on `photoapp.*` |
| `photoapp-read-write` | photoapp | read-write | SELECT, SHOW VIEW, INSERT, UPDATE, DELETE, DROP, CREATE, ALTER on `photoapp.*` |
| `shorten-app` | shorten (Lab02 URL shortener) | app (single user, rw) | SELECT, INSERT, UPDATE, DELETE on `URL_Shortener.*` |

**Decision log:**
- `photoapp-*` pattern established in `projects/project01/create-photoapp.sql`
- `shorten-app` established 2026-04-16: single app user (no read/read-write split) because Lab02 has one API doing all operations
- Role names: `read-only`, `read-write`, `app` — use `app` when a single user covers all access levels

---

## MySQL Databases

**Pattern:** No single enforced pattern yet — use descriptive names

| Database | Convention used |
|----------|----------------|
| `photoapp` | lowercase, no separator |
| `URL_Shortener` | capitalized words, underscore separator |

> ⚠️ These two are inconsistent. Recommend standardizing to `snake_case` (e.g., `url_shortener`) in future work. Not yet enforced — flagged for discussion.

---

## AWS Resources

**Pattern:** `{service}-{owner}-{course}` for globally-scoped resources (S3); `{service}-{role}` for scoped resources

| Resource | Name | Pattern |
|----------|------|---------|
| S3 bucket | `photoapp-erik-mbai460` | `{service}-{owner}-{course}` |
| RDS identifier | `photoapp-db` | `{service}-{role}` |
| Security group | `photoapp-rds-sg` | `{service}-{target}-{type}` |

---

## General Rules

- Hyphens for AWS resources and MySQL users (not underscores)
- Underscores for Python variables and Terraform resource names (snake_case)
- Ask Erik before naming any new AWS resource, IAM identity, RDS identifier, or database — naming rule is a hard convention in this lab
